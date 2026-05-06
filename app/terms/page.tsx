import Link from 'next/link';

export const metadata = { title: 'Terms of Service  -  TalePop' };

export default function TermsPage() {
  const updated = '6 May 2026';

  return (
    <div style={{ background: '#FFF4E6', minHeight: '100vh' }}>
      <nav style={{ borderBottom: '1px solid #F0E4D0', padding: '1.25rem 2rem' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <img src="/mood-3.png" alt="TalePop" style={{ height: '44px', width: 'auto' }} />
          </Link>
          <Link href="/login" style={{ fontSize: '0.875rem', color: '#5E6A7A', textDecoration: 'none' }}>Sign in</Link>
        </div>
      </nav>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 2rem' }}>
        <h1 className="font-serif" style={{ fontSize: '2.25rem', fontWeight: 700, color: '#0D183D', marginBottom: '0.5rem' }}>
          Terms of Service
        </h1>
        <p style={{ color: '#5E6A7A', fontSize: '0.875rem', marginBottom: '3rem' }}>Last updated: {updated}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', color: '#0D183D', lineHeight: 1.8 }}>

          <div style={{ background: '#FFFBEB', borderRadius: '10px', padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#92400E', borderLeft: '3px solid #D97706' }}>
            <strong>Beta / Research Preview:</strong> TalePop is currently in early access. Features may change, and we may update these Terms as the service evolves. We will notify you of material changes by email.
          </div>

          <Section title="1. About these Terms">
            <p>These Terms of Service ("Terms") govern your use of TalePop ("we", "us", "our"), an AI-powered personalised children&apos;s story service. By creating an account or using our service, you agree to these Terms.</p>
            <p>Please read these Terms carefully. If you disagree with any part, please do not use our service.</p>
          </Section>

          <Section title="2. Eligibility">
            <p>You must be at least 18 years old to create an account. TalePop is designed for parents and guardians to generate stories for children. Children under 13 should not create their own accounts. By registering, you confirm that you are an adult acting on behalf of your family.</p>
          </Section>

          <Section title="3. Your Account">
            <p>You are responsible for keeping your account credentials confidential and for all activity that occurs under your account. Notify us immediately at <a href="mailto:hello@talepop.com" style={{ color: '#FF6B35' }}>hello@talepop.com</a> if you suspect unauthorised access.</p>
            <p>Each account is limited to one child profile on the base subscription. Additional child profiles are available for an add-on fee (see Section 4).</p>
            <p>We reserve the right to suspend or terminate accounts that violate these Terms.</p>
          </Section>

          <Section title="4. Subscription and Billing">
            <p><strong>Plans.</strong> We offer a Monthly plan (A$9.99/month) and an Annual plan (A$95.90/year, billed in full). All prices are in Australian dollars and inclusive of any applicable taxes.</p>
            <p><strong>Story limits.</strong> Subscriptions include 1 personalised story per day per child profile. Daily limits reset at midnight in your local time zone.</p>
            <p><strong>Additional child profiles.</strong> The base subscription covers one child profile. You may add additional children for A$3.99/month per child, added to your base subscription.</p>
            <p><strong>Extra books.</strong> Subscribers may purchase additional books beyond the daily limit for A$0.99 per book. Free trial users may also purchase individual books. These are one-time purchases and are non-refundable once the book has been generated.</p>
            <p><strong>Free trial.</strong> New accounts receive access to 2 pre-generated sample stories from a selection of 8 interest categories, at no charge and without requiring a payment method. Sample stories are not personalised to your child in real time.</p>
            <p><strong>Billing.</strong> Payments are processed securely by Stripe. Your payment method will be charged at the start of each billing period. You authorise us to charge your payment method on a recurring basis until you cancel.</p>
            <p><strong>Cancellation.</strong> You may cancel at any time through your account settings or by contacting us. Cancellation takes effect at the end of your current billing period. We do not provide refunds for partial periods.</p>
            <p><strong>Price changes.</strong> We will give you at least 30 days&apos; notice of any price change before it takes effect.</p>
          </Section>

          <Section title="5. AI-Generated Content">
            <p>Stories and illustrations are generated using artificial intelligence (Anthropic Claude for text, Replicate Flux for images). While we apply content filters to ensure all output is age-appropriate and wholesome, we do not guarantee that every story will be perfect. Stories are intended for personal, private family use only.</p>
            <p><strong>Content safety.</strong> All story generation is subject to mandatory safety filters that prohibit sexual, violent, frightening, abusive, discriminatory, or otherwise inappropriate content. If any part of a child&apos;s profile could produce unsafe output, our system substitutes safe alternative themes. You may report any concerning content to <a href="mailto:hello@talepop.com" style={{ color: '#FF6B35' }}>hello@talepop.com</a>.</p>
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
              <li>Provide false information about your age or parental status</li>
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
            <p>Questions about these Terms? Contact us at <a href="mailto:hello@talepop.com" style={{ color: '#FF6B35' }}>hello@talepop.com</a></p>
          </Section>

          <div style={{ background: '#FBF0F0', borderRadius: '10px', padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: '#FF6B35', borderLeft: '3px solid #FF6B35' }}>
            <strong>Note:</strong> This document is a working draft. It should be reviewed by a qualified Australian lawyer before the service launches publicly, particularly regarding consumer guarantees, subscription cancellation provisions under Australian Consumer Law, and children&apos;s data obligations.
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
      <h2 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0D183D', marginBottom: '0.75rem' }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#4A3728', fontSize: '0.9375rem' }}>
        {children}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #F0E4D0', padding: '2rem', marginTop: '4rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: '#5E6A7A' }}>
        <span>© {new Date().getFullYear()} TalePop</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="/privacy" style={{ color: '#5E6A7A', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: '#FF6B35', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
