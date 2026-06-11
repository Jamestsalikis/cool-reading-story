import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SKIN_TONE_MAP: Record<string, string> = {
  'White': 'fair/light skin',
  'Tanned': 'light tan skin',
  'Semi Brown': 'warm medium-brown skin',
  'Brown': 'deep brown skin',
}

// Sequel metadata. When present, this run is a series continuation: the placeholder
// already carries the series fields, and the character anchor is reused verbatim from
// the earlier volumes (no repair) so the hero stays identical across the series.
interface SequelMeta {
  series_id: string
  series_title: string
  volume_number: number
  character_anchor: string
}

// After Claude returns the character_anchor, guarantee the correct skin colour
// and hair colour are present. Claude sometimes drifts from the template.
// deno-lint-ignore no-explicit-any
function repairCharacterAnchor(anchor: string, childAppearance: Record<string, any>, childName: string): string {
  if (!anchor) return anchor

  const skinColour = childAppearance?.skinColour as string | undefined
  const hairColour = childAppearance?.hairColour as string | undefined

  // Fix skin colour: replace whatever Claude wrote after "with" up to the comma
  // e.g. "with fair/light skin," or "with Brown skin," → correct description
  if (skinColour && SKIN_TONE_MAP[skinColour]) {
    const correctSkin = SKIN_TONE_MAP[skinColour]
    // Replace any "with <something> skin" pattern
    anchor = anchor.replace(/with\s+[\w\/\s-]+?skin(?=,|\s)/i, `with ${correctSkin}`)
    // If no skin mention at all, inject after the child's name+age pattern
    if (!anchor.includes(correctSkin) && !anchor.toLowerCase().includes('skin')) {
      anchor = anchor.replace(
        new RegExp(`(${childName}[^,]*,)`),
        `$1 ${correctSkin},`
      )
    }
  }

  // Fix hair colour: if hairColour is provided and not mentioned, inject it
  if (hairColour && !anchor.toLowerCase().includes(hairColour.toLowerCase())) {
    // Try to insert hair after the skin description
    anchor = anchor.replace(
      /(skin[,]?\s*)/i,
      `$1${hairColour} hair, `
    )
  }

  return anchor
}

