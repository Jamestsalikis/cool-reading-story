// Client-safe exports only — no Node.js builtins.
// Server-side story loading lives in ./server.ts

export const TRIAL_INTERESTS = [
  'Animals', 'Dinosaurs', 'Fairies', 'Princesses',
  'Robots', 'Soccer', 'Superheroes', 'Unicorns',
] as const;

export type TrialInterest = typeof TRIAL_INTERESTS[number];

export interface StoryPage {
  page_number: number;
  content: string;
  image_prompt: string;
}

export interface SampleStory {
  interest: string;
  title: string;
  moral: string;
  theme_emoji: string;
  word_count: number;
  character_anchor: string;
  pages: StoryPage[];
}

export interface ChildPerson {
  name: string;
  nickname?: string;
}

export interface ChildProfile {
  name: string;
  age?: number;
  gender?: string;
  hairColour?: string;
  eyeColour?: string;
  siblings?: ChildPerson[];
  friends?: ChildPerson[];
}

export function isTrialInterest(interest: string): interest is TrialInterest {
  return (TRIAL_INTERESTS as readonly string[]).includes(interest);
}

