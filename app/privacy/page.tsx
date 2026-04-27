import Link from 'next/link';

export const metadata = { title: 'Privacy Policy — Cool Reading Story' };

export default function PrivacyPage() {
  const updated = '26 April 2026';

  return (
    <div style={{ background: '#FAF9F6', minHeight: '100vh' }}>
      <nav style={{ borderBottom: '1px solid #E8E3DC', padding: '1.25rem 2rem' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 600, color: '#741515', textDecoration: 'none' }}>
            Cool Reading Story
          </Link>
          <Link href="/login" style={{ fontSize: '0.875rem', color: '#6B5E4E', textDecoration: 'none' }}>Sign in</Link>
        </div>
      </nav>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 2rem' }}>
        <h1 className="font-serif" style={{ fontSize: '2.25rem', fontWeight: 700, color: '#1C1614', marginBottom: '0.5rem' }}>
          Privacy Policy
        </h1>
        <p style={{ color: '#9B8B7A', fontSize: '0.875rem', marginBottom: '3rem' }}>Last updated: {updated}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

          <Section title="1. Who we are">
            <p>Cool Reading Story ("we", "us", "our") is an AI-powered personalised children's story service. We take your privacy — and the privacy of your children — seriously. This policy explains what information we collect, why we collect it, and how we protect it.</p>
            <p>Contact: <a href="mailto:hello@coolreadingstory.com" style={{ color: '#741515' }}>hello@coolreadingstory.com</a></p>
          </Section>

          <Section title="2. Information we collect">
            <p><strong>Account information.</strong> When you sign up, we collect your email address and (optionally) your name. If you use Google Sign-In, we receive your name and email from Google.</p>
            <p><strong>Child profile information.</strong> To generate personalised stories, you provide details about your child including their name, age, gender, interests, appearance, and optionally siblings, friends, pets, and location. This information is used solely to generate stories and is never shared with third parties for marketing purposes.</p>
            <p><strong>Generated stories.</strong> We store the stories we create for you so you can access them at any time.</p>
            <p><strong>Usage data.</strong> We collect basic usage information (number of stories generated, subscription status) to manage your account and enforce usage limits.</p>
            <p><strong>Payment information.</strong> Payments are processed by Stripe. We do not store your credit card details — Stripe handles all payment data under their own privacy and security standards.</p>
            <p><strong>Feedback.</strong> If you submit an app rating or comment through the in-app feedback feature, we store your rating and comment.</p>
          </Section>

          <Section title="3. Children's privacy">
            <p>We understand that information about children is particularly sensitive. Our service is designed for parents and guardians — children do not create accounts or interact directly with our platform.</p>
            <p>Information you provide about your child (name, age, interests, etc.) is used exclusively to generate personalised stories for your family. We do not use this information for advertising, profiling, or any other commercial purpose. We do not sell or share child information with any third party.</p>
            <p>If you are located in the United States, please note that we do not knowingly collect personal information from children under 13 without verifiable parental consent. As the account holder, you are consenting on behalf of your child.</p>
          </Section>

          <Section title="4. How we use your information">
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>To generate personalised stories based on your child's profile</li>
              <li>To manage your subscription and process payments via Stripe</li>
              <li>To send transactional emails (password reset, subscription confirmation)</li>
              <li>To improve our service using anonymised, aggregated usage data</li>
              <li>To respond to support requests</li>
            </ul>
            <p>We do not send marketing emails without your explicit consent. We do not sell your data to any third party.</p>
          </Section>

          <Section title="5. Third-party services">
            <p>We use the following third-party services to operate Cool Reading Story:</p>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Supabase</strong> — database and authentication (supabase.com/privacy)</li>
              <li><strong>Anthropic</strong> — AI story generation via the Claude API (anthropic.com/privacy)</li>
              <li><strong>Replicate</strong> — AI illustration generation (replicate.com/privacy)</li>
              <li><strong>Stripe</strong> — payment processing (stripe.com/privacy)</li>
              <li><strong>Vercel</strong> — hosting and deployment (vercel.com/privacy)</li>
            </ul>
            <p>Each service operates under its own privacy policy. We share only the minimum information necessary for each service to function.</p>
          </Section>

          <Section title="6. Data storage and security">
            <p>Your data is stored on servers in Australia (ap-southeast-2 region) via Supabase. We use industry-standard security measures including encryption at rest and in transit.</p>
            <p>We retain your account and story data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it by law.</p>
          </Section>

          <Section title="7. Your rights">
            <p>You have the right to:</p>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your stories in a readable format</li>
              <li>Withdraw consent for optional data uses at any time</li>
            </ul>
            <p>To exercise these rights, contact us at <a href="mailto:hello@coolreadingstory.com" style={{ color: '#741515' }}>hello@coolreadingstory.com</a>. We will respond within 30 days.</p>
          </Section>

          <Section title="8. Cookies">
            <p>We use only essential cookies required for authentication and session management. We do not use advertising or tracking cookies.</p>
          </Section>

          <Section title="9. Changes to this Policy">
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes by email or through an in-app notice. Continued use of the service after changes means you accept the updated policy.</p>
          </Section>

          <Section title="10. Contact">
            <p>Privacy questions or concerns? Email us at <a href="mailto:hello@coolreadingstory.com" style={{ color: '#741515' }}>hello@coolreadingstory.com</a></p>
            <p>We aim to respond within 2 business days.</p>
          </Section>

          <div style={{ background: '#FBF0F0', borderRadius: '10px', padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: '#741515', borderLeft: '3px solid #741515' }}>
            <strong>Note:</strong> This is a working draft. Before going live, have this reviewed by a lawyer familiar with the Australian Privacy Act 1988, particularly regarding children's data obligations and the requirements of Australian Privacy Principle 10.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1C1614', marginBottom: '0.75rem' }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#4A3728', fontSize: '0.9375rem', lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #E8E3DC', padding: '2rem', marginTop: '4rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: '#9B8B7A' }}>
        <span>© {new Date().getFullYear()} Cool Reading Story</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="/privacy" style={{ color: '#741515', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: '#9B8B7A', textDecoration: 'none' }}>Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
