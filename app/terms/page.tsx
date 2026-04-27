import Link from 'next/link';

export const metadata = { title: 'Terms of Service — Cool Reading Story' };

export default function TermsPage() {
  const updated = '26 April 2026';

  return (
    <div style={{ background: '#FAF9F6', minHeight: '100vh' }}>
      {/* Nav */}
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
          Terms of Service
        </h1>
        <p style={{ color: '#9B8B7A', fontSize: '0.875rem', marginBottom: '3rem' }}>Last updated: {updated}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', color: '#1C1614', lineHeight: 1.8 }}>

          <Section title="1. About these Terms">
            <p>These Terms of Service ("Terms") govern your use of Cool Reading Story ("we", "us", "our"), an AI-powered personalised children's story service available at cool-reading-story.vercel.app. By creating an account or using our service, you agree to these Terms.</p>
            <p>Please read these Terms carefully. If you disagree with any part, please do not use our service.</p>
          </Section>

          <Section title="2. Eligibility">
            <p>You must be at least 18 years old to create an account. Cool Reading Story is designed for parents and guardians to generate stories for children. Children under 13 should not create their own accounts. By registering, you confirm that you are an adult acting on behalf of your family.</p>
          </Section>

          <Section title="3. Your Account">
            <p>You are responsible for keeping your account credentials confidential and for all activity that occurs under your account. Notify us immediately at <a href="mailto:hello@coolreadingstory.com" style={{ color: '#741515' }}>hello@coolreadingstory.com</a> if you suspect unauthorised access.</p>
            <p>We reserve the right to suspend or terminate accounts that violate these Terms.</p>
          </Section>

          <Section title="4. Subscription and Billing">
            <p><strong>Plans.</strong> We offer a Monthly plan (A$9.99/month) and an Annual plan (A$95.90/year, billed in full). All prices are in Australian dollars and inclusive of any applicable taxes.</p>
            <p><strong>Story limits.</strong> Subscriptions include up to 15 personalised stories per calendar month. The counter resets on the 1st of each month.</p>
            <p><strong>Billing.</strong> Payments are processed securely by Stripe. Your payment method will be charged at the start of each billing period. You authorise us to charge your payment method on a recurring basis until you cancel.</p>
            <p><strong>Cancellation.</strong> You may cancel at any time through your account settings or by contacting us. Cancellation takes effect at the end of your current billing period. We do not provide refunds for partial periods.</p>
            <p><strong>Price changes.</strong> We will give you at least 30 days' notice of any price change before it takes effect.</p>
          </Section>

          <Section title="5. AI-Generated Content">
            <p>Stories are generated using artificial intelligence. While we strive for quality and appropriateness, we do not guarantee that every story will be perfect. Stories are generated based on the information you provide about your child and are intended for personal, private family use only.</p>
            <p>You own the stories generated for your account and may use them for personal, non-commercial purposes. You may not sell, republish, or distribute stories commercially without our written consent.</p>
            <p>We retain the right to use anonymised, non-identifiable story data to improve our service.</p>
          </Section>

          <Section title="6. Acceptable Use">
            <p>You agree not to:</p>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Use the service to generate content that is harmful, abusive, or inappropriate for children</li>
              <li>Attempt to circumvent usage limits or access controls</li>
              <li>Share account credentials with others outside your immediate family</li>
              <li>Use automated tools to generate stories in bulk</li>
              <li>Reverse engineer or attempt to extract our AI prompts or models</li>
            </ul>
          </Section>

          <Section title="7. Disclaimer of Warranties">
            <p>The service is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, error-free, or that stories will be suitable for any particular purpose. Use of AI-generated content is at your own discretion.</p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>To the maximum extent permitted by Australian law, our total liability to you for any claim arising from use of the service is limited to the amount you paid us in the 30 days preceding the claim. We are not liable for any indirect, incidental, or consequential damages.</p>
          </Section>

          <Section title="9. Changes to These Terms">
            <p>We may update these Terms from time to time. We will notify you of material changes by email or by a notice within the app. Continued use of the service after changes constitutes acceptance of the new Terms.</p>
          </Section>

          <Section title="10. Governing Law">
            <p>These Terms are governed by the laws of New South Wales, Australia. Any disputes will be resolved in the courts of New South Wales.</p>
          </Section>

          <Section title="11. Contact">
            <p>Questions about these Terms? Contact us at <a href="mailto:hello@coolreadingstory.com" style={{ color: '#741515' }}>hello@coolreadingstory.com</a></p>
          </Section>

          <div style={{ background: '#FBF0F0', borderRadius: '10px', padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: '#741515', borderLeft: '3px solid #741515' }}>
            <strong>Note:</strong> This document is a working draft. It should be reviewed by a qualified Australian lawyer before the service launches publicly, particularly the consumer guarantees and subscription cancellation provisions under Australian Consumer Law.
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#4A3728', fontSize: '0.9375rem' }}>
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
          <Link href="/privacy" style={{ color: '#9B8B7A', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: '#741515', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
