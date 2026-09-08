import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SUB_CSS, SiteHeader, SiteFooter, CtaBand } from '@/components/SiteChrome';
import { SAMPLE_STORIES, getStory } from '@/lib/sampleStories';

const BASE = 'https://www.talepopstories.com';

export function generateStaticParams() {
  return SAMPLE_STORIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = getStory(slug);
  if (!s) return {};
  const title = `${s.kw[0].toUpperCase()}${s.kw.slice(1)}: read a full sample`;
  const description = `Read "${s.title}", a complete ${s.theme.toLowerCase()} bedtime story from TalePop. ${s.age}. Free to read, no signup.`;
  return {
    title,
    description,
    alternates: { canonical: `${BASE}/sample-stories/${s.slug}` },
    openGraph: {
      title,
      description,
      url: `${BASE}/sample-stories/${s.slug}`,
      images: [`${BASE}${s.image}`],
      type: 'article',
    },
  };
}

export default async function SampleStoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  const others = SAMPLE_STORIES.filter((s) => s.slug !== story.slug);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${BASE}/sample-stories/${story.slug}#story`,
        name: story.title,
        genre: `Children's ${story.theme.toLowerCase()} bedtime story`,
        inLanguage: 'en',
        isAccessibleForFree: true,
        typicalAgeRange: story.age.replace('Ages ', '').replace(' to ', '-'),
        about: story.theme,
        text: story.moral,
        image: `${BASE}${story.image}`,
        publisher: { '@type': 'Organization', name: 'TalePop', url: BASE },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Sample stories', item: `${BASE}/sample-stories` },
          { '@type': 'ListItem', position: 3, name: story.title },
        ],
      },
    ],
  };

  return (
    <>
      <style>{SUB_CSS}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteHeader />

      <div className="wrap storyhead">
        <p className="kick">
          {story.emoji} Sample {story.theme.toLowerCase()} story
        </p>
        <h1 style={{ fontSize: 'var(--s-3)', maxWidth: '26ch', marginInline: 'auto' }}>{story.title}</h1>
        <p className="meta">
          {story.age} &middot; {story.readingLevel} reading level &middot; {story.pages.length} pages
        </p>
        <div className="story-hero">
          <img src={story.image} alt={story.alt} width={1200} height={1500} />
        </div>
      </div>

      <div className="wrap">
        {story.pages.map((paras, i) => (
          <article className="page" key={i}>
            <p className="page-n">Page {i + 1} of {story.pages.length}</p>
            {paras.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </article>
        ))}

        <div className="moral">
          <span>What the story is about</span>
          <p>{story.moral}</p>
        </div>

        <div className="prose">
          <h2>What changes when it is your child</h2>
          <p>
            This sample was written for a made-up child called {story.name}. In a real TalePop{' '}
            {story.kw}, the name is only the start. Your child&apos;s age sets the reading level,
            and their interests, best friend and pet are written into the plot, so the story that
            comes out is not this one with a different name in it.
          </p>
          <p>
            Reading level matters more than parents expect. This story is pitched at{' '}
            <strong>{story.age.toLowerCase()}</strong> at a {story.readingLevel} level, which sets
            the sentence length, the vocabulary and how much happens on each page. The same theme
            written for a four-year-old and a nine-year-old produces two genuinely different books.
          </p>
          <p>
            Every illustration, including the one above, came out of our own illustration model,
            trained in house. That is what keeps a character looking like the same child from the
            first page to the last, which stock artwork cannot do.
          </p>
          <p>
            <Link href="/story-ideas">See all the story ideas we can build from</Link>, or{' '}
            <Link href="/sample-stories">read another full sample story</Link>.
          </p>
        </div>

        <div className="grid grid-2" style={{ maxWidth: '68ch', marginInline: 'auto' }}>
          {others.map((s) => (
            <Link className="tp-card" href={`/sample-stories/${s.slug}`} key={s.slug}>
              <div className="emoji">{s.emoji}</div>
              <h3>{s.title}</h3>
              <p>
                {s.theme} &middot; {s.age}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <CtaBand
        heading={`Put your child in a ${story.theme.toLowerCase()} story of their own`}
        body="Their first personalised story book is free, and it can be ready before bedtime tonight."
      />
      <SiteFooter />
    </>
  );
}
