import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — TalePop',
  description: 'How TalePop collects, uses and protects your personal information and your child\'s data.',
};

const updated = '11 May 2026';

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
        <a href="mailto:hello@talepop.com" style={{ color: cream, textDecoration: 'none' }}>hello@talepop.com</a>
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

function Li({ children }: { children: React.ReactNode }) {
  return <li style={{ marginBottom: '6px' }}>{children}</li>;
}

function LawyerTag({ children }: { children: React.ReactNode }) {
  return (
    <strong style={{ color: '#B45309', backgroundColor: '#FEF3C7', padding: '1px 4px', borderRadius: '3px', fontSize: '0.875em' }}>
      [LAWYER: {children}]
    </strong>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        {children}
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      backgroundColor: navy,
      color: 'white',
      padding: '10px 12px',
      textAlign: 'left',
      fontWeight: 600,
      fontSize: '0.875rem',
    }}>
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td style={{
      padding: '10px 12px',
      borderBottom: `1px solid ${border}`,
      verticalAlign: 'top',
    }}>
      {children}
    </td>
  );
}

function Tr({ children, shade }: { children: React.ReactNode; shade?: boolean }) {
  return (
    <tr style={{ backgroundColor: shade ? cream : 'white' }}>
      {children}
    </tr>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function PrivacyPolicyPage() {
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

      {/* ── Draft warning banner ── */}
      <div style={{
        backgroundColor: orange,
        color: 'white',
        padding: '12px 24px',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '0.9rem',
      }}>
        DRAFT FOR LAWYER REVIEW — Items marked [LAWYER: ...] require completion before launch.
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
            Privacy Policy
          </h1>
          <p style={{ color: muted, fontSize: '0.875rem', margin: '0 0 4px' }}>
            Last updated: {updated}
          </p>
          <p style={{ color: body, fontSize: '0.9375rem', marginTop: '16px', lineHeight: '1.7' }}>
            At TalePop, your family's privacy is not a footnote — it is central to how we build everything. This
            Privacy Policy explains what personal information we collect, why we collect it, how we use it, and the
            rights you have in relation to it. It applies to parents and guardians who create accounts, and to the
            child profiles created within those accounts.
          </p>
          <p style={{ color: body, fontSize: '0.9375rem', marginTop: '12px', lineHeight: '1.7' }}>
            TalePop is designed for use in Australia, the United Kingdom, and the United States. Different legal
            frameworks apply in each jurisdiction. Where relevant, we call out jurisdiction-specific obligations.
          </p>
        </div>

        {/* ── Section 1 ── */}
        <Section id="who-we-are" title="1. Who We Are">
          <P>
            TalePop is operated by <LawyerTag>Insert registered company name</LawyerTag> ABN{' '}
            <LawyerTag>Insert ABN</LawyerTag>, with registered address at{' '}
            <LawyerTag>Insert registered business address</LawyerTag>, Australia.
          </P>
          <P>
            TalePop is the data controller for parent account information and child profile data stored on our platform.
          </P>

          <p style={{ margin: '0 0 6px', fontWeight: 600, color: navy }}>UK Article 27 Representative</p>
          <P>
            <LawyerTag>
              Appoint an Article 27 UK GDPR representative before UK launch. This is required under UK GDPR
              Article 27 for businesses not established in the UK but offering services to UK users. The
              representative must be named and contactable. Insert their name and contact details here.
            </LawyerTag>
          </P>

          <p style={{ margin: '0 0 6px', fontWeight: 600, color: navy }}>ICO Registration</p>
          <P>
            <LawyerTag>
              Register with the Information Commissioner's Office (ico.org.uk) before UK launch. Registration
              is mandatory for data controllers processing personal data in relation to UK users. The annual
              fee is approximately £40–£60 depending on organisation size. Insert ICO registration number here
              once obtained.
            </LawyerTag>
          </P>

          <p style={{ margin: '0 0 6px', fontWeight: 600, color: navy }}>Contact</p>
          <P>
            For all privacy enquiries: <a href="mailto:hello@talepop.com" style={{ color: orange }}>hello@talepop.com</a>
          </P>
        </Section>

        {/* ── Section 2 ── */}
        <Section id="information-we-collect" title="2. Information We Collect">
          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>2.1 Parent / Guardian Account Information</p>
          <Ul>
            <Li>Email address (used for login, account communications, and as the verified parental contact for COPPA purposes)</Li>
            <Li>Password (hashed and never stored in plaintext)</Li>
            <Li>Payment information (processed and stored by Stripe — we do not store card numbers)</Li>
            <Li>Subscription tier and billing history</Li>
          </Ul>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>2.2 Child Profile Data</p>
          <P>
            Parents create child profiles to personalise stories. This may include:
          </P>
          <Ul>
            <Li>Child's first name or nickname</Li>
            <Li>Age</Li>
            <Li>Gender (if provided)</Li>
            <Li>Interests and hobbies</Li>
            <Li>Reading level preference</Li>
            <Li>Names of siblings, friends, and pets (first name or nickname only)</Li>
            <Li>City and country (optional, used for story setting)</Li>
          </Ul>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>2.3 Child Appearance Data (Sensitive Information)</p>
          <P>
            Parents may optionally provide appearance descriptors for their child, including hair colour, eye colour,
            and other physical descriptors. These are used to generate illustrations and story descriptions that
            reflect the child's appearance.
          </P>
          <P>
            Some appearance descriptors — such as those indicating racial or ethnic background — may constitute
            sensitive information under the Australian Privacy Act 1988, section 6 (definition of "sensitive
            information"), and special category data under UK GDPR Article 9. The provision of appearance data
            is entirely optional. Where such data is provided, TalePop relies on explicit consent, which is
            obtained at the time of account creation and child profile setup. You may omit appearance data
            entirely without affecting the core functionality of TalePop.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>2.4 Generated Content</p>
          <Ul>
            <Li>Stories generated for each child profile</Li>
            <Li>Illustrations generated for each story</Li>
            <Li>Story ratings and feedback (optional)</Li>
          </Ul>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>2.5 Technical Data</p>
          <Ul>
            <Li>IP address and approximate location (via Vercel hosting infrastructure)</Li>
            <Li>Browser type and device information</Li>
            <Li>Pages visited and time spent (aggregated analytics only)</Li>
            <Li>Error logs for debugging purposes</Li>
          </Ul>
        </Section>

        {/* ── Section 3 ── */}
        <Section id="legal-basis" title="3. Legal Basis for Processing (UK GDPR)">
          <P>
            For users in the United Kingdom, TalePop processes personal data under the following lawful bases
            under UK GDPR Article 6:
          </P>
          <Table>
            <thead>
              <tr>
                <Th>Processing activity</Th>
                <Th>Lawful basis</Th>
              </tr>
            </thead>
            <tbody>
              <Tr>
                <Td>Creating and managing your account</Td>
                <Td>Art. 6(1)(b) — performance of a contract</Td>
              </Tr>
              <Tr shade>
                <Td>Generating personalised stories and illustrations</Td>
                <Td>Art. 6(1)(b) — performance of a contract</Td>
              </Tr>
              <Tr>
                <Td>Processing subscription payments</Td>
                <Td>Art. 6(1)(b) — performance of a contract</Td>
              </Tr>
              <Tr shade>
                <Td>Sending transactional emails (account confirmation, subscription receipts)</Td>
                <Td>Art. 6(1)(b) — performance of a contract</Td>
              </Tr>
              <Tr>
                <Td>Sending marketing communications</Td>
                <Td>Art. 6(1)(a) — consent (opt-in at registration)</Td>
              </Tr>
              <Tr shade>
                <Td>Maintaining security logs and preventing fraud</Td>
                <Td>Art. 6(1)(f) — legitimate interests (security and integrity of the service)</Td>
              </Tr>
              <Tr>
                <Td>Product analytics and service improvement</Td>
                <Td>Art. 6(1)(f) — legitimate interests (improving the service for all users)</Td>
              </Tr>
              <Tr shade>
                <Td>Processing optional appearance data</Td>
                <Td>Art. 9(2)(a) — explicit consent (for special category data)</Td>
              </Tr>
              <Tr>
                <Td>Sending child profile data to AI processors (Anthropic, Replicate)</Td>
                <Td>Art. 6(1)(b) — contract performance + Art. 6(1)(f) — legitimate interests, subject to Legitimate Interests Assessment (LIA)</Td>
              </Tr>
            </tbody>
          </Table>
          <P>
            For UK users, TalePop processes children's personal data as part of providing the service. Where we
            rely on legitimate interests as a lawful basis for processing children's data, we apply a higher
            threshold of scrutiny. A Legitimate Interests Assessment (LIA) has been conducted and is available
            on request by emailing <a href="mailto:hello@talepop.com" style={{ color: orange }}>hello@talepop.com</a>.
          </P>
          <P>
            For Australian users, TalePop collects and uses personal information in accordance with the
            Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth). For US users, we comply
            with the Children's Online Privacy Protection Act (COPPA, 16 C.F.R. Part 312) and, where
            applicable, the California Consumer Privacy Act (CCPA).
          </P>
        </Section>

        {/* ── Section 4 ── */}
        <Section id="childrens-privacy" title="4. Children's Privacy">
          <P>
            TalePop is a service for families. Parents and guardians create and manage all accounts. Children
            do not interact directly with TalePop — they do not create accounts, enter information, or see
            account management interfaces. All personal information about a child is entered by the
            parent or guardian.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>4.1 COPPA — Verifiable Parental Consent (United States)</p>
          <P>
            TalePop is subject to the Children's Online Privacy Protection Act (COPPA). We do not knowingly
            collect personal information from children under 13 for any purpose other than generating
            personalised stories for that child as directed by their parent or legal guardian.
          </P>
          <P>
            TalePop obtains verifiable parental consent through the Stripe payment transaction process. A credit
            card or debit card payment by the parent constitutes a monetary transaction that generates a
            notification to the primary cardholder, which is an FTC-approved method of verifiable parental
            consent under 16 C.F.R. §312.5(b)(2). The act of completing payment and creating child profiles
            constitutes verifiable parental consent for TalePop to collect and use the child profile data
            described in this policy.
          </P>
          <P>
            An alternative consent mechanism is available for users who are unable to use the payment-based
            method. To request an alternative consent process, please email{' '}
            <a href="mailto:hello@talepop.com" style={{ color: orange }}>hello@talepop.com</a>.
          </P>
          <P>
            Parents may at any time review the personal information collected about their child, request
            corrections, or request deletion of their child's profile and all associated data by contacting
            us at <a href="mailto:hello@talepop.com" style={{ color: orange }}>hello@talepop.com</a> or through
            the account settings page.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>4.2 UK Children's Code (Age Appropriate Design Code)</p>
          <P>
            TalePop is subject to the UK Age Appropriate Design Code (AADC) issued by the ICO. A Data Protection
            Impact Assessment (DPIA) has been{' '}
            <LawyerTag>conducted / is being conducted — confirm status</LawyerTag> prior to launch in
            accordance with UK GDPR Article 35 and the ICO's DPIA guidance.
          </P>
          <P>
            In compliance with the Children's Code: children's data is not used for profiling beyond
            personalising the individual child's own stories. We do not profile children for commercial
            purposes. We do not use nudge techniques, serve targeted advertising, or create commercial
            profiles of children. Geolocation data is not collected beyond the optional city/country field
            entered by the parent for story personalisation purposes.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>4.3 Australian Children's Online Privacy Code</p>
          <P>
            Australia's Online Safety Act 2021 and the proposed Australian Children's Online Privacy Code
            (anticipated to come into effect by December 2026) establish obligations for online services
            likely to be accessed by children. TalePop is actively designing all data handling practices
            around the best interests of the child as the primary consideration, consistent with the
            expected requirements of the Australian Children's Online Privacy Code. We will update this
            policy and our practices as the Code is finalised and enacted.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>4.4 Profiling — All Jurisdictions</p>
          <P>
            We use child profile data solely to generate that specific child's personalised stories and
            illustrations. We do not create cross-child profiles, behavioural databases, or commercial
            profiles of children. AI personalisation is strictly limited to story and illustration
            generation for the individual child profile. Child profile data is never used to train AI
            models or for any analytical purpose beyond delivering the requested story.
          </P>
        </Section>

        {/* ── Section 5 ── */}
        <Section id="how-we-use" title="5. How We Use Your Information">
          <P>We use the information we collect to:</P>
          <Ul>
            <Li>Create and manage your parent account</Li>
            <Li>Generate personalised stories and illustrations for your child profiles</Li>
            <Li>Process subscription payments and manage billing</Li>
            <Li>Send transactional emails including account confirmations, password resets, and subscription receipts</Li>
            <Li>Send marketing or product update emails (where you have opted in)</Li>
            <Li>Provide customer support when you contact us</Li>
            <Li>Detect, investigate, and prevent fraudulent or unauthorised use of the service</Li>
            <Li>Comply with our legal obligations in Australia, the United Kingdom, and the United States</Li>
            <Li>Improve the quality, reliability, and relevance of story generation (using aggregated, de-identified analytics only — not individual child profiles)</Li>
          </Ul>
          <P>
            We do not sell your personal information or your child's personal information to any third party.
            We do not use your information for targeted advertising.
          </P>
        </Section>

        {/* ── Section 6 ── */}
        <Section id="third-parties" title="6. Third-Party Services and Data Processors">
          <P>
            TalePop uses trusted third-party services to deliver the platform. The following table lists
            each data processor, the country in which they operate, their purpose, what child data (if any)
            is transmitted to them, and a link to their privacy policy. All processors are engaged under
            data processing agreements that contractually limit their use of data to the specified purpose.
          </P>
          <Table>
            <thead>
              <tr>
                <Th>Processor</Th>
                <Th>Country</Th>
                <Th>Purpose</Th>
                <Th>Child data transmitted</Th>
                <Th>Privacy policy</Th>
              </tr>
            </thead>
            <tbody>
              <Tr>
                <Td><strong>Supabase</strong></Td>
                <Td>Australia (ap-southeast-2 region)</Td>
                <Td>Database and authentication — all account and profile data is stored here</Td>
                <Td>Parent account, child profiles (name, age, gender, interests, appearance descriptors, generated stories)</Td>
                <Td><a href="https://supabase.com/privacy" style={{ color: orange }}>supabase.com/privacy</a></Td>
              </Tr>
              <Tr shade>
                <Td><strong>Anthropic (Claude API)</strong></Td>
                <Td>United States</Td>
                <Td>AI story text generation — the Claude API generates the story narrative based on the child's profile</Td>
                <Td>Child's name, age, gender, interests, reading level, and optionally appearance descriptors, sibling names, friend names, pet name, city, and country — as entered by the parent</Td>
                <Td><a href="https://www.anthropic.com/privacy" style={{ color: orange }}>anthropic.com/privacy</a></Td>
              </Tr>
              <Tr>
                <Td><strong>Replicate (Flux Schnell API)</strong></Td>
                <Td>United States</Td>
                <Td>AI illustration generation — the Flux Schnell model generates illustrations for each story page</Td>
                <Td>Image description prompts derived from the child profile, including appearance descriptors and scene descriptions from the story</Td>
                <Td><a href="https://replicate.com/privacy" style={{ color: orange }}>replicate.com/privacy</a></Td>
              </Tr>
              <Tr shade>
                <Td><strong>Stripe</strong></Td>
                <Td>United States</Td>
                <Td>Subscription payment processing</Td>
                <Td>Parent email address and payment card details only — no child data is transmitted to Stripe</Td>
                <Td><a href="https://stripe.com/privacy" style={{ color: orange }}>stripe.com/privacy</a></Td>
              </Tr>
              <Tr>
                <Td><strong>Vercel</strong></Td>
                <Td>United States</Td>
                <Td>Web hosting and application deployment</Td>
                <Td>Web traffic logs (IP address, request metadata) — no structured child profile data</Td>
                <Td><a href="https://vercel.com/legal/privacy-policy" style={{ color: orange }}>vercel.com/privacy</a></Td>
              </Tr>
            </tbody>
          </Table>
          <P>
            Child profile data transmitted to Anthropic and Replicate is used solely to generate the requested
            story and illustrations for that child. We have reviewed the data processing terms of both
            processors and{' '}
            <LawyerTag>
              confirm / are in the process of confirming that submitted data is not used for AI model training
              without explicit consent — verify API terms for Anthropic and Replicate and update this clause accordingly
            </LawyerTag>. We will execute data processing agreements with each processor prior to launch that
            contractually prohibit any secondary use of child profile data, including use for model training,
            profiling, or any purpose other than generating the requested output.
          </P>
        </Section>

        {/* ── Section 7 ── */}
        <Section id="international-transfers" title="7. International Data Transfers">
          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>7a. Australia to United States (Anthropic, Replicate, Stripe, Vercel)</p>
          <P>
            Under Australian Privacy Principle 8 (APP 8) of the Privacy Act 1988 (Cth), before disclosing
            personal information to overseas recipients, TalePop takes reasonable steps to ensure those
            recipients protect the information consistently with the Australian Privacy Principles. The United
            States does not have a law substantially similar to Australia's Privacy Act.
          </P>
          <P>
            TalePop relies on contractual protections — specifically data processing agreements — with each
            US-based processor (Anthropic, Replicate, Stripe, and Vercel) as the mechanism to ensure
            equivalent protection.{' '}
            <LawyerTag>
              Verify that APP 8.2(b) consent language is clearly captured in the sign-up flow and that
              the terms presented to users at account creation adequately disclose the transfer to US
              processors and the limitations of Australian recourse.
            </LawyerTag>
          </P>
          <P>
            By using TalePop and creating child profiles, you acknowledge that personal information may be
            disclosed to US-based processors that are not required to comply with the Australian Privacy
            Principles, and that you may have limited recourse under Australian law if such a processor
            mishandles your information. This acknowledgement is recorded as part of your account creation.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>7b. UK to Australia and United States</p>
          <P>
            <strong>Data stored in Australia (Supabase ap-southeast-2):</strong> Australia does not have
            a UK adequacy decision. Transfers of personal data from UK users to Australia are governed by
            a UK International Data Transfer Agreement (IDTA) executed with Supabase, together with a
            Transfer Risk Assessment (TRA) conducted in accordance with ICO guidance.{' '}
            <LawyerTag>
              Execute IDTA with Supabase before UK launch and complete a Transfer Risk Assessment. Update
              this clause with the date of execution and confirm TRA findings are documented.
            </LawyerTag>
          </P>
          <P>
            <strong>Data transferred to US processors (Anthropic, Replicate, Stripe, Vercel):</strong> The
            UK has granted partial adequacy for transfers to the United States via the UK-US Data Privacy
            Framework (UK Extension, SI 2023/1028). This adequacy covers only organisations that are
            certified under the UK Extension of the Data Privacy Framework.{' '}
            <LawyerTag>
              Verify DPF certification status of Anthropic, Replicate, Stripe, and Vercel under the UK
              Extension. Where a processor is not certified, execute a UK IDTA with that processor before
              UK launch.
            </LawyerTag>
          </P>
          <P>
            You may request a copy of the transfer safeguards we rely on (including IDTA templates and
            Transfer Risk Assessment summaries) by emailing{' '}
            <a href="mailto:hello@talepop.com" style={{ color: orange }}>hello@talepop.com</a>.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>7c. All Regions — General</p>
          <P>
            All personal data is transmitted between your browser, our servers, and our processors using
            TLS encryption (HTTPS). All data stored in Supabase is encrypted at rest. Illustration outputs
            stored via Replicate are accessed over encrypted connections.
          </P>
        </Section>

        {/* ── Section 8 ── */}
        <Section id="data-retention" title="8. Data Retention">
          <P>
            We retain your data only for as long as necessary to provide the service and meet our legal
            obligations. The following table sets out our retention periods by data type:
          </P>
          <Table>
            <thead>
              <tr>
                <Th>Data type</Th>
                <Th>Retention period</Th>
              </tr>
            </thead>
            <tbody>
              <Tr>
                <Td>Parent account and email address</Td>
                <Td>Duration of account, plus 30 days after account deletion</Td>
              </Tr>
              <Tr shade>
                <Td>Child profile data</Td>
                <Td>Duration of account; 7 days after individual profile deletion; or 30 days after account deletion, whichever is sooner</Td>
              </Tr>
              <Tr>
                <Td>Generated stories and illustrations</Td>
                <Td>Duration of account, plus 30 days after account deletion</Td>
              </Tr>
              <Tr shade>
                <Td>Payment records</Td>
                <Td>7 years from the date of transaction (required under Australian taxation law)</Td>
              </Tr>
              <Tr>
                <Td>Parental consent records (COPPA)</Td>
                <Td>Duration of account, plus 7 years after account closure</Td>
              </Tr>
              <Tr shade>
                <Td>Story feedback and ratings</Td>
                <Td>2 years from submission, or until account deletion, whichever is earlier</Td>
              </Tr>
              <Tr>
                <Td>Security and access logs</Td>
                <Td>90 days</Td>
              </Tr>
            </tbody>
          </Table>
          <P>
            When retention periods expire, data is securely deleted or de-identified using industry-standard
            methods. De-identified data (from which all personal identifiers have been permanently removed)
            may be retained for longer periods for aggregate analytics and service improvement purposes.
          </P>
        </Section>

        {/* ── Section 9 ── */}
        <Section id="data-breach" title="9. Data Breach Notification">
          <P>
            TalePop has implemented technical and organisational measures to protect personal information
            against unauthorised access, disclosure, alteration, and destruction. In the event that we
            experience an eligible data breach that is likely to result in serious harm to any individual,
            we will take the following steps:
          </P>
          <P>
            <strong>Australia:</strong> In accordance with the Notifiable Data Breaches scheme under Part IIIC
            of the Privacy Act 1988 (Cth), we will notify the Office of the Australian Information Commissioner
            (OAIC) and all affected account holders as soon as practicable, and no later than 30 days after
            becoming aware that an eligible data breach has occurred or is likely to have occurred. Our
            notification will include a description of the nature of the breach, the type of personal
            information involved, and the steps we are taking or have taken in response.
          </P>
          <P>
            <strong>United Kingdom:</strong> In accordance with UK GDPR Article 33, we will notify the
            Information Commissioner's Office (ICO) within 72 hours of becoming aware of a personal data
            breach where that breach is likely to result in a risk to the rights and freedoms of individuals.
            Where the breach is likely to result in a high risk to individuals' rights and freedoms, we will
            also notify affected UK users without undue delay under UK GDPR Article 34.
          </P>
          <P>
            <strong>United States:</strong> We will comply with all applicable US state data breach
            notification laws, including notifying affected California residents in accordance with the
            California Consumer Privacy Act and the California Civil Code §1798.82.
          </P>
        </Section>

        {/* ── Section 10 ── */}
        <Section id="your-rights" title="10. Your Privacy Rights">
          <P>
            Depending on your jurisdiction, you have the following rights in relation to your personal
            information and the child profile data you have provided. To exercise any of these rights,
            contact us at <a href="mailto:hello@talepop.com" style={{ color: orange }}>hello@talepop.com</a>.
            We will respond within 30 days (Australia / UK) or 45 days (CCPA / California).
          </P>
          <Table>
            <thead>
              <tr>
                <Th>Right</Th>
                <Th>Jurisdiction</Th>
              </tr>
            </thead>
            <tbody>
              <Tr>
                <Td><strong>Access your personal data</strong> — request a copy of the personal information we hold about you and your child profiles</Td>
                <Td>AU: APP 12 | UK: Art 15 UK GDPR | US-CA: CCPA Right to Know</Td>
              </Tr>
              <Tr shade>
                <Td><strong>Correct inaccurate data</strong> — request correction of personal information that is inaccurate, incomplete, or out of date</Td>
                <Td>AU: APP 13 | UK: Art 16 UK GDPR | US-CA: CCPA Right to Correct</Td>
              </Tr>
              <Tr>
                <Td><strong>Delete your account and associated data</strong> — including all child profiles, generated stories, and account information (subject to retention obligations for payment records)</Td>
                <Td>AU: APP 11 | UK: Art 17 UK GDPR | US-CA: CCPA Right to Delete | COPPA: parental right to deletion</Td>
              </Tr>
              <Tr shade>
                <Td><strong>Export your stories (data portability)</strong> — receive a copy of generated stories in a portable format</Td>
                <Td>UK: Art 20 UK GDPR</Td>
              </Tr>
              <Tr>
                <Td><strong>Restrict or object to processing</strong> — request restriction of processing in defined circumstances, or object to processing based on legitimate interests</Td>
                <Td>UK: Arts 18 and 21 UK GDPR</Td>
              </Tr>
              <Tr shade>
                <Td><strong>Withdraw consent</strong> — withdraw consent at any time where consent is the lawful basis (e.g., marketing emails, appearance data processing); withdrawal does not affect the lawfulness of prior processing</Td>
                <Td>AU / UK / US</Td>
              </Tr>
              <Tr>
                <Td><strong>Limit use of sensitive personal information</strong> — including appearance data that may constitute sensitive information</Td>
                <Td>US-CA: CCPA</Td>
              </Tr>
              <Tr shade>
                <Td><strong>Non-discrimination</strong> — you will not be penalised, offered a reduced level of service, or charged a different price for exercising your privacy rights</Td>
                <Td>US-CA: CCPA</Td>
              </Tr>
            </tbody>
          </Table>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>California Residents</p>
          <P>
            We do not sell your personal information or your child's personal information. We do not share
            personal information for cross-context behavioural advertising. You have the right to opt out of
            any future sale or sharing of personal information. To submit a CCPA request — including requests
            to know, correct, delete, or limit — please email{' '}
            <a href="mailto:hello@talepop.com" style={{ color: orange }}>hello@talepop.com</a> with the
            subject line "CCPA Privacy Request."
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>Complaints</p>
          <P>
            If you are not satisfied with our response to a privacy request or concern, you have the right
            to make a complaint to the relevant supervisory authority:
          </P>
          <Ul>
            <Li>
              <strong>Australia:</strong> Office of the Australian Information Commissioner (OAIC) —{' '}
              <a href="https://www.oaic.gov.au" style={{ color: orange }}>oaic.gov.au</a>
            </Li>
            <Li>
              <strong>United Kingdom:</strong> Information Commissioner's Office (ICO) —{' '}
              <a href="https://ico.org.uk" style={{ color: orange }}>ico.org.uk</a>
            </Li>
            <Li>
              <strong>United States:</strong> Federal Trade Commission (FTC) —{' '}
              <a href="https://www.ftc.gov" style={{ color: orange }}>ftc.gov</a>, or your relevant state
              Attorney General's office
            </Li>
          </Ul>
          <P>
            We encourage you to contact us first so we have the opportunity to address your concern before
            you escalate to a supervisory authority.
          </P>
        </Section>

        {/* ── Section 11 ── */}
        <Section id="cookies" title="11. Cookies and Tracking">
          <P>
            TalePop uses the following types of cookies and similar technologies:
          </P>
          <Ul>
            <Li>
              <strong>Essential cookies:</strong> Required for authentication (session management via
              Supabase) and core site functionality. These cannot be disabled without preventing you from
              logging in.
            </Li>
            <Li>
              <strong>Preference cookies:</strong> Remember your settings such as selected child profile
              and reading preferences.
            </Li>
            <Li>
              <strong>Analytics:</strong> We use aggregated, anonymised analytics to understand how the
              service is used. No personally identifiable information is linked to analytics data.
            </Li>
          </Ul>
          <P>
            We do not use advertising cookies, tracking pixels, or cross-site behavioural tracking. You may
            clear cookies through your browser settings. Disabling essential cookies will prevent you from
            accessing your account.
          </P>
        </Section>

        {/* ── Section 12 ── */}
        <Section id="changes" title="12. Changes to This Policy">
          <P>
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology,
            legal requirements, or other factors. When we make material changes, we will update the "Last
            updated" date at the top of this page and, where the changes are significant, notify you by email
            to your registered account address.
          </P>
          <P>
            Your continued use of TalePop after a policy update constitutes acceptance of the updated policy.
            If you do not agree with a material change, you may close your account at any time through the
            account settings page.
          </P>
        </Section>

        {/* ── Section 13 ── */}
        <Section id="contact" title="13. Contact Us">
          <P>
            If you have any questions, concerns, or requests relating to this Privacy Policy or our handling
            of your personal information, please contact us:
          </P>
          <Ul>
            <Li>
              <strong>General enquiries:</strong>{' '}
              <a href="mailto:hello@talepop.com" style={{ color: orange }}>hello@talepop.com</a>
            </Li>
            <Li>
              <strong>Privacy and data requests (access, correction, deletion, CCPA, portability):</strong>{' '}
              <a href="mailto:hello@talepop.com" style={{ color: orange }}>hello@talepop.com</a>{' '}
              — we respond within 30 days (Australia / UK) or 45 days (CCPA)
            </Li>
            <Li>
              <strong>UK Article 27 Representative:</strong>{' '}
              <LawyerTag>
                Insert the name and contact details of the appointed UK Article 27 representative once appointed
              </LawyerTag>
            </Li>
            <Li>
              <strong>Postal address:</strong>{' '}
              <LawyerTag>Insert registered business address</LawyerTag>
            </Li>
          </Ul>
        </Section>

      </main>

      <Footer />
    </div>
  );
}
