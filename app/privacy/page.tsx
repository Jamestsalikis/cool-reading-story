import Link from 'next/link';

export const metadata = { title: 'Privacy Policy  -  TalePop' };

export default function PrivacyPage() {
  const updated = '6 May 2026';

  return (
    <div style={{ background: '#FFF4E6', minHeight: '100vh' }}>
      <nav style={{ borderBottom: '1px solid #F0E4D0', padding: '1.25rem 2rem' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <img src="/mood-3.png" alt="TalePop" style={{ height: '44px', width: 'auto', mixBlendMode: 'multiply' }} />
          </Link>
          <Link href="/login" style={{ fontSize: '0.875rem', color: '#5E6A7A', textDecoration: 'none' }}>Sign in</Link>
        </div>
      </nav>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 2rem' }}>
        <h1 className="font-serif" style={{ fontSize: '2.25rem', fontWeight: 700, color: '#0D183D', marginBottom: '0.5rem' }}>
          Privacy Policy
        </h1>
        <p style={{ color: '#5E6A7A', fontSize: '0.875rem', marginBottom: '3rem' }}>Last updated: {updated}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

          <Section title="1. Who we are">
            <p>TalePop ("we", "us", "our") is an AI-powered personalised children&apos;s story service operated by [Your Company Name] ABN [XX XXX XXX XXX], based in Australia. We take your privacy  -  and the privacy of your children  -  seriously. This policy explains what information we collect, why we collect it, and how we protect it.</p>
            <p>Contact: <a href="mailto:hello@talepop.com" style={{ color: '#FF6B35' }}>hello@talepop.com</a></p>
          </Section>

          <Section title="2. Information we collect">
            <p><strong>Account information.</strong> When you sign up, we collect your email address and (optionally) your name. If you use Google Sign-In, we receive your name and email from Google.</p>
            <p><strong>Parental consent record.</strong> At sign-up, we record your confirmation that you are 18 years of age or older and are acting as the parent or legal guardian of the child whose profile you create. This consent record is stored with your account.</p>
            <p><strong>Child profile information.</strong> To generate personalised stories, you provide details about your child including their name, age, gender, interests, and optionally appearance (hair colour, eye colour), siblings, friends, pets, and general location (city/country). This information is used solely to generate stories and is never shared with third parties for marketing purposes.</p>
            <p><strong>Generated stories.</strong> We store the stories we create for you so you can access them at any time.</p>
            <p><strong>Usage data.</strong> We collect basic usage information (number of stories generated, subscription status) to manage your account and enforce usage limits.</p>
            <p><strong>Payment information.</strong> Payments are processed by Stripe. We do not store your credit card details  -  Stripe handles all payment data under their own privacy and security standards.</p>
            <p><strong>Feedback.</strong> If you submit an app rating or comment through the in-app feedback feature, we store your rating and comment.</p>
          </Section>

          <Section title="3. Legal basis for processing your data">
            <p>Where the UK GDPR, EU GDPR, or similar laws apply, we rely on the following legal bases under Article 6:</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              <thead>
                <tr style={{ background: '#FFF0E6' }}>
                  <th style={{ padding: '0.625rem 0.75rem', textAlign: 'left', border: '1px solid #F0E4D0', fontWeight: 600, color: '#0D183D' }}>Processing activity</th>
                  <th style={{ padding: '0.625rem 0.75rem', textAlign: 'left', border: '1px solid #F0E4D0', fontWeight: 600, color: '#0D183D' }}>Legal basis</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Creating and managing your account', 'Art. 6(1)(b)  -  Performance of a contract'],
                  ['Generating personalised stories from your child\'s profile', 'Art. 6(1)(b)  -  Performance of a contract'],
                  ['Processing subscription payments', 'Art. 6(1)(b)  -  Performance of a contract'],
                  ['Sending transactional emails (password reset, billing)', 'Art. 6(1)(b)  -  Performance of a contract'],
                  ['Recording parental consent at sign-up', 'Art. 6(1)(c)  -  Legal obligation (COPPA, AADC)'],
                  ['Improving our service using anonymised, aggregated data', 'Art. 6(1)(f)  -  Legitimate interests'],
                  ['Responding to support requests', 'Art. 6(1)(f)  -  Legitimate interests'],
                ].map(([activity, basis], i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#FFF4E6' }}>
                    <td style={{ padding: '0.625rem 0.75rem', border: '1px solid #F0E4D0', color: '#4A3728' }}>{activity}</td>
                    <td style={{ padding: '0.625rem 0.75rem', border: '1px solid #F0E4D0', color: '#4A3728' }}>{basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ marginTop: '0.75rem' }}>For child profile data specifically, we additionally rely on the explicit parental consent you provide at account creation, as required by COPPA (US) and the UK Age Appropriate Design Code.</p>
          </Section>

          <Section title="4. Children's privacy">
            <p>We understand that information about children is particularly sensitive. Our service is designed for parents and guardians  -  children do not create accounts or interact directly with our platform.</p>
            <p><strong>Parental consent.</strong> Before collecting any child profile data, we require you to confirm that you are 18 or older and are acting as the parent or legal guardian. Your consent is recorded with a timestamp at account creation. Because you must provide a valid payment method to subscribe, this also satisfies the credit card + email verification method of verifiable parental consent under the US Children&apos;s Online Privacy Protection Act (COPPA).</p>
            <p><strong>What we collect about your child.</strong> Name, age, gender, interests, optionally appearance (hair colour, eye colour), and optionally siblings&apos; names, friends&apos; names, pet name/type, and general location (city/country for story setting). We never collect precise GPS location, biometric data, or school details.</p>
            <p><strong>How we use it.</strong> Child profile information is used exclusively to generate personalised stories for your family. We do not use this information for advertising, profiling for commercial purposes, or any purpose beyond story creation.</p>
            <p><strong>Profiling.</strong> We use child profile data to personalise story content. We do not create behavioural profiles, serve targeted advertising, or use child data to inform decisions about other products or services. Personalisation is limited to the story generation purpose and is not enabled for any other use.</p>
            <p><strong>Data minimisation.</strong> All child profile fields beyond name and age are optional. We encourage you to share only what is needed to create stories you are happy with.</p>
            <p><strong>Retention.</strong> Child profile data is retained for as long as your account is active. If you delete a child profile, the associated data is deleted within 7 days. If you delete your account, all child data is deleted within 30 days. We do not retain child data beyond what is necessary for the purpose of story generation.</p>
            <p><strong>Your rights as a parent.</strong> You may at any time review, correct, or delete your child&apos;s profile through the app. To request a full export or deletion of your child&apos;s data, contact us at <a href="mailto:hello@talepop.com" style={{ color: '#FF6B35' }}>hello@talepop.com</a>. We will respond within 30 days.</p>
          </Section>

          <Section title="5. How we use your information">
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>To generate personalised stories based on your child&apos;s profile</li>
              <li>To manage your subscription and process payments via Stripe</li>
              <li>To send transactional emails (password reset, subscription confirmation)</li>
              <li>To improve our service using anonymised, aggregated usage data</li>
              <li>To respond to support requests</li>
            </ul>
            <p>We do not send marketing emails without your explicit consent. We do not sell your data to any third party.</p>
          </Section>

          <Section title="6. Third-party services">
            <p>We use the following third-party services to operate TalePop:</p>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Supabase</strong>  -  database and authentication (<a href="https://supabase.com/privacy" style={{ color: '#FF6B35' }}>supabase.com/privacy</a>)</li>
              <li><strong>Anthropic</strong>  -  AI story generation via the Claude API (<a href="https://www.anthropic.com/privacy" style={{ color: '#FF6B35' }}>anthropic.com/privacy</a>)</li>
              <li><strong>Replicate</strong>  -  AI illustration generation (<a href="https://replicate.com/privacy" style={{ color: '#FF6B35' }}>replicate.com/privacy</a>)</li>
              <li><strong>Stripe</strong>  -  payment processing (<a href="https://stripe.com/privacy" style={{ color: '#FF6B35' }}>stripe.com/privacy</a>)</li>
              <li><strong>Vercel</strong>  -  hosting and deployment (<a href="https://vercel.com/privacy" style={{ color: '#FF6B35' }}>vercel.com/privacy</a>)</li>
            </ul>
            <p>Each service operates under its own privacy policy. We share only the minimum information necessary for each service to function. Child profile data is transmitted to Anthropic (for story generation) and Replicate (image generation prompts only  -  no personal details). We have assessed these processors and are satisfied they meet appropriate data protection standards.</p>
          </Section>

          <Section title="7. International data transfers">
            <p>Our primary data storage is in Australia (Supabase, ap-southeast-2 region). When you use our service from the United Kingdom or European Economic Area, your data is transferred to Australia and to our US-based processors (Anthropic, Replicate, Stripe, Vercel).</p>
            <p>Australia does not currently have a formal EU adequacy decision. For transfers of your personal data outside the UK/EEA, we rely on Standard Contractual Clauses (SCCs) as approved by the relevant supervisory authorities, and/or the contractual necessity exception where applicable. You may request a copy of the applicable transfer safeguards by contacting us.</p>
          </Section>

          <Section title="8. Data storage and security">
            <p>Your data is stored on servers in Australia (ap-southeast-2 region) via Supabase. We use industry-standard security measures including encryption at rest and in transit (TLS 1.2+).</p>
            <p>We retain your account and story data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it by law (e.g. financial records for 7 years under Australian tax law).</p>
          </Section>

          <Section title="9. Your rights">
            <p>You have the right to:</p>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Access the personal information we hold about you and your child</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account and associated data (including child data)</li>
              <li>Export your stories in a readable format</li>
              <li>Withdraw consent for optional data uses at any time</li>
              <li>Object to processing based on legitimate interests</li>
              <li>Restrict processing in certain circumstances</li>
            </ul>
            <p>To exercise these rights, contact us at <a href="mailto:hello@talepop.com" style={{ color: '#FF6B35' }}>hello@talepop.com</a>. We will respond within 30 days.</p>
            <p><strong>Right to complain.</strong> If you believe we have not handled your personal data in accordance with applicable law, you have the right to lodge a complaint with your local data protection authority:</p>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Australia:</strong> Office of the Australian Information Commissioner (OAIC)  -  <a href="https://www.oaic.gov.au" style={{ color: '#FF6B35' }}>oaic.gov.au</a></li>
              <li><strong>United Kingdom:</strong> Information Commissioner&apos;s Office (ICO)  -  <a href="https://ico.org.uk" style={{ color: '#FF6B35' }}>ico.org.uk</a></li>
              <li><strong>European Union:</strong> Your national data protection authority</li>
            </ul>
          </Section>

          <Section title="10. Cookies">
            <p>We use only essential cookies required for authentication and session management. We do not use advertising or tracking cookies.</p>
          </Section>

          <Section title="11. Changes to this Policy">
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes by email or through an in-app notice. Continued use of the service after changes means you accept the updated policy.</p>
          </Section>

          <Section title="12. Contact">
            <p>Privacy questions or concerns? Email us at <a href="mailto:hello@talepop.com" style={{ color: '#FF6B35' }}>hello@talepop.com</a></p>
            <p>We aim to respond within 2 business days.</p>
            <p>Postal address: [Your registered business address]</p>
          </Section>

          <div style={{ background: '#FBF0F0', borderRadius: '10px', padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: '#FF6B35', borderLeft: '3px solid #FF6B35' }}>
            <strong>Note:</strong> This policy has been updated to address COPPA (US), UK Age Appropriate Design Code, and Australian Privacy Act requirements. Before going live with paying customers, have this reviewed by a lawyer familiar with Australian Privacy Act 1988, UK GDPR, and COPPA compliance for children&apos;s digital services.
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#4A3728', fontSize: '0.9375rem', lineHeight: 1.8 }}>
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
          <Link href="/privacy" style={{ color: '#FF6B35', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: '#5E6A7A', textDecoration: 'none' }}>Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
