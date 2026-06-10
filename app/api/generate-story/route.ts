import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkGenerationAllowed, decrementStoryCount } from '@/lib/subscription';
import { getSampleStory, isTrialInterest } from '@/lib/sample-stories/server';
import { parseBody, generateStorySchema } from '@/lib/validation';
import { buildPrompt } from '@/lib/story-prompt';

// Story text generation is handled by the Supabase Edge Function (generate-story-text).
// This Next.js route only does fast work: auth, paywall, child data, sample story lookup.
// For premium users needing fresh stories, it creates a placeholder and fires the edge fn.
export const maxDuration = 10;

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { child_id } = await parseBody(request, generateStorySchema);

    // Paywall check
    const paywallResult = await checkGenerationAllowed(supabase, user.id, user.email);
    if (!paywallResult.allowed) {
      return NextResponse.json(
        { error: 'paywall', reason: paywallResult.reason },
        { status: 402 }
      );
    }

    // Fetch child profile
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('*')
      .eq('id', child_id)
      .eq('parent_id', user.id)
      .single();

    if (childError || !child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Free user per-child gate: each child gets exactly one free story.
    // Once has_used_free_story is true, that child can't generate again until subscribed.
    if (paywallResult.reason === 'free') {
      if (child.has_used_free_story) {
        return NextResponse.json(
          { error: 'paywall', reason: 'free_exhausted' },
          { status: 402 }
        );
      }
    }

    // Per-child daily limit: each child can only receive 1 story per day.
    // Exception: if the parent has purchased extra books today (99c each), those
    // raise the daily ceiling. When an extra book is consumed, decrement the counter.
    let consumedExtraBook = false;
    if (paywallResult.reason === 'subscribed') {
      const { data: subRecord } = await supabase
        .from('user_subscriptions')
        .select('extra_books_today')
        .eq('user_id', user.id)
        .single();
      const extraBooksAvailable = subRecord?.extra_books_today ?? 0;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count: storiesForChildToday } = await supabase
        .from('stories')
        .select('id', { count: 'exact', head: true })
        .eq('child_id', child_id)
        .gte('created_at', todayStart.toISOString());
      if ((storiesForChildToday ?? 0) >= 1) {
        if (extraBooksAvailable <= 0) {
          return NextResponse.json(
            { error: `${child.name} already has a story for today. Each child gets one story per day.` },
            { status: 429 }
          );
        }
        // Using an extra book slot — flag for decrement after generation
        consumedExtraBook = true;
      }
    }

    // --- PRE-GENERATED TRIAL STORY SHORTCUT ---
    // Free users get a static sample story for their FIRST book only — no Claude API call.
    // Books 2 and 3 are AI-generated so each feels unique and personal.
    const { data: subData } = await supabase
      .from('user_subscriptions')
      .select('status, free_stories_remaining')
      .eq('user_id', user.id)
      .single();

    const isFreeUser = !subData || subData.status !== 'subscribed';
    // For cache lookup: use the first interest that matches a trial interest.
    // This ensures a custom interest added first doesn't bypass the cache for free users.
    const allInterests = (child.interests || []) as string[];
    const primaryInterest = allInterests.find(i => isTrialInterest(i)) || allInterests[0] || '';

    // Only serve cached story if this child has no stories yet (first book only)
    const { count: existingStoryCount } = await supabase
      .from('stories')
      .select('id', { count: 'exact', head: true })
      .eq('child_id', child_id);
    const isFirstBook = (existingStoryCount ?? 0) === 0;

    if (isFreeUser && isTrialInterest(primaryInterest) && isFirstBook) {
      const appearance = (child.appearance || {}) as Record<string, string>;
      const siblings = Array.isArray(appearance.siblings) ? appearance.siblings : [];
      const friends = Array.isArray(appearance.friends) ? appearance.friends : [];
      const sampleStory = getSampleStory(allInterests, {
        name: child.name,
        age: child.age,
        gender: child.gender,
        hairColour: appearance.hairColour,
        eyeColour: appearance.eyeColour,
        skinColour: appearance.skinColour,
        siblings,
        friends,
      }, child.reading_level);
      if (sampleStory) {
        const pagesForDB = sampleStory.pages.map((page) => ({
          ...page,
          image_url: null,
          poll_url: null,
        }));
        const fullContent = pagesForDB.map((p) => p.content).join('\n\n');
        const { data: story, error: storyError } = await supabase
          .from('stories')
          .insert({
            child_id,
            parent_id: user.id,
            title: sampleStory.title,
            content: fullContent,
            moral: sampleStory.moral,
            theme: sampleStory.theme_emoji,
            word_count: sampleStory.word_count,
            reading_time_minutes: Math.ceil((sampleStory.word_count || 400) / 150),
            pages: pagesForDB,
            input_tokens: 0,
            output_tokens: 0,
            character_anchor: sampleStory.character_anchor,
            is_sample: true,
          })
          .select()
          .single();
        if (storyError) {
          console.error('Sample story save error:', storyError);
          return NextResponse.json({ error: 'Failed to save story' }, { status: 500 });
        }
        await decrementStoryCount(supabase, user.id, paywallResult.reason, child_id);
        if (consumedExtraBook) {
          const { data: sr } = await supabase.from('user_subscriptions').select('extra_books_today').eq('user_id', user.id).single();
          await supabase.from('user_subscriptions').update({ extra_books_today: Math.max(0, (sr?.extra_books_today ?? 1) - 1) }).eq('user_id', user.id);
        }
        return NextResponse.json({ story });
      }
    }
    // --- END PRE-GEN SHORTCUT ---

    // Fetch this child's previous story titles so Claude can avoid repeating them
    const { data: prevStories } = await supabase
      .from('stories')
      .select('title')
      .eq('child_id', child_id)
      .order('created_at', { ascending: false })
      .limit(10);
    const previousTitles = (prevStories || []).map((s: { title: string }) => s.title).filter(Boolean);

    // Build the prompt here (in Next.js where the helper lives)
    const prompt = buildPrompt({
      name: child.name,
      age: child.age,
      gender: child.gender || 'child',
      interests: child.interests || [],
      appearance: child.appearance || {},
      reading_level: child.reading_level || 'intermediate',
    }, previousTitles);

    // Hand off to the Supabase Edge Function which calls Claude Sonnet with no timeout.
    // The edge function inserts a placeholder story, responds immediately with story_id,
    // then generates the full story + images in the background via EdgeRuntime.waitUntil.
    const edgeRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-story-text`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          child_id,
          parent_id: user.id,
          anthropic_api_key: process.env.ANTHROPIC_API_KEY,
          replicate_token: REPLICATE_API_TOKEN,
          child_appearance: child.appearance || {},
        }),
      }
    );

    if (!edgeRes.ok) {
      const errText = await edgeRes.text();
      console.error('[generate-story] Edge function error:', errText);
      return NextResponse.json({ error: 'Story generation failed' }, { status: 500 });
    }

    const { story_id } = await edgeRes.json();
    if (!story_id) {
      return NextResponse.json({ error: 'Story generation failed — no story ID returned' }, { status: 500 });
    }

    // Decrement story quota now that story record is confirmed created
    await decrementStoryCount(supabase, user.id, paywallResult.reason, child_id);
    if (consumedExtraBook) {
      const { data: sr } = await supabase.from('user_subscriptions').select('extra_books_today').eq('user_id', user.id).single();
      await supabase.from('user_subscriptions').update({ extra_books_today: Math.max(0, (sr?.extra_books_today ?? 1) - 1) }).eq('user_id', user.id);
    }

    // Return minimal story object — client navigates to /stories/{id} and polls for content
    return NextResponse.json({
      story: {
        id: story_id,
        title: 'Writing your story…',
        pages: [],
        children: { name: child.name, age: child.age },
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;

    console.error('Story generation error:', error);
    return NextResponse.json({ error: 'Story generation failed' }, { status: 500 });
  }
}







