import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── Prompt constants (must match generate-image/route.ts exactly) ──────────────
const TALEPOP_MODEL_VERSION = 'ed9efee4f91699baee3016842252c496041cff8151ade67273167d4a66e02432'

const TALEPOP_STYLE_PREFIX =
  'TALEPOP, Pixar 3D CGI animated film render, NOT 2D illustration, NOT flat art, NOT vector art, NOT cel shading. ' +
  'Subsurface skin scattering, volumetric rim lighting, specular eye highlights, ' +
  'smooth rounded cartoon anatomy, large expressive eyes, vibrant saturated jewel-tone colours, ' +
  'shallow depth of field, warm cinematic lighting, magical storybook atmosphere, ' +
  'professional Disney Pixar animated feature film quality. '

const TALEPOP_STYLE_SUFFIX =
  'No floating limbs, no disconnected body parts, clean natural anatomy and proportions. ' +
  'Each animal and character has exactly one head — no duplicate or extra heads anywhere. ' +
  'Every character and creature shown with their complete full body visible — no cropped torsos, no cut-off limbs, entire figure from head to feet or tail always in frame. ' +
  'No text, no words, no letters in the image.'

const ANCHOR_SPLIT_MARKER = 'professional Disney Pixar animated feature film quality. '

function storyIdToSeed(storyId: string): number {
  let hash = 0
  for (let i = 0; i < storyId.length; i++) {
    hash = (Math.imul(31, hash) + storyId.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 2147483647
}

function extractCharacterLine(characterAnchor: string | null): string {
  if (!characterAnchor) return ''
  const splitIdx = characterAnchor.indexOf(ANCHOR_SPLIT_MARKER)
  if (splitIdx !== -1) return characterAnchor.slice(splitIdx + ANCHOR_SPLIT_MARKER.length).trim()
  return characterAnchor.trim()
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// A page needs an image if it has a prompt and no permanent (Supabase Storage) image yet.
// Pages carrying an expiring replicate.delivery URL are treated as still-needing-images so
// they get regenerated rather than left pointing at a URL that 404s within ~1h.
// deno-lint-ignore no-explicit-any
function pageNeedsImage(p: any): boolean {
  if (!p.image_prompt) return false
  if (!p.image_url) return true
  return String(p.image_url).includes('replicate.delivery')
}

// ── Core worker ──────────────────────────────────────────────────────────────
async function generateAllImages(storyId: string, replicateToken: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: story } = await supabase
    .from('stories')
    .select('pages, character_anchor')
    .eq('id', storyId)
    .single()

  if (!story) {
    console.error('[generate-story-images] Story not found:', storyId)
    return
  }

  const pages = story.pages || []
  const characterLine = extractCharacterLine(story.character_anchor)
  const characterFragment = characterLine ? `${characterLine} ` : ''
  // Only process pages that still need images (missing or pointing at an expiring URL)
  // deno-lint-ignore no-explicit-any
  const pagesNeedingImages = pages.filter((p: any) => pageNeedsImage(p))

  console.log(`[generate-story-images] ${pagesNeedingImages.length} pages to generate for story ${storyId}`)

  // deno-lint-ignore no-explicit-any
  for (const page of pagesNeedingImages) {
    try {
      const finalPrompt = `${TALEPOP_STYLE_PREFIX}${characterFragment}${page.image_prompt} ${TALEPOP_STYLE_SUFFIX}`
      const seed = storyIdToSeed(storyId + '_p' + String(page.page_number))

      // ── 1. Start Replicate prediction ─────────────────────────────────────
      let pollUrl: string | null = null
      for (let attempt = 0; attempt < 2; attempt++) {
        if (attempt > 0) await sleep(5000)
        const createRes = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${replicateToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            version: TALEPOP_MODEL_VERSION,
            input: { prompt: finalPrompt, num_outputs: 1, aspect_ratio: '2:3', output_format: 'webp', output_quality: 80, seed },
          }),
        })
        if (createRes.status === 429) { console.log('[generate-story-images] Replicate 429, retrying...'); continue }
        if (!createRes.ok) { console.error('[generate-story-images] Replicate error:', createRes.status); break }
        const prediction = await createRes.json()
        if (prediction.urls?.get) { pollUrl = prediction.urls.get; break }
      }

      if (!pollUrl) {
        console.error(`[generate-story-images] No poll URL for page ${page.page_number}, skipping`)
        continue
      }

      // ── 2. Poll until done (max 120s = 40 × 3s) ──────────────────────────
      let imageUrl: string | null = null
      for (let i = 0; i < 40; i++) {
        await sleep(3000)
        const pollRes = await fetch(pollUrl, { headers: { 'Authorization': `Bearer ${replicateToken}` } })
        if (!pollRes.ok) { console.error(`[generate-story-images] Poll non-OK: ${pollRes.status}`); break }
        const polled = await pollRes.json()

        if (polled.status === 'succeeded' && polled.output?.[0]) {
          // ── 3. Download + upload to Supabase Storage (with retry) ─────────
          try {
            const imgRes = await fetch(polled.output[0])
            if (imgRes.ok) {
              const imgBuffer = await imgRes.arrayBuffer()
              const filePath = `${storyId}/page-${page.page_number}.webp`
              let uploaded = false
              for (let up = 0; up < 3 && !uploaded; up++) {
                if (up > 0) await sleep(2000)
                const { error: uploadError } = await supabase.storage
                  .from('story-images')
                  .upload(filePath, imgBuffer, { contentType: 'image/webp', upsert: true })
                if (!uploadError) {
                  const { data: { publicUrl } } = supabase.storage.from('story-images').getPublicUrl(filePath)
                  imageUrl = publicUrl
                  uploaded = true
                } else {
                  console.error(`[generate-story-images] Upload error (attempt ${up + 1}):`, uploadError.message)
                }
              }
              // GUARD: never persist the expiring Replicate URL. If the upload ultimately
              // failed, leave image_url null so the page stays pending and can be
              // regenerated, rather than saving a URL that 404s within ~1h.
              if (!uploaded) imageUrl = null
            }
          } catch (e) {
            console.error('[generate-story-images] Image fetch/upload error:', e)
            imageUrl = null
          }
          break
        }

        if (polled.status === 'failed') {
          console.error(`[generate-story-images] Prediction failed for page ${page.page_number}:`, polled.error)
          break
        }
        // still processing — keep polling
      }

      // ── 4. Save image_url to DB (re-fetch pages first to avoid races) ────
      if (imageUrl) {
        const { data: freshStory } = await supabase.from('stories').select('pages').eq('id', storyId).single()
        if (freshStory) {
          // deno-lint-ignore no-explicit-any
          const updatedPages = freshStory.pages.map((p: any) =>
            p.page_number === page.page_number ? { ...p, image_url: imageUrl, poll_url: null } : p
          )
          await supabase.from('stories').update({ pages: updatedPages }).eq('id', storyId)
          console.log(`[generate-story-images] Page ${page.page_number} saved for story ${storyId}`)
        }
      }
    } catch (e) {
      console.error(`[generate-story-images] Uncaught error on page ${page.page_number}:`, e)
    }
  }

  console.log(`[generate-story-images] All pages done for story ${storyId}`)
}

// ── HTTP handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { story_id, replicate_token } = await req.json()

    if (!story_id || !replicate_token) {
      return new Response(JSON.stringify({ error: 'story_id and replicate_token required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      })
    }

    // Use EdgeRuntime.waitUntil to respond immediately and process in background.
    // deno-lint-ignore no-explicit-any
    const runtime = (globalThis as any).EdgeRuntime
    if (runtime?.waitUntil) {
      runtime.waitUntil(generateAllImages(story_id, replicate_token))
      return new Response(JSON.stringify({ status: 'started', story_id }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Fallback: synchronous
    await generateAllImages(story_id, replicate_token)
    return new Response(JSON.stringify({ status: 'completed', story_id }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (e) {
    console.error('[generate-story-images] Handler error:', e)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }
})
