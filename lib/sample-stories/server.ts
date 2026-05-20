import fs from 'fs';
import path from 'path';
import type { SampleStory, ChildProfile, TrialInterest } from './index';
import { TRIAL_INTERESTS } from './index';

// Re-export for convenience so route only needs one import path
export { isTrialInterest } from './index';

// In-memory cache — populated on first use, persists for the serverless instance lifetime
const storyCache = new Map<string, SampleStory | null>();

/**
 * Load a story JSON by key (e.g. "animals", "animals_dinosaurs", "animals_dinosaurs_fairies").
 * Reads from disk once then caches in memory.
 */
function loadStory(key: string): SampleStory | null {
  if (storyCache.has(key)) return storyCache.get(key)!;
  try {
    const filePath = path.join(process.cwd(), 'lib', 'sample-stories', `${key}.json`);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const story = JSON.parse(raw) as SampleStory;
    storyCache.set(key, story);
    return story;
  } catch {
    storyCache.set(key, null);
    return null;
  }
}

function personalise(story: SampleStory, child: ChildProfile | string): SampleStory {
  const profile: ChildProfile = typeof child === 'string' ? { name: child } : child;
  let storyStr = JSON.stringify(story);

  // 1. Replace name placeholder
  storyStr = storyStr.replace(/\{\{NAME\}\}/g, profile.name);

  // 2. Personalise appearance — matches "with [hair desc] and [colour] eyes"
  if (profile.hairColour && profile.eyeColour) {
    storyStr = storyStr.replace(
      /with [^,"\\]+ and [^,"\\]+ eyes/g,
      `with ${profile.hairColour} hair and ${profile.eyeColour} eyes`
    );
  }

  // 2b. Inject skin tone into character_anchor (replaces any skin tone phrase)
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

  // 3. Personalise gender descriptor
  if (profile.gender) {
    const genderWord = profile.gender === 'Girl' ? 'girl' : profile.gender === 'Boy' ? 'boy' : null;
    if (genderWord) {
      storyStr = storyStr.replace(/young (boy|girl)/g, `young ${genderWord}`);
      if (genderWord === 'boy') {
        storyStr = storyStr.replace(/young princess/g, 'young prince');
      }
    }
  }

  // 4. Personalise sibling references with actual names
  const sibling = profile.siblings?.[0];
  if (sibling?.name) {
    const sName = sibling.name;
    // Replace generic sibling references with the actual name
    storyStr = storyStr
      .replace(/\\b(his|her|their) (older |younger |little |big )?(brother|sister)\\b/gi,
        (_, pronoun, mod, role) => `${pronoun} ${mod || ''}${role} ${sName}`.replace(/\\s+/g, ' '))
      .replace(/\\b(his|her|their) sibling\\b/gi, (_, p) => `${p} sibling ${sName}`)
      .replace(/\{\{SIBLING_NAME\}\}/g, sName);
  }

  // 5. Personalise friend references with actual names
  const friend = profile.friends?.[0];
  if (friend?.name) {
    const fName = friend.name;
    storyStr = storyStr
      .replace(/\\b(his|her|their) (best )?friend\\b/gi,
        (_, pronoun, best) => `${pronoun} ${best || ''}friend ${fName}`.replace(/\\s+/g, ' '))
      .replace(/\{\{FRIEND_NAME\}\}/g, fName);
  }

  return JSON.parse(storyStr);
}

/**
 * Returns a personalised sample story for the given interest(s).
 *
 * Accepts a single interest string (legacy) or an array of interests.
 * For arrays, filters to trial interests, sorts alphabetically, and tries
 * the best match with progressive fallback (3 interests -> 2 -> 1).
 *
 * Returns null if no matching cached story is found.
 */
export function getSampleStory(
  interests: string | string[],
  child: ChildProfile | string,
  readingLevel?: string
): SampleStory | null {
  // Normalise: filter to trial interests, sort, cap at 3
  const arr = (Array.isArray(interests) ? interests : [interests])
    .filter((i): i is TrialInterest => (TRIAL_INTERESTS as readonly string[]).includes(i))
    .sort()
    .slice(0, 3);

  if (arr.length === 0) return null;

  // Cap interest count by reading level so each age group gets a different story:
  //   beginner   → up to 1 interest (simplest story)
  //   intermediate → up to 2 interests
  //   advanced   → up to 3 interests (most complex)
  // Falls back to the uncapped count if level is unknown.
  const levelCap: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 };
  const maxInterests = readingLevel ? (levelCap[readingLevel] ?? arr.length) : arr.length;
  const capped = arr.slice(0, Math.min(arr.length, maxInterests));

  // Build keys to try, in priority order:
  //   1. level-specific files (e.g. animals_dinosaurs_beginner) — for future dedicated files
  //   2. capped generic keys (different story per level via interest count)
  //   3. full generic keys as final fallback
  const seen = new Set<string>();
  const keysToTry: string[] = [];

  const addKey = (k: string) => { if (!seen.has(k)) { seen.add(k); keysToTry.push(k); } };

  if (readingLevel) {
    for (let n = capped.length; n >= 1; n--) {
      addKey(capped.slice(0, n).map((i: string) => i.toLowerCase()).join('_') + `_${readingLevel}`);
    }
  }
  for (let n = capped.length; n >= 1; n--) {
    addKey(capped.slice(0, n).map((i: string) => i.toLowerCase()).join('_'));
  }
  // Full 3-interest fallback (so advanced users never get nothing)
  for (let n = arr.length; n >= 1; n--) {
    addKey(arr.slice(0, n).map((i: string) => i.toLowerCase()).join('_'));
  }

  for (const key of keysToTry) {
    const story = loadStory(key);
    if (story) return personalise(story, child);
  }

  return null;
}


