import type { Metadata } from 'next';
import Link from 'next/link';
import { SUB_CSS, SiteHeader, SiteFooter, CtaBand } from '@/components/SiteChrome';

const BASE = 'https://www.talepopstories.com';

export const metadata: Metadata = {
  title: 'Our story: why we make personalised bedtime stories',
  description:
    'An independent Australian company making personalised bedtime stories for kids aged 3 to 10. Why we trained our own illustration model.',
  alternates: { canonical: `${BASE}/about` },
  openGraph: {
    title: 'Our story: why we make personalised bedtime stories',
    description:
      'An independent Australian company making personalised bedtime stories for children aged 3 to 10.',
    url: `${BASE}/about`,
  },
};

/*
 * JAMES: everything on this page is a fact I could verify from the product, the
 * repo or your existing site copy. I have deliberately not written a founding
 * story, because I do not know it and inventing one would be the same mistake as
 * the fake testimonial.
 *
 * The section marked "In your words" below is the one worth you writing. Parents
 * vetting an AI product for their child read exactly that paragraph, and it is
 * the part no competitor can copy. Two or three honest sentences beat anything I
 * could draft: who started it, and what was happening at bedtime that made you
 * bother.
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
        legalName: 'TalePop Pty Ltd',
        url: BASE,
        email: 'info@talepopstories.com',
        logo: `${BASE}/brand/talepop-lockup.webp`,
        address: { '@type': 'PostalAddress', addressCountry: 'AU' },
        description:
          'Independent Australian company making personalised, illustrated bedtime stories for children aged 3 to 10.',
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
          We make personalised bedtime stories for children aged 3 to 10. One child, one story,
          written and illustrated from scratch. We are a small independent company in Australia.
        </p>
      </div>

      <div className="wrap prose">
        <h2>The problem with most personalised children&apos;s books</h2>
        <p>
          Nearly all of them are one fixed story with your child&apos;s name dropped into the gaps.
          The book arrives, it is lovely, your child reads it twice, and that is the end of it,
          because there is only ever one story. Buy another and it is the same plot with a
          different animal on the cover.
        </p>
        <p>
          We wanted the opposite: a new story every night, invented around one specific child, with
          their interests driving what actually happens. Not a name in a template. You can check
          whether we managed it without giving us anything, because we publish{' '}
          <Link href="/sample-stories">complete sample stories</Link> free to read.
        </p>

        <h2>We trained our own illustration model, and that was the hard part</h2>
        <p>
          Writing a personalised story is the easier half. Illustrating one is where most attempts
          fall over, because a child has to look like the same child on page one and page twelve.
          General purpose image generators cannot hold a character together across a whole book,
          and stock libraries obviously cannot personalise at all.
        </p>
        <p>
          So we trained our own model, in house, on our own artwork. Every picture on this site
          came out of it. That is why the boy in one sample looks like the same boy three pages
          later, and it is the single biggest reason TalePop took as long to build as it did.
        </p>

        <h2>Reading level is not a gimmick</h2>
        <p>
          When you set up a child profile you set a reading level, and it changes the vocabulary,
          the sentence length and the story structure. A four-year-old gets short sentences and one
          clear moment per page. A nine-year-old gets richer language and a proper three-act shape.
          Getting this wrong is how a book ends up abandoned halfway through, so we treat it as a
          first-class setting rather than an age label on the cover.
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

        <h2>In your words</h2>
        <p>
          <em>
            This is the section for the founder to write. See the note at the top of this file.
          </em>
        </p>

        <h2>Where we are up to</h2>
        <p>
          TalePop is available on the web today, with native apps in progress. We are an
          independent Australian company, TalePop Pty Ltd, and you can reach a human at{' '}
          <a href="mailto:info@talepopstories.com">info@talepopstories.com</a>.
        </p>
        <p>
          If you want to see what it produces before deciding anything, start with a{' '}
          <Link href="/sample-stories">full sample story</Link> or have a look at the{' '}
          <Link href="/story-ideas">story ideas</Link> your child could pick from.
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
