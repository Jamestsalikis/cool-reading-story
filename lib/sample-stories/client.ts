'use client';

// Client-side sample-story loader for the native app. Mirrors ./server.ts but
// loads templates via dynamic import (bundled by the build) instead of fs, so
// the app can serve a free user's first book from the curated samples — no AI.
// The chosen+personalised story is handed to the app-generate edge function,
// which decides whether to use it (free + first book only) and does the
// metering + image generation server-side.

import type { SampleStory, ChildProfile, TrialInterest } from './index';
import { TRIAL_INTERESTS } from './index';
export { isTrialInterest } from './index';

const cache = new Map<string, SampleStory | null>();

async function loadStory(key: string): Promise<SampleStory | null> {
  if (cache.has(key)) return cache.get(key)!;
  try {
    // Template literal import → webpack bundles every .json in this folder into
    // an async chunk and resolves the right one at runtime.
    const mod = await import(`./${key}.json`);
    const story = (mod.default ?? mod) as SampleStory;
    cache.set(key, story);
    return story;
  } catch {
    cache.set(key, null);
    return null;
  }
}

function personalise(story: SampleStory, child: ChildProfile | string): SampleStory {
  const profile: ChildProfile = typeof child === 'string' ? { name: child } : child;
  let storyStr = JSON.stringify(story);

  storyStr = storyStr.replace(/\{\{NAME\}\}/g, profile.name);

  if (profile.hairColour && profile.eyeColour) {
    storyStr = storyStr.replace(
      /with [^,"\\]+ and [^,"\\]+ eyes/g,
      `with ${profile.hairColour} hair and ${profile.eyeColour} eyes`
    );
  }

  if (profile.skinColour) {
    const skinToneMap: Record<string, string> = {
      White: 'fair/light skin',
      Tanned: 'light tan skin',
      'Semi Brown': 'warm medium-brown skin',
      Brown: 'deep brown skin',
    };
    const skinDesc = skinToneMap[profile.skinColour] || `${profile.skinColour} skin`;
    storyStr = storyStr.replace(
      /\b(fair\/light skin|light tan skin|warm medium-brown skin|deep brown skin|[a-z]+ skin tone|[a-z]+ skin)\b/gi,
      skinDesc
    );
  }

  if (profile.gender) {
    const genderWord = profile.gender === 'Girl' ? 'girl' : profile.gender === 'Boy' ? 'boy' : null;
    if (genderWord) {
      storyStr = storyStr.replace(/young (boy|girl)/g, `young ${genderWord}`);
      if (genderWord === 'boy') storyStr = storyStr.replace(/young princess/g, 'young prince');
    }
  }

  const sibling = profile.siblings?.[0];
  if (sibling?.name) {
    storyStr = storyStr.replace(/\{\{SIBLING_NAME\}\}/g, sibling.name);
  }
  const friend = profile.friends?.[0];
  if (friend?.name) {
    storyStr = storyStr.replace(/\{\{FRIEND_NAME\}\}/g, friend.name);
  }

  return JSON.parse(storyStr);
}

/** Personalised sample story for the interest(s) + reading level, or null. */
export async function getSampleStoryClient(
  interests: string | string[],
  child: ChildProfile | string,
  readingLevel?: string
): Promise<SampleStory | null> {
  const arr = (Array.isArray(interests) ? interests : [interests])
    .filter((i): i is TrialInterest => (TRIAL_INTERESTS as readonly string[]).includes(i))
    .sort()
    .slice(0, 3);
  if (arr.length === 0) return null;

  const seen = new Set<string>();
  const keys: string[] = [];
  const add = (k: string) => { if (!seen.has(k)) { seen.add(k); keys.push(k); } };

  if (readingLevel) {
    for (let n = arr.length; n >= 1; n--) {
      add(arr.slice(0, n).map((i) => i.toLowerCase()).join('_') + `_${readingLevel}`);
    }
  }
  for (let n = arr.length; n >= 1; n--) {
    add(arr.slice(0, n).map((i) => i.toLowerCase()).join('_'));
  }

  for (const key of keys) {
    const story = await loadStory(key);
    if (story) return personalise(story, child);
  }
  return null;
}
