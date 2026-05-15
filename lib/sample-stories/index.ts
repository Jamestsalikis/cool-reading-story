import superheroes from './superheroes.json';
import dinosaurs from './dinosaurs.json';
import soccer from './soccer.json';
import robots from './robots.json';
import unicorns from './unicorns.json';
import princesses from './princesses.json';
import animals from './animals.json';
import fairies from './fairies.json';

export const TRIAL_INTERESTS = [
  'Superheroes', 'Dinosaurs', 'Soccer', 'Robots',
  'Unicorns', 'Princesses', 'Animals', 'Fairies',
] as const;

export type TrialInterest = typeof TRIAL_INTERESTS[number];

const SAMPLE_STORIES: Record<TrialInterest, typeof superheroes> = {
  Superheroes: superheroes,
  Dinosaurs: dinosaurs,
  Soccer: soccer,
  Robots: robots,
  Unicorns: unicorns,
  Princesses: princesses,
  Animals: animals,
  Fairies: fairies,
};

export interface ChildProfile {
  name: string;
  age?: number;
  gender?: string;
  hairColour?: string;
  eyeColour?: string;
}

/**
 * Returns a sample story personalised with the child's name and appearance.
 * Story text uses cached content (no Claude API call) but image prompts are
 * updated with the child's actual hair colour, eye colour, and gender so the
 * generated illustrations match the real child.
 */
export function getSampleStory(interest: string, child: ChildProfile | string): typeof superheroes | null {
  const story = SAMPLE_STORIES[interest as TrialInterest];
  if (!story) return null;

  // Support legacy string-only calls (just a name)
  const profile: ChildProfile = typeof child === 'string' ? { name: child } : child;

  let storyStr = JSON.stringify(story);

  // 1. Replace child name placeholder
  storyStr = storyStr.replace(/\{\{NAME\}\}/g, profile.name);

  // 2. Personalise appearance in character_anchor and image_prompts.
  //    Pattern: "with [anything] and [anything] eyes" covers all sample JSON
  //    appearance descriptions regardless of hair style wording.
  if (profile.hairColour && profile.eyeColour) {
    const hairDesc = `${profile.hairColour} hair`;
    const eyeDesc = `${profile.eyeColour} eyes`;
    storyStr = storyStr.replace(
      /with [^,"\\]+ and [^,"\\]+ eyes/g,
      `with ${hairDesc} and ${eyeDesc}`
    );
  }

  // 3. Personalise gender descriptor (young boy / young girl / young princess).
  if (profile.gender) {
    const genderWord = profile.gender === 'Girl' ? 'girl' : profile.gender === 'Boy' ? 'boy' : null;
    if (genderWord) {
      storyStr = storyStr.replace(/young (boy|girl)/g, `young ${genderWord}`);
      // Handle "young princess" / "young prince" for the Princesses story
      if (genderWord === 'boy') {
        storyStr = storyStr.replace(/young princess/g, 'young prince');
      }
    }
  }

  return JSON.parse(storyStr);
}

export function isTrialInterest(interest: string): interest is TrialInterest {
  return TRIAL_INTERESTS.includes(interest as TrialInterest);
}

export default SAMPLE_STORIES;
