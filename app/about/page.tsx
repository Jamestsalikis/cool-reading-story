import type { Metadata } from 'next';
import Link from 'next/link';
import { SUB_CSS, SiteHeader, SiteFooter, CtaBand } from '@/components/SiteChrome';

const BASE = 'https://www.talepopstories.com';

export const metadata: Metadata = {
  title: 'Our story: why we make personalised bedtime stories',
  description:
    'Why we built TalePop and how it differs from other personalised story apps: a new story every night, our own illustration model, real reading levels.',
  alternates: { canonical: `${BASE}/about` },
  openGraph: {
    title: 'Our story: why we make personalised bedtime stories',
    description:
      'Why we built TalePop and how it differs from other personalised children’s story apps.',
    url: `${BASE}/about`,
  },
};

/*
 * Every claim on this page is verifiable from the product itself: a new story per
 * night, an in-house illustration model, per-child reading levels, interests that
 * drive the plot, and the privacy commitments already stated on the homepage.
 * Nothing here is invented history.
 */

export default function AboutPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        name: 'Why we built TalePop',
        url: `${BASE}/about`,
        isPartOf: { '@type': 'WebSite', url: BASE, name: 'TalePop' },
      },
      {
        '@type': 'Organization',
        '@id': `${BASE}/#organization`,
        name: 'TalePop',
        url: BASE,
        email: 'info@talepopstories.com',
        logo: `${BASE}/brand/talepop-lockup.webp`,
        description:
          'Personalised, illustrated bedtime stories for children aged 3 to 10. A new story every night, written and illustrated around one child.',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'About' },
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
        <p className="kick">Our story</p>
        <h1>Why we built TalePop</h1>
        <p className="lede">
          Because a child should not have to read the same book about themselves twice. One child,
          one story, written and illustrated from scratch, and a new one tomorrow night.
        </p>
      </div>

      <div className="wrap prose">
        <h2>The problem with most personalised children&apos;s books</h2>
        <p>
          Nearly all of them are one fixed story with your child&apos;s name dropped into the gaps.
          The book arrives, it is lovely, your child reads it twice, and that is the end of it,
          because there was only ever one story. Buy another and it is the same plot with a
          different animal on the cover.
        </p>
        <p>
          The apps are usually a version of the same thing. A handful of templates, a name field,
          and pictures that do not quite match from one page to the next. Personalisation stops at
          the cover.
        </p>
        <p>
          We wanted the opposite: a new story every night, invented around one specific child, with
          their interests driving what actually happens in the plot. You can check whether we
          managed it without giving us anything, because we publish{' '}
          <Link href="/sample-stories">complete sample stories</Link> free to read.
        </p>

        <h2>How TalePop differs from other personalised story apps</h2>

        <h3>The story is written fresh, not filled in</h3>
        <p>
          There is no library of pre-written plots waiting for a name. Every story is generated for
          one child, which is why the same child with the same interests gets a different story
          tomorrow. Two children who both love dinosaurs do not get the same book.
        </p>

        <h3>Interests change the plot, not the scenery</h3>
        <p>
          Most apps treat a theme as set dressing: same beats, different backdrop. Here the
          interests you pick decide what happens. Read the{' '}
          <Link href="/sample-stories/dinosaur-bedtime-story">dinosaur sample</Link> next to the{' '}
          <Link href="/sample-stories/unicorn-bedtime-story">unicorn sample</Link> and you can see
          they are not the same shape with the nouns swapped.
        </p>

        <h3>We trained our own illustration model, and that was the hard part</h3>
        <p>
          Writing a personalised story is the easier half. Illustrating one is where most attempts
          fall over, because a child has to look like the same child on page one and page twelve.
          General purpose image generators cannot hold a character together across a whole book,
          and stock libraries cannot personalise at all.
        </p>
        <p>
          So we trained our own model, in house, on our own artwork. Every picture on this site came
          out of it. That consistency is the single biggest reason TalePop took as long to build as
          it did, and it is the thing most competitors have not solved.
        </p>

        <h3>Reading level is a real setting, not an age label</h3>
        <p>
          When you set up a child profile you set a reading level, and it changes the vocabulary,
          the sentence length and the story structure. A four-year-old gets short sentences and one
          clear moment per page. A nine-year-old gets richer language and a proper three-act shape.
          Getting this wrong is how a book ends up abandoned halfway through, so we treat it as a
          first-class setting rather than a number printed on the cover.
        </p>

        <h3>It is built for the bedtime routine, not for one gift</h3>
        <p>
          A personalised book is a lovely present once a year. This is meant to be part of the
          nightly routine, which is a different product with different demands: it has to be ready
          in minutes, it has to stay interesting on night forty, and it has to grow with the child
          as their reading moves on.
        </p>

        <h2>What we will not do</h2>
        <ul>
          <li>
            <strong>No ads.</strong> Not now, not later. A children&apos;s bedtime app is not a
            place to sell things to children.
          </li>
          <li>
            <strong>No third party tracking, and we do not sell data.</strong> Your child&apos;s
            name and interests exist to write their stories. That is all they are for.
          </li>
          <li>
            <strong>Delete the profile and it is gone.</strong> One action, from your account
            settings, no email required.
          </li>
          <li>
            <strong>Nothing in a TalePop story you would not read aloud yourself.</strong> Content
            is age-filtered before it ever reaches a page.
          </li>
          <li>
            <strong>Cancel in one click.</strong> No retention flow, no phone call, no
            email-us-to-cancel. You keep access to the end of the billing period.
          </li>
        </ul>

        <h2>See it before you decide anything</h2>
        <p>
          The fastest way to judge whether any of this is true is to read one. Start with a{' '}
          <Link href="/sample-stories">full sample story</Link>, or look through the{' '}
          <Link href="/story-ideas">story ideas</Link> your child could pick from. If you have a
          question that is not answered anywhere, email{' '}
          <a href="mailto:info@talepopstories.com">info@talepopstories.com</a> and a person will
          reply.
        </p>
      </div>

      <CtaBand
        heading="Their first personalised story book is free"
        body="Set up a profile in about two minutes and read it at bedtime tonight."
      />
      <SiteFooter />
    </>
  );
}
