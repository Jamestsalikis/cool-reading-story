import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  alternates: { canonical: '/terms' },
  description: 'Terms and conditions governing use of TalePop\'s personalised children\'s story service.',
};

const updated = '13 May 2026';

/* ─── Brand tokens ─────────────────────────────────────── */
const navy   = '#0D183D';
const orange = '#FF6B35';
const cream  = '#FFF4E6';
const border = '#F0E4D0';
const muted  = '#5E6A7A';
const body   = '#4A3728';

/* ─── Layout components ─────────────────────────────────── */
function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: '48px' }}>
      <h2 style={{
        fontFamily: "'Fredoka', 'Arial Rounded MT Bold', cursive",
        fontSize: '1.35rem',
        fontWeight: 600,
        color: navy,
        borderBottom: `2px solid ${border}`,
        paddingBottom: '10px',
        marginBottom: '20px',
      }}>
        {title}
      </h2>
      <div style={{ color: body, lineHeight: '1.75', fontSize: '0.9375rem' }}>
        {children}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{
      backgroundColor: navy,
      color: 'white',
      textAlign: 'center',
      padding: '32px 24px',
      fontSize: '0.875rem',
      marginTop: '64px',
    }}>
      <p style={{ margin: '0 0 8px' }}>
        <Link href="/privacy" style={{ color: cream, textDecoration: 'none', marginRight: '16px' }}>Privacy Policy</Link>
        <Link href="/terms" style={{ color: cream, textDecoration: 'none', marginRight: '16px' }}>Terms of Service</Link>
        <a href="mailto:info@talepopstories.com" style={{ color: cream, textDecoration: 'none' }}>info@talepopstories.com</a>
      </p>
      <p style={{ margin: 0, color: muted }}>© {new Date().getFullYear()} TalePop. All rights reserved.</p>
    </footer>
  );
}

/* ─── Shared prose helpers ───────────────────────────────── */
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: '0 0 14px' }}>{children}</p>;
}

function Ul({ children }: { children: React.ReactNode }) {
  return <ul style={{ margin: '0 0 14px', paddingLeft: '20px', listStyleType: 'disc' }}>{children}</ul>;
}

function Ol({ children }: { children: React.ReactNode }) {
  return <ol style={{ margin: '0 0 14px', paddingLeft: '20px' }}>{children}</ol>;
}

function Li({ children }: { children: React.ReactNode }) {
  return <li style={{ marginBottom: '6px' }}>{children}</li>;
}

function InfoBox({ children, variant = 'orange' }: { children: React.ReactNode; variant?: 'orange' | 'green' | 'navy' }) {
  const bg = variant === 'orange' ? '#FFF0E8' : variant === 'green' ? '#ECFDF5' : '#EEF2FF';
  const borderColor = variant === 'orange' ? orange : variant === 'green' ? '#10B981' : navy;
  const textColor = variant === 'orange' ? '#92400E' : variant === 'green' ? '#065F46' : navy;
  return (
    <div style={{
      backgroundColor: bg,
      border: `1.5px solid ${borderColor}`,
      borderRadius: '10px',
      padding: '16px 20px',
      marginBottom: '20px',
      color: textColor,
      fontSize: '0.9rem',
      lineHeight: '1.65',
    }}>
      {children}
    </div>
  );
}

