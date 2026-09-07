import type { Metadata } from 'next';
import Link from 'next/link';
import { SUB_CSS, SiteHeader, SiteFooter, CtaBand } from '@/components/SiteChrome';

const BASE = 'https://www.talepopstories.com';

export const metadata: Metadata = {
  title: 'Bedtime story ideas for kids, built around what they love',
  description:
    "Dinosaurs, unicorns, space, soccer and twelve more. Pick what your child loves and we write a personalised bedtime story around it. Ages 3 to 10.",
  alternates: { canonical: `${BASE}/story-ideas` },
  openGraph: {
    title: 'Bedtime story ideas for kids, built around what they love',
    description:
      'Fifteen interests your child can pick from, each one producing a different personalised bedtime story.',
    url: `${BASE}/story-ideas`,
  },
};

/** The real interest list from the app's onboarding, so this page cannot drift from the product. */
const INTERESTS: { emoji: string; name: string; line: string; sample?: string }[] = [
  { emoji: '🦕', name: 'Dinosaurs', line: 'Footprints by the river, a creature bigger than the house, and a friend nobody expected.', sample: 'dinosaur-bedtime-story' },
  { emoji: '🦄', name: 'Unicorns', line: 'Valleys losing their colour, a map only one rider can follow, and a long walk home.', sample: 'unicorn-bedtime-story' },
  { emoji: '🦸', name: 'Superheroes', line: 'A power that turns up uninvited, and the harder job of working out what to do with it.', sample: 'superhero-bedtime-story' },
  { emoji: '🚀', name: 'Space', line: 'Past the last planet, where the quiet is enormous and something is still switched on.' },
  { emoji: '🏴‍☠️', name: 'Pirates', line: 'One night as captain, a crew that takes some convincing, and a course nobody has charted.' },
  { emoji: '🐋', name: 'Ocean', line: 'Deep water, a whale that has been waiting a long time, and a promise kept.' },
  { emoji: '🐘', name: 'Animals', line: 'Creatures who talk back, a rescue that needs small hands, and a farm that never sleeps.' },
  { emoji: '🧚', name: 'Fairies', line: 'A door at the bottom of the garden, wings that do not work yet, and one careful wish.' },
  { emoji: '👑', name: 'Princesses', line: 'A castle with an opinion, a crown that does not fit, and a kingdom worth arguing for.' },
  { emoji: '🤖', name: 'Robots', line: 'A machine that learns a feeling, a workshop after hours, and a repair that goes both ways.' },
  { emoji: '⚽', name: 'Soccer', line: 'A final nobody expected them in, one bad first half, and the pass that changes it.' },
  { emoji: '🐉', name: 'Dragons', line: 'Something enormous in the hills, a village that has it wrong, and a very small hat.' },
  { emoji: '🧜', name: 'Mermaids', line: 'A city under the harbour, a song that carries too far, and a tide that has to be turned.' },
  { emoji: '🩰', name: 'Ballet', line: 'A recital, a step that will not come right, and a stage bigger than it looked.' },
  { emoji: '🏎️', name: 'Cars', line: 'A track through the hills, an engine with a temper, and a corner taken properly at last.' },
  { emoji: '✨', name: 'Magic', line: 'A spell learned out of order, consequences that arrive politely, and one honest fix.' },
];

const FAQ = [
  {
    q: 'Can my child have more than one interest in a story?',
    a: 'Yes, and it makes the story better. Interests combine, so a child who loves dinosaurs and soccer can get a story where both matter to the plot rather than one being decoration.',
  },
  {
    q: 'Can they change interests later?',
    a: 'Any time, from their profile. Most children go through phases, so the profile is meant to be edited. Dinosaurs this month, deep sea the next.',
  },
  {
    q: 'Do the same interests give the same story twice?',
    a: 'No. Every story is written fresh, so the same child with the same interests gets a new plot each night. Nothing is pulled from a library of pre-written stories.',
  },
  {
    q: 'What if my child is into something not on this list?',
    a: 'You can add their best friend, their pet and details about their personality, which shape the plot regardless of theme. If there is an interest you keep wishing for, email us and we will look at adding it.',
  },
];

export default function StoryIdeasPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: 'Bedtime story ideas for kids',
        url: `${BASE}/story-ideas`,
        description:
          'The interests a child can pick from, each producing a different personalised bedtime story.',
        isPartOf: { '@type': 'WebSite', url: BASE, name: 'TalePop' },
      },
      {
        '@type': 'ItemList',
        name: 'Story interests',
        itemListElement: INTERESTS.map((it, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `Personalised ${it.name.toLowerCase()} bedtime story`,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Story ideas' },
        ],
      },
    ],
  };

  return (
    <>
      <style>{SUB_CSS}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteHeader />

      <div className="wrap phead">
        <p className="kick">Story ideas</p>
        <h1>Bedtime story ideas built around what your child is actually into</h1>
        <p className="lede">
          Pick their interests and the personalised bedtime story is written around them. Not a
          theme pasted on top, the plot itself. Sixteen to choose from, and they can be combined.
        </p>
      </div>

      <div className="wrap">
        <div className="grid grid-3">
          {INTERESTS.map((it) =>
            it.sample ? (
              <Link className="card" href={`/sample-stories/${it.sample}`} key={it.name}>
                <div className="emoji">{it.emoji}</div>
                <h3>{it.name}</h3>
                <p>{it.line}</p>
                <p style={{ color: 'var(--amber)', marginTop: '.7rem', fontWeight: 800 }}>
                  Read a full sample
                </p>
              </Link>
            ) : (
              <div className="card" key={it.name}>
                <div className="emoji">{it.emoji}</div>
                <h3>{it.name}</h3>
                <p>{it.line}</p>
              </div>
            ),
          )}
        </div>

        <div className="prose">
          <h2>Why interests change the story, not just the scenery</h2>
          <p>
            Most personalised children&apos;s books work one way: there is a fixed story, and your
            child&apos;s name goes into the gaps. Change the theme and you get the same plot with
            different pictures. It is why two children so often end up with what is recognisably
            the same book.
          </p>
          <p>
            TalePop writes the story from scratch every time. The interests you pick decide what
            happens, which means a dinosaur story and a unicorn story are not the same beats with
            the nouns swapped. You can check that claim without signing up: read the{' '}
            <Link href="/sample-stories/dinosaur-bedtime-story">dinosaur sample</Link> and the{' '}
            <Link href="/sample-stories/unicorn-bedtime-story">unicorn sample</Link> back to back.
          </p>

          <h2>Interests combine</h2>
          <p>
            A child rarely loves exactly one thing. Pick several and they work together, so
            dinosaurs plus soccer becomes a story where both carry weight. The profile also takes
            their best friend, their pet, their age and what makes them laugh, all of which end up
            in the plot rather than in a dedication.
          </p>

          <h2>Set the reading level too</h2>
          <p>
            Every interest is written at the level you choose. A four-year-old gets short sentences
            and one big moment per page. A nine-year-old gets richer language and a proper
            three-act structure. Same theme, genuinely different book. The samples show both ends:
            the dinosaur story is beginner, the superhero and unicorn stories are advanced.
          </p>

          <h2>Questions parents ask about story interests</h2>
          {FAQ.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      </div>

      <CtaBand
        heading="Pick their interests and read it tonight"
        body="Set up a profile in about two minutes. The first personalised story book is free."
      />
      <SiteFooter />
    </>
  );
}
