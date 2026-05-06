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

export function getSampleStory(interest: string, childName: string): typeof superheroes | null {
  const story = SAMPLE_STORIES[interest as TrialInterest];
  if (!story) return null;
  // Substitute child name placeholder throughout all text fields
  return JSON.parse(
    JSON.stringify(story).replace(/\{\{NAME\}\}/g, childName)
  );
}

export function isTrialInterest(interest: string): interest is TrialInterest {
  return TRIAL_INTERESTS.includes(interest as TrialInterest);
}

export default SAMPLE_STORIES;