async function generateStoryContent(
  storyId: string,
  prompt: string,
  anthropicApiKey: string,
  replicateToken: string,
  supabaseUrl: string,
  serviceRoleKey: string,
  // deno-lint-ignore no-explicit-any
  childAppearance: Record<string, any>,
  childName: string,
  sequel: SequelMeta | null,
) {
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    console.log(`[generate-story-text] Calling Claude Sonnet for story ${storyId}${sequel ? ' (sequel vol ' + sequel.volume_number + ')' : ''}`)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[generate-story-text] Claude API error:', response.status, err.slice(0, 300))
      await supabase.from('stories').update({
        title: 'Story generation failed — please try again',
        content: 'error',
      }).eq('id', storyId)
      return
    }

    const message = await response.json()
    const rawContent = message.content?.[0]?.type === 'text' ? message.content[0].text : ''
    const inputTokens = message.usage?.input_tokens ?? 0
    const outputTokens = message.usage?.output_tokens ?? 0
    console.log(`[generate-story-text] Tokens: ${inputTokens} in, ${outputTokens} out`)

    // Parse JSON from Claude
    // deno-lint-ignore no-explicit-any
    let storyData: any
    try {
      const cleaned = rawContent.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
      storyData = JSON.parse(cleaned)
    } catch (e) {
      console.error('[generate-story-text] JSON parse error:', e, rawContent.slice(0, 200))
      await supabase.from('stories').update({
        title: 'Story generation failed — please try again',
        content: 'error',
      }).eq('id', storyId)
      return
    }

    if (sequel) {
      // Series continuation: keep the anchor reused verbatim from the earlier volumes
      // (the sequel prompt does not return one). This keeps the hero identical.
      storyData.character_anchor = sequel.character_anchor
    } else if (storyData.character_anchor) {
      // First-of-series / standalone: guarantee correct skin/hair colour in the anchor.
      // Claude sometimes drifts from the template — this is a hard override.
      const originalAnchor = storyData.character_anchor
      storyData.character_anchor = repairCharacterAnchor(storyData.character_anchor, childAppearance, childName)
      if (storyData.character_anchor !== originalAnchor) {
        console.log(`[generate-story-text] Repaired character_anchor for ${childName}`)
      }
    }

    // deno-lint-ignore no-explicit-any
    const pagesForDB = storyData.pages.map((page: any) => ({
      ...page,
      image_url: null,
      poll_url: null,
    }))
    const fullContent = pagesForDB.map((p: any) => p.content).join('\n\n')

    // Update placeholder with real story data. Series fields (series_id/title/volume)
    // were set on the placeholder insert for sequels and are intentionally not touched here.
    const { error: updateError } = await supabase.from('stories').update({
      title: storyData.title,
      content: fullContent,
      moral: storyData.moral,
      theme: storyData.theme_emoji,
      word_count: storyData.word_count,
      reading_time_minutes: Math.ceil((storyData.word_count || 500) / 150),
      pages: pagesForDB,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      character_anchor: storyData.character_anchor || null,
    }).eq('id', storyId)

    if (updateError) {
      console.error('[generate-story-text] DB update error:', updateError.message)
      return
    }

    console.log(`[generate-story-text] Story ${storyId} saved, triggering images`)

    // Trigger image generation
    await fetch(`${supabaseUrl}/functions/v1/generate-story-images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ story_id: storyId, replicate_token: replicateToken }),
    })

    console.log(`[generate-story-text] Done for story ${storyId}`)
  } catch (e) {
    console.error('[generate-story-text] Uncaught error:', e)
    await supabase.from('stories').update({
      title: 'Story generation failed — please try again',
      content: 'error',
    }).eq('id', storyId).catch(() => {})
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  try {
    const { prompt, child_id, parent_id, anthropic_api_key, replicate_token, child_appearance, sequel } = await req.json()

    if (!prompt || !child_id || !parent_id || !anthropic_api_key || !replicate_token) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Fetch child name for repair logic (appearance already passed in payload)
    const { data: child } = await supabase
      .from('children')
      .select('name')
      .eq('id', child_id)
      .single()
    const childName = child?.name || ''
    const appearance = child_appearance || {}

    const sequelMeta: SequelMeta | null =
      sequel && sequel.series_id && sequel.character_anchor && sequel.volume_number
        ? sequel as SequelMeta
        : null

    // Insert placeholder immediately. For sequels, carry the series fields + reused
    // anchor so the row is correct (and shelf-groupable) while the text is written.
    const placeholder = {
      child_id,
      parent_id,
      title: sequelMeta ? 'Writing the next chapter…' : 'Writing your story…',
      content: '',
      moral: '',
      theme: '✨',
      word_count: 0,
      reading_time_minutes: 5,
      pages: [],
      input_tokens: 0,
      output_tokens: 0,
      character_anchor: sequelMeta ? sequelMeta.character_anchor : null,
      ...(sequelMeta ? {
        series_id: sequelMeta.series_id,
        series_title: sequelMeta.series_title,
        volume_number: sequelMeta.volume_number,
      } : {}),
    }

    const { data: story, error: insertError } = await supabase
      .from('stories')
      .insert(placeholder)
      .select()
      .single()

    if (insertError || !story) {
      console.error('[generate-story-text] Placeholder insert error:', insertError)
      return new Response(JSON.stringify({ error: 'Failed to create story record' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      })
    }

    // deno-lint-ignore no-explicit-any
    const runtime = (globalThis as any).EdgeRuntime
    if (runtime?.waitUntil) {
      runtime.waitUntil(
        generateStoryContent(story.id, prompt, anthropic_api_key, replicate_token, supabaseUrl, serviceRoleKey, appearance, childName, sequelMeta)
      )
    } else {
      await generateStoryContent(story.id, prompt, anthropic_api_key, replicate_token, supabaseUrl, serviceRoleKey, appearance, childName, sequelMeta)
    }

    return new Response(JSON.stringify({ story_id: story.id }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('[generate-story-text] Handler error:', e)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
})