function AutoRenewalBox() {
  return (
    <div style={{
      backgroundColor: '#FEF3C7',
      border: `2px solid #D97706`,
      borderRadius: '10px',
      padding: '16px 20px',
      marginBottom: '24px',
    }}>
      <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#92400E', fontSize: '0.95rem' }}>
        AUTOMATIC RENEWAL NOTICE
      </p>
      <p style={{ margin: 0, color: '#78350F', fontSize: '0.9rem', lineHeight: '1.65' }}>
        Your subscription will automatically renew at the end of each billing period (monthly or annually)
        and your payment method will be charged the applicable fee unless you cancel before the renewal date.
        You can cancel at any time through your account settings page. No cancellation fee applies.
      </p>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function TermsOfServicePage() {
  return (
    <div style={{ backgroundColor: cream, minHeight: '100vh', fontFamily: "'Nunito', system-ui, sans-serif" }}>

      {/* ── Nav ── */}
      <nav style={{
        backgroundColor: navy,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" style={{
          fontFamily: "'Fredoka', 'Arial Rounded MT Bold', cursive",
          fontSize: '1.5rem',
          color: orange,
          textDecoration: 'none',
          fontWeight: 600,
        }}>
          TalePop
        </Link>
        <Link href="/" style={{ color: cream, textDecoration: 'none', fontSize: '0.875rem' }}>← Back to home</Link>
      </nav>

      {/* ── Banner 1: Beta / Research Preview ── */}
      <div style={{
        backgroundColor: orange,
        color: 'white',
        padding: '12px 24px',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '0.9rem',
      }}>
        Beta / Research Preview — TalePop is in active development. Features, pricing, and terms may change.
      </div>

      {/* ── Banner 2: Jurisdiction notice ── */}
      <div style={{
        backgroundColor: '#ECFDF5',
        borderBottom: '1.5px solid #A7F3D0',
        padding: '12px 24px',
        textAlign: 'center',
        color: '#065F46',
        fontSize: '0.875rem',
      }}>
        TalePop is available to users in <strong>Australia</strong>, <strong>Canada</strong>, and the{' '}
        <strong>United States</strong>. These Terms are governed by Australian law but include consumer
        protections required in each jurisdiction.
      </div>

      {/* ── Main content ── */}
      <main style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{
            fontFamily: "'Fredoka', 'Arial Rounded MT Bold', cursive",
            fontSize: '2.25rem',
            color: navy,
            marginBottom: '8px',
          }}>
            Terms of Service
          </h1>
          <p style={{ color: muted, fontSize: '0.875rem', margin: '0 0 4px' }}>
            Last updated: {updated}
          </p>
          <p style={{ color: body, fontSize: '0.9375rem', marginTop: '16px', lineHeight: '1.7' }}>
            Please read these Terms of Service carefully before using TalePop. By creating an account or using
            any part of the TalePop service, you agree to be bound by these Terms. If you do not agree, do not
            use the service.
          </p>
        </div>

        {/* ── Section 1 ── */}
        <Section id="about" title="1. About These Terms">
          <P>
            These Terms of Service ("Terms") form a legally binding agreement between you (the parent or
            guardian who created the account) and TalePop, an online service operated from Australia
            ("TalePop," "we," "us," or "our").
          </P>
          <P>
            TalePop provides an AI-powered personalised children&apos;s storytelling platform that generates
            custom stories and illustrations featuring a child&apos;s name, interests, and personal details as
            entered by the parent or guardian ("the Service").
          </P>
          <P>
            These Terms were last updated on {updated}. When we make material changes to these Terms, we will
            notify you by email and update this page. Your continued use of TalePop after notification
            constitutes acceptance of the updated Terms.
          </P>
          <P>
            These Terms must be read together with our{' '}
            <Link href="/privacy" style={{ color: orange }}>Privacy Policy</Link>, which is incorporated into
            these Terms by reference and explains how we collect and use your information.
          </P>
        </Section>

        {/* ── Section 2 ── */}
        <Section id="eligibility" title="2. Eligibility">
          <P>
            To use TalePop, you must be at least 18 years of age and have the legal capacity to enter into a
            binding contract. By creating an account, you represent and warrant that you are at least 18 years
            old and are the parent or legal guardian of any child for whom you create a child profile.
          </P>
          <P>
            TalePop accounts are created and managed exclusively by adults. Children do not create accounts on
            TalePop and do not interact directly with the account management interface. All personal information
            about a child is entered by the parent or guardian on the child&apos;s behalf.
          </P>
          <P>
            TalePop is currently available to users in Australia, Canada, and the United States. If you are
            accessing the service from another country, you do so at your own risk and are responsible for
            compliance with local laws.
          </P>
          <InfoBox variant="navy">
            <strong>Canadian users:</strong> If you are accessing TalePop from Canada, you confirm you are at
            least 18 years old (or the applicable age of majority in your province or territory). Under
            Canada&apos;s Personal Information Protection and Electronic Documents Act (PIPEDA) and provincial
            privacy legislation, meaningful consent for the collection and use of a child&apos;s personal information
            requires parental or guardian authorisation. All accounts on TalePop are created and managed by
            adults on behalf of their family.
          </InfoBox>
        </Section>

        {/* ── Section 3 ── */}
        <Section id="account" title="3. Your Account">
          <P>
            You are responsible for maintaining the security and confidentiality of your account login
            credentials. Do not share your password with anyone. You are responsible for all activity that
            occurs under your account.
          </P>
          <P>
            You must provide accurate and complete information when creating your account, including a valid
            email address. You agree to update your account information promptly if it changes.
          </P>
          <P>
            If you suspect unauthorised access to your account, notify us immediately at{' '}
            <a href="mailto:info@talepopstories.com" style={{ color: orange }}>info@talepopstories.com</a>. We are not
            liable for any loss or damage resulting from unauthorised access due to your failure to protect
            your credentials.
          </P>
          <P>
            You may delete your account at any time through the account settings page. Upon deletion, we will
            remove your personal data and your child profiles in accordance with our{' '}
            <Link href="/privacy" style={{ color: orange }}>Privacy Policy</Link>.
          </P>
        </Section>

        {/* ── Section 4 ── */}
        <Section id="billing" title="4. Subscription and Billing">
          <AutoRenewalBox />

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>4.1 Plans</p>
          <P>
            TalePop offers the following subscription options:
          </P>
          <Ul>
            <Li>
              <strong>Free tier:</strong> Access to 3 complimentary stories to try the service. No payment required.
            </Li>
            <Li>
              <strong>Monthly subscription:</strong> Full access to personalised story generation and all current
              features. Billed monthly in advance.
            </Li>
            <Li>
              <strong>Annual subscription:</strong> Full access at a discounted rate. Billed annually in advance.
            </Li>
            <Li>
              <strong>Extra story (one-time):</strong> A single additional story may be purchased for the current
              day outside the standard daily limit.
            </Li>
          </Ul>
          <P>
            Current pricing is displayed at the point of purchase. We reserve the right to change pricing with
            30 days&apos; notice. Price changes will not apply to your current billing period — they will take
            effect from your next renewal date.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>4.2 Billing and Payment</p>
          <P>
            Payments are processed by our third-party payment service provider. By subscribing, you authorise
            TalePop to charge your nominated payment method the applicable subscription fee at the start of
            each billing period. All amounts are in Australian dollars (AUD) unless otherwise stated at the
            point of purchase.
          </P>
          <P>
            If a payment fails, we will retry the payment and notify you by email. Continued payment failure
            may result in suspension or cancellation of your subscription.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>4.3 Cancellation</p>
          <P>
            You may cancel your subscription at any time through the account settings page. Your access to
            paid features will continue until the end of the current billing period. We do not provide partial
            refunds for unused periods except where required by law.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>4.4 Refunds</p>
          <P>
            We offer a full refund if requested within 14 days of your initial subscription payment, provided
            you have not generated more than 5 personalised stories during that period. To request a refund,
            contact <a href="mailto:info@talepopstories.com" style={{ color: orange }}>info@talepopstories.com</a>.
          </P>

          <InfoBox variant="green">
            <strong>Australian Consumer Law:</strong> Subscription fees and billing practices are subject to
            the Australian Consumer Law (ACL, Competition and Consumer Act 2010, Schedule 2). Your statutory
            rights under the ACL — including rights to remedies for services that fail to meet consumer
            guarantees — are not excluded by these Terms. Nothing in this section limits any right you have
            under the ACL.
          </InfoBox>

          <InfoBox variant="navy">
            <strong>Canadian consumers — Quebec distance contracts:</strong> If you are a Quebec resident, you
            have the right to cancel a distance contract (including a subscription entered into online) within
            10 days of receiving your contract confirmation, without providing a reason and without penalty,
            pursuant to the Consumer Protection Act (RLRQ, c. P-40.1). To exercise this right, notify us at{' '}
            <a href="mailto:info@talepopstories.com" style={{ color: navy, fontWeight: 600 }}>info@talepopstories.com</a>{' '}
            within 10 days of account creation. Other Canadian provinces also provide cancellation rights under
            their respective consumer protection legislation; contact us to exercise any such right.
          </InfoBox>
        </Section>

        {/* ── Section 5 ── */}
        <Section id="ai-content" title="5. AI-Generated Content">
          <P>
            TalePop uses artificial intelligence to generate story text and illustrations. By using TalePop,
            you understand and acknowledge the following:
          </P>
          <Ul>
            <Li>
              AI-generated stories are creative outputs produced by machine learning models based on the
              child profile information you provide. They are not written by human authors.
            </Li>
            <Li>
              Story and illustration outputs may occasionally contain unexpected, imperfect, or
              unintended content. We implement content filtering and safety guidelines but cannot
              guarantee that all outputs will meet every family&apos;s expectations.
            </Li>
            <Li>
              You should review generated stories before sharing them with your child. If you encounter
              content you consider inappropriate, please report it to{' '}
              <a href="mailto:info@talepopstories.com" style={{ color: orange }}>info@talepopstories.com</a>.
            </Li>
            <Li>
              Generated stories and illustrations are provided for personal, non-commercial family use.
              You may not reproduce, distribute, or commercialise TalePop-generated content.
            </Li>
            <Li>
              TalePop does not claim copyright in AI-generated outputs. The stories are generated for
              your personal use only.
            </Li>
            <Li>
              AI-generated content is creative fiction and is not intended to be factually accurate. Story
              content should not be relied upon as educational fact.
            </Li>
          </Ul>
          <InfoBox variant="orange">
            <strong>COPPA Notice:</strong> We do not knowingly collect personal information from children
            under 13 for any purpose other than generating personalised stories for that child, as directed
            by their parent or legal guardian. All such data is handled in accordance with the Children&apos;s
            Online Privacy Protection Act (COPPA, 16 C.F.R. Part 312). Parents may review, correct, or
            request deletion of their child&apos;s personal information at any time by contacting{' '}
            <a href="mailto:info@talepopstories.com" style={{ color: orange, fontWeight: 600 }}>info@talepopstories.com</a>.
          </InfoBox>
        </Section>

        {/* ── Section 6 ── */}
        <Section id="acceptable-use" title="6. Acceptable Use">
          <P>
            By using TalePop, you agree not to:
          </P>
          <Ul>
            <Li>Provide false, misleading, or fraudulent information when creating an account or child profile</Li>
            <Li>Attempt to access, probe, or reverse-engineer TalePop&apos;s AI systems, prompts, or backend infrastructure</Li>
            <Li>Use TalePop for any commercial purpose, including reselling or redistributing generated stories</Li>
            <Li>Use the service in any way that violates applicable laws or regulations, including privacy, child protection, and consumer protection laws</Li>
            <Li>Attempt to circumvent or disable content safety measures or filters</Li>
            <Li>Use automated tools, scripts, or bots to access the service at a rate beyond normal human usage</Li>
            <Li>Share your account credentials with others or create accounts on behalf of children</Li>
            <Li>Submit profile information intended to generate content that is harmful, offensive, discriminatory, or in violation of any third party&apos;s rights</Li>
          </Ul>
          <P>
            We reserve the right to suspend or terminate your account if we reasonably believe you have
            violated these acceptable use obligations, with or without prior notice depending on the
            severity of the breach.
          </P>
        </Section>

        {/* ── Section 7 ── */}
        <Section id="acl-guarantees" title="7. Consumer Protections by Jurisdiction">

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>7.1 Australia — Australian Consumer Law</p>
          <InfoBox variant="green">
            <strong>Your statutory rights under the Australian Consumer Law cannot be excluded.</strong>
          </InfoBox>
          <P>
            Our services come with guarantees that cannot be excluded under the Australian Consumer Law
            (Competition and Consumer Act 2010, Schedule 2). Under these consumer guarantees, you are
            entitled to:
          </P>
          <Ul>
            <Li>A replacement or refund for a major failure in the service, and compensation for any other reasonably foreseeable loss or damage arising from that failure</Li>
            <Li>Have services remedied (or receive a price reduction) if they are not of acceptable quality and the failure does not amount to a major failure</Li>
          </Ul>
          <P>
            A service fails to meet the consumer guarantee of acceptable quality if it is not fit for the
            purpose for which services of that kind are commonly supplied (personalised story generation
            for children), not provided with due care and skill, or not provided within a reasonable time.
            Nothing in these Terms excludes, restricts, or modifies any right or remedy, or any guarantee,
            warranty, or other term or condition, implied or imposed by the Australian Consumer Law.
          </P>
          <P>
            If you believe TalePop has failed to meet a consumer guarantee, please contact us at{' '}
            <a href="mailto:info@talepopstories.com" style={{ color: orange }}>info@talepopstories.com</a> in the
            first instance. We will work with you to provide a fair remedy.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>7.2 Canada — Consumer Protection</p>
          <P>
            Canadian consumers have rights under applicable provincial consumer protection legislation,
            including but not limited to the Consumer Protection Act 2002 (Ontario), the Consumer Protection
            Act (RLRQ, c. P-40.1) (Quebec), the Business Practices and Consumer Protection Act (British
            Columbia), and equivalent statutes in other provinces and territories. The federal Competition Act
            (R.S.C. 1985, c. C-34) also applies to TalePop&apos;s business practices.
          </P>
          <P>
            These provincial and federal rights cannot be overridden by TalePop&apos;s choice of Australian
            governing law. Nothing in these Terms limits, excludes, or restricts any right you have under
            applicable Canadian consumer protection law.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>7.3 United States — Consumer Protection</p>
          <P>
            US consumers have rights under applicable federal and state consumer protection laws, including
            the Federal Trade Commission Act (15 U.S.C. §45) and equivalent state consumer protection
            statutes. California consumers have additional rights under the California Consumer Privacy Act
            (CCPA/CPRA) as described in our{' '}
            <Link href="/privacy" style={{ color: orange }}>Privacy Policy</Link>.
          </P>
          <P>
            Nothing in these Terms limits, excludes, or restricts any right you have under applicable US
            federal or state consumer protection law.
          </P>
        </Section>

        {/* ── Section 8 ── */}
        <Section id="disclaimer" title="8. Disclaimer of Warranties">
          <P>
            To the maximum extent permitted by applicable law, TalePop is provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; without warranties of any kind, whether express, implied, or statutory. We do
            not warrant that:
          </P>
          <Ul>
            <Li>The service will be uninterrupted, error-free, or available at all times</Li>
            <Li>AI-generated stories and illustrations will meet your specific expectations or requirements</Li>
            <Li>The service will be free from security vulnerabilities or that unauthorised access will never occur</Li>
            <Li>Story content will be factually accurate (AI-generated content is creative fiction and not intended to be factual)</Li>
          </Ul>
          <P>
            This disclaimer applies to the maximum extent permitted by applicable law and does not affect
            your statutory rights under the Australian Consumer Law or other applicable mandatory consumer
            protection legislation in Australia, Canada, or the United States. Implied guarantees and
            warranties that cannot be excluded by law continue to apply.
          </P>
        </Section>

        {/* ── Section 9 ── */}
        <Section id="liability" title="9. Limitation of Liability">
          <P>
            To the maximum extent permitted by applicable law, our total aggregate liability to you for any
            claim arising from or related to your use of TalePop — whether in contract, tort, negligence,
            under statute, or otherwise — is limited to the total amount you paid to TalePop in the 30 days
            immediately preceding the event giving rise to the claim.
          </P>
          <P>
            We are not liable for any indirect, incidental, special, punitive, or consequential damages,
            including but not limited to: loss of data, loss of profits, loss of business, emotional distress,
            or any loss arising from your reliance on AI-generated content.
          </P>
          <P>
            This limitation of liability does not apply to, and nothing in these Terms is intended to
            exclude or restrict:
          </P>
          <Ul>
            <Li>(a) any liability that cannot be excluded or limited under the Australian Consumer Law, including liability for major failures to comply with consumer guarantees</Li>
            <Li>(b) any liability that cannot be excluded or limited under applicable Canadian consumer protection legislation, including provincial consumer protection statutes</Li>
            <Li>(c) any liability that cannot be excluded or limited under applicable United States federal or state consumer protection law</Li>
            <Li>(d) any liability arising from our fraud or wilful misconduct</Li>
            <Li>(e) any liability arising from our breach of our data protection and privacy obligations under the Privacy Act 1988 (Cth), PIPEDA, or COPPA</Li>
          </Ul>
        </Section>

        {/* ── Section 10 ── */}
        <Section id="changes" title="10. Changes to the Service and These Terms">
          <P>
            We may update, modify, or discontinue any part of the TalePop service at any time. During the
            beta / research preview phase, the service is in active development and features may change
            significantly. We will endeavour to provide reasonable notice of material changes.
          </P>
          <P>
            We may update these Terms at any time. When we make material changes, we will:
          </P>
          <Ul>
            <Li>Update the &ldquo;Last updated&rdquo; date at the top of this page</Li>
            <Li>Send an email notification to your registered account email address</Li>
            <Li>Where required by law, seek fresh consent before applying changes that materially alter your rights</Li>
          </Ul>
          <P>
            If you do not accept the updated Terms, you may close your account before the changes take
            effect. Continued use of the service after the effective date of updated Terms constitutes
            your acceptance of those changes.
          </P>
          <P>
            For Quebec residents: material amendments to a distance contract require notice and, where
            required by the Consumer Protection Act (RLRQ, c. P-40.1), your express agreement to the
            amended terms before they take effect in relation to your subscription.
          </P>
        </Section>

        {/* ── Section 11 ── */}
        <Section id="governing-law" title="11. Governing Law and Jurisdiction">
          <P>
            These Terms are governed by and construed in accordance with the laws of New South Wales,
            Australia, and you submit to the non-exclusive jurisdiction of the courts of New South Wales
            for the resolution of any dispute arising under or in connection with these Terms.
          </P>
          <P>
            However, this choice of law does not override mandatory consumer protections available to you
            under the laws of your jurisdiction of residence:
          </P>
          <Ul>
            <Li>
              <strong>Canada:</strong> If you are a consumer resident in Canada, you retain the benefit of
              mandatory consumer protections under applicable federal and provincial law, including the
              Competition Act (R.S.C. 1985, c. C-34), provincial consumer protection statutes, PIPEDA, and
              Quebec Law 25. These rights cannot be displaced by a choice of Australian governing law.
              Nothing in these Terms limits your right to bring a complaint before the Office of the Privacy
              Commissioner of Canada, the Commission d&apos;accès à l&apos;information du Québec (for Quebec
              residents), or any other applicable regulatory authority.
            </Li>
            <Li>
              <strong>California, United States:</strong> If you are a California resident, you have
              additional rights under the California Consumer Privacy Act (CCPA) as described in our{' '}
              <Link href="/privacy" style={{ color: orange }}>Privacy Policy</Link>. These rights cannot
              be excluded by choice of Australian law.
            </Li>
            <Li>
              <strong>All jurisdictions:</strong> Nothing in this clause limits your rights under mandatory
              consumer protection laws in your jurisdiction of residence.
            </Li>
          </Ul>
        </Section>

        {/* ── Section 12 ── */}
        <Section id="disputes" title="12. Dispute Resolution">
          <P>
            We are committed to resolving complaints and disputes quickly and fairly. Before escalating any
            dispute to formal legal proceedings, please follow these steps:
          </P>
          <Ol>
            <Li>
              Contact us at <a href="mailto:info@talepopstories.com" style={{ color: orange }}>info@talepopstories.com</a>{' '}
              with a clear description of your concern, what you believe has gone wrong, and what outcome
              you are seeking.
            </Li>
            <Li>
              We will acknowledge your contact within 2 business days and provide a substantive response
              within 5 business days with a proposed resolution.
            </Li>
            <Li>
              If we are unable to resolve the dispute to your satisfaction through direct communication,
              you may escalate to the relevant authority in your jurisdiction:
              <Ul>
                <Li>
                  <strong>Australia:</strong> Australian Competition and Consumer Commission (ACCC) at{' '}
                  <a href="https://www.accc.gov.au" style={{ color: orange }} target="_blank" rel="noopener noreferrer">accc.gov.au</a>,
                  or your relevant state or territory fair trading office
                </Li>
                <Li>
                  <strong>Canada (federal):</strong> Office of the Privacy Commissioner of Canada (OPC) at{' '}
                  <a href="https://www.priv.gc.ca" style={{ color: orange }} target="_blank" rel="noopener noreferrer">priv.gc.ca</a>{' '}
                  for privacy matters; Competition Bureau Canada at{' '}
                  <a href="https://www.competitionbureau.gc.ca" style={{ color: orange }} target="_blank" rel="noopener noreferrer">competitionbureau.gc.ca</a>{' '}
                  for consumer protection matters
                </Li>
                <Li>
                  <strong>Canada (Quebec):</strong> Office de la protection du consommateur (OPC) at{' '}
                  <a href="https://www.opc.gouv.qc.ca" style={{ color: orange }} target="_blank" rel="noopener noreferrer">opc.gouv.qc.ca</a>,
                  or the Commission d&apos;accès à l&apos;information du Québec (CAI) at{' '}
                  <a href="https://www.cai.gouv.qc.ca" style={{ color: orange }} target="_blank" rel="noopener noreferrer">cai.gouv.qc.ca</a>{' '}
                  for privacy matters; or your provincial Attorney General&apos;s office
                </Li>
                <Li>
                  <strong>United States:</strong> Federal Trade Commission (FTC) at{' '}
                  <a href="https://www.ftc.gov" style={{ color: orange }} target="_blank" rel="noopener noreferrer">ftc.gov</a>,
                  or your relevant state attorney general&apos;s consumer protection division
                </Li>
              </Ul>
            </Li>
          </Ol>
          <P>
            Nothing in this dispute resolution clause prevents you from exercising your statutory right to
            commence legal proceedings in a court of competent jurisdiction, or from referring a dispute to
            a relevant ombudsman or regulatory body.
          </P>
        </Section>

        {/* ── Section 13 ── */}
        <Section id="contact" title="13. Contact Us">
          <P>
            For any questions, concerns, or requests relating to these Terms or the TalePop service:
          </P>
          <Ul>
            <Li>
              <strong>Email:</strong>{' '}
              <a href="mailto:info@talepopstories.com" style={{ color: orange }}>info@talepopstories.com</a>
            </Li>
          </Ul>
          <P>
            We aim to respond to all enquiries within 2 business days.
          </P>
        </Section>

      </main>

      <Footer />
    </div>
  );
}
