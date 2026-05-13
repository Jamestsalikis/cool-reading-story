import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — TalePop',
  description: "How TalePop collects, uses and protects your personal information and your child's data.",
};

const updated = '13 May 2026';

const navy   = '#0D183D';
const orange = '#FF6B35';
const cream  = '#FFF4E6';
const border = '#F0E4D0';
const muted  = '#5E6A7A';
const body   = '#4A3728';

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: '48px' }}>
      <h2 style={{
        fontFamily: "'Fredoka', 'Arial Rounded MT Bold', cursive",
        fontSize: '1.35rem', fontWeight: 600, color: navy,
        borderBottom: `2px solid ${border}`, paddingBottom: '10px', marginBottom: '20px',
      }}>
        {title}
      </h2>
      <div style={{ color: body, lineHeight: '1.75', fontSize: '0.9375rem' }}>{children}</div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ backgroundColor: navy, color: 'white', textAlign: 'center', padding: '32px 24px', fontSize: '0.875rem', marginTop: '64px' }}>
      <p style={{ margin: '0 0 8px' }}>
        <Link href="/privacy" style={{ color: cream, textDecoration: 'none', marginRight: '16px' }}>Privacy Policy</Link>
        <Link href="/terms" style={{ color: cream, textDecoration: 'none', marginRight: '16px' }}>Terms of Service</Link>
        <a href="mailto:info@talepopstories.com" style={{ color: cream, textDecoration: 'none' }}>info@talepopstories.com</a>
      </p>
      <p style={{ margin: 0, color: muted }}>© {new Date().getFullYear()} TalePop. All rights reserved.</p>
    </footer>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: '0 0 14px' }}>{children}</p>;
}
function Ul({ children }: { children: React.ReactNode }) {
  return <ul style={{ margin: '0 0 14px', paddingLeft: '20px', listStyleType: 'disc' }}>{children}</ul>;
}
function Li({ children }: { children: React.ReactNode }) {
  return <li style={{ marginBottom: '6px' }}>{children}</li>;
}
function Table({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>{children}</table>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ backgroundColor: navy, color: 'white', padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: '10px 12px', borderBottom: `1px solid ${border}`, verticalAlign: 'top' }}>{children}</td>;
}
function Tr({ children, shade }: { children: React.ReactNode; shade?: boolean }) {
  return <tr style={{ backgroundColor: shade ? cream : 'white' }}>{children}</tr>;
}

export default function PrivacyPolicyPage() {
  return (
    <div style={{ backgroundColor: cream, minHeight: '100vh', fontFamily: "'Nunito', system-ui, sans-serif" }}>

      <nav style={{ backgroundColor: navy, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: "'Fredoka', 'Arial Rounded MT Bold', cursive", fontSize: '1.5rem', color: orange, textDecoration: 'none', fontWeight: 600 }}>
          TalePop
        </Link>
        <Link href="/" style={{ color: cream, textDecoration: 'none', fontSize: '0.875rem' }}>← Back to home</Link>
      </nav>

      <main style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 24px' }}>

        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontFamily: "'Fredoka', 'Arial Rounded MT Bold', cursive", fontSize: '2.25rem', color: navy, marginBottom: '8px' }}>
            Privacy Policy
          </h1>
          <p style={{ color: muted, fontSize: '0.875rem', margin: '0 0 4px' }}>Last updated: {updated}</p>
          <p style={{ color: body, fontSize: '0.9375rem', marginTop: '16px', lineHeight: '1.7' }}>
            At TalePop, your family&apos;s privacy is not a footnote. It is central to how we build everything.
            This Privacy Policy explains what personal information we collect, why we collect it, how we use it,
            and the rights you have in relation to it. It applies to parents and guardians who create accounts,
            and to the child profiles created within those accounts.
          </p>
          <p style={{ color: body, fontSize: '0.9375rem', marginTop: '12px', lineHeight: '1.7' }}>
            TalePop is available to users in Australia, Canada, and the United States. Different legal
            frameworks apply in each jurisdiction and we address each below.
          </p>
        </div>

        <Section id="who-we-are" title="1. Who We Are">
          <P>
            TalePop is an online service operated from Australia. TalePop is the data controller (and where
            applicable, the organization responsible for personal information) for parent account information
            and child profile data stored on our platform.
          </P>
          <p style={{ margin: '0 0 6px', fontWeight: 600, color: navy }}>Contact</p>
          <P>
            For all privacy enquiries:{' '}
            <a href="mailto:info@talepopstories.com" style={{ color: orange }}>info@talepopstories.com</a>
          </P>
        </Section>

        <Section id="information-we-collect" title="2. Information We Collect">
          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>2.1 Parent / Guardian Account Information</p>
          <Ul>
            <Li>Email address (used for login, account communications, and as the verified parental contact for COPPA purposes)</Li>
            <Li>Password (hashed; never stored in plaintext)</Li>
            <Li>Payment information (processed by our payment service provider; we do not store card numbers)</Li>
            <Li>Subscription tier and billing history</Li>
          </Ul>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>2.2 Child Profile Data</p>
          <P>Parents create child profiles to personalise stories. This may include:</P>
          <Ul>
            <Li>Child&apos;s first name or nickname</Li>
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
            reflect the child&apos;s appearance.
          </P>
          <P>
            Some appearance descriptors may constitute sensitive information under the Australian Privacy Act 1988
            (Cth) and sensitive personal information under applicable Canadian and US privacy laws. The provision
            of appearance data is entirely optional. Where such data is provided, TalePop relies on explicit
            consent obtained at account creation and child profile setup. You may omit appearance data entirely
            without affecting the core functionality of TalePop.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>2.4 Generated Content</p>
          <Ul>
            <Li>Stories generated for each child profile</Li>
            <Li>Illustrations generated for each story</Li>
            <Li>Story ratings and feedback (optional)</Li>
          </Ul>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>2.5 Technical Data</p>
          <Ul>
            <Li>IP address and approximate location (via our hosting infrastructure)</Li>
            <Li>Browser type and device information</Li>
            <Li>Pages visited and time spent (aggregated analytics only)</Li>
            <Li>Error logs for debugging purposes</Li>
          </Ul>
        </Section>

        <Section id="legal-basis" title="3. Legal Framework for Collection and Use">
          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>3.1 Australia — Privacy Act 1988 (Cth), Australian Privacy Principles</p>
          <P>
            TalePop collects and handles personal information in accordance with the Australian Privacy Principles
            (APPs) under the Privacy Act 1988 (Cth). We collect only the personal information necessary for the
            purposes described in this policy (APP 3), we use it only for those purposes or directly related
            secondary purposes (APP 6), and we take reasonable steps to protect it (APP 11). We notify
            individuals of the purposes of collection at or before the time of collection (APP 5).
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>3.2 Canada — PIPEDA and Provincial Laws</p>
          <P>
            TalePop collects, uses, and discloses personal information in accordance with the Personal
            Information Protection and Electronic Documents Act (PIPEDA, S.C. 2000, c. 5) and, where applicable,
            substantially similar provincial legislation including the Personal Information Protection Act (PIPA)
            in Alberta and British Columbia, and Law 25 (An Act to Modernize Legislative Provisions as Regards
            the Protection of Personal Information, S.Q. 2021, c. 25) in Quebec.
          </P>
          <P>
            Under PIPEDA, TalePop adheres to the ten fair information principles: accountability, identifying
            purposes, consent, limiting collection, limiting use/disclosure/retention, accuracy, safeguards,
            openness, individual access, and challenging compliance. Under Quebec Law 25, we conduct Privacy
            Impact Assessments (PIAs) for new projects involving personal information, apply data minimisation,
            and provide enhanced rights to Quebec residents including data portability and the right to
            de-indexation.
          </P>
          <P>
            TalePop&apos;s Chief Privacy Officer is responsible for the organisation&apos;s compliance with these
            obligations and can be contacted at{' '}
            <a href="mailto:info@talepopstories.com" style={{ color: orange }}>info@talepopstories.com</a>.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>3.3 United States — COPPA and State Privacy Laws</p>
          <P>
            For US users, TalePop complies with the Children&apos;s Online Privacy Protection Act (COPPA, 15
            U.S.C. §§ 6501-6506; 16 C.F.R. Part 312) and, where applicable, the California Consumer Privacy
            Act as amended by the California Privacy Rights Act (CCPA/CPRA, Cal. Civ. Code § 1798.100 et seq.).
            We also comply with applicable state-level privacy and breach notification laws including those of
            Virginia (VCDPA), Colorado (CPA), Connecticut (CTDPA), Texas (TDPSA), and other states with
            comprehensive privacy legislation.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>3.4 Purposes and Legal Grounds</p>
          <Table>
            <thead>
              <tr>
                <Th>Processing activity</Th>
                <Th>AU legal ground</Th>
                <Th>CA legal ground</Th>
                <Th>US legal ground</Th>
              </tr>
            </thead>
            <tbody>
              <Tr>
                <Td>Creating and managing your account</Td>
                <Td>APP 3 — necessary for service provision</Td>
                <Td>PIPEDA — consent; necessary to provide service</Td>
                <Td>Contract performance; legitimate interest</Td>
              </Tr>
              <Tr shade>
                <Td>Generating personalised stories and illustrations</Td>
                <Td>APP 3 — primary purpose</Td>
                <Td>PIPEDA — identified purpose; consent</Td>
                <Td>Contract; COPPA verifiable parental consent</Td>
              </Tr>
              <Tr>
                <Td>Processing payments</Td>
                <Td>APP 3 — necessary for service provision</Td>
                <Td>PIPEDA — necessary for commercial transaction</Td>
                <Td>Contract performance</Td>
              </Tr>
              <Tr shade>
                <Td>Sending transactional emails</Td>
                <Td>APP 6 — directly related to primary purpose</Td>
                <Td>PIPEDA; CASL s.6(6) — transactional/relationship message</Td>
                <Td>Contract; CAN-SPAM Act transactional exception</Td>
              </Tr>
              <Tr>
                <Td>Sending marketing emails</Td>
                <Td>APP 3 — express consent (opt-in)</Td>
                <Td>CASL s.6 — express consent required</Td>
                <Td>Express consent (opt-in at registration)</Td>
              </Tr>
              <Tr shade>
                <Td>Security logs and fraud prevention</Td>
                <Td>APP 3/11 — necessary to protect integrity</Td>
                <Td>PIPEDA — legitimate interest; security safeguard</Td>
                <Td>Legitimate interest</Td>
              </Tr>
              <Tr>
                <Td>Product analytics and improvement</Td>
                <Td>APP 6 — related secondary purpose (de-identified)</Td>
                <Td>PIPEDA — de-identified aggregate data</Td>
                <Td>Legitimate interest (de-identified data only)</Td>
              </Tr>
              <Tr shade>
                <Td>Processing optional appearance data</Td>
                <Td>APP 3/7 — explicit consent for sensitive information</Td>
                <Td>PIPEDA — express consent for sensitive data</Td>
                <Td>CCPA — explicit consent; COPPA parental consent</Td>
              </Tr>
            </tbody>
          </Table>
        </Section>

        <Section id="childrens-privacy" title="4. Children's Privacy">
          <P>
            TalePop is a service for families. Parents and guardians create and manage all accounts. Children
            do not interact directly with TalePop, do not create accounts, and do not enter information. All
            personal information about a child is entered by the parent or guardian.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>4.1 COPPA — Verifiable Parental Consent (United States)</p>
          <P>
            TalePop is subject to the Children&apos;s Online Privacy Protection Act (COPPA). We do not knowingly
            collect personal information from children under 13 for any purpose other than generating
            personalised stories for that child as directed by their parent or legal guardian.
          </P>
          <P>
            TalePop obtains verifiable parental consent through the payment transaction process. A credit or
            debit card payment by the parent constitutes a monetary transaction that generates a notification
            to the primary cardholder, which is an FTC-approved method of verifiable parental consent under
            16 C.F.R. §312.5(b)(2). The act of completing payment and creating child profiles constitutes
            verifiable parental consent for TalePop to collect and use the child profile data described in
            this policy.
          </P>
          <P>
            An alternative consent mechanism is available for users who cannot use the payment-based method.
            To request an alternative consent process, please email{' '}
            <a href="mailto:info@talepopstories.com" style={{ color: orange }}>info@talepopstories.com</a>.
          </P>
          <P>
            Parents may at any time review, request corrections to, or request deletion of their child&apos;s
            profile and all associated data by contacting us at{' '}
            <a href="mailto:info@talepopstories.com" style={{ color: orange }}>info@talepopstories.com</a> or through
            the account settings page.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>4.2 Australia — Children&apos;s Online Privacy</p>
          <P>
            Australia&apos;s Online Safety Act 2021 and the Australian Children&apos;s Online Privacy Code (anticipated to
            come into effect by December 2026 under the Privacy Act 1988) establish obligations for online
            services likely to be accessed by children. TalePop designs all data handling practices around the
            best interests of the child as the primary consideration, consistent with the expected requirements
            of the Australian Children&apos;s Online Privacy Code. We will update this policy as the Code is
            finalised and enacted.
          </P>
          <P>
            Child data collected by TalePop is not used for profiling beyond personalising the individual
            child&apos;s own stories. We do not profile children for commercial purposes and do not create
            behavioural databases of children.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>4.3 Canada — Children&apos;s Consent under PIPEDA and Provincial Law</p>
          <P>
            Under PIPEDA and the guidance of the Office of the Privacy Commissioner of Canada (OPC), the
            consent of children under 13 years of age requires parental or guardian authorisation to be
            meaningful. TalePop does not permit children to create accounts directly. All child profiles are
            created and managed by the parent or guardian, and the parent&apos;s account creation and payment
            transaction constitutes the authorisation for TalePop to collect and process the child&apos;s profile
            information for the purpose of story generation.
          </P>
          <P>
            For Quebec residents, TalePop complies with the enhanced child privacy requirements under
            Quebec Law 25, including data minimisation and the prohibition on using children&apos;s personal
            information for commercial profiling purposes.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>4.4 Profiling — All Jurisdictions</p>
          <P>
            We use child profile data solely to generate that specific child&apos;s personalised stories and
            illustrations. We do not create cross-child profiles, behavioural databases, or commercial
            profiles of children. AI personalisation is strictly limited to story and illustration generation
            for the individual child profile. Child profile data is never used to train AI models or for any
            analytical purpose beyond delivering the requested story.
          </P>
        </Section>

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
            <Li>Comply with our legal obligations in Australia, Canada, and the United States</Li>
            <Li>Improve the quality, reliability, and relevance of story generation (using aggregated, de-identified analytics only)</Li>
          </Ul>
          <P>
            We do not sell your personal information or your child&apos;s personal information to any third party.
            We do not use your information for targeted advertising. We do not share personal information for
            cross-context behavioural advertising.
          </P>
        </Section>

        <Section id="third-parties" title="6. Third-Party Service Providers and Data Processors">
          <P>
            TalePop engages trusted third-party service providers to operate the platform. We do not disclose
            the identity of our technology providers publicly in order to protect our proprietary systems.
            The categories of providers we use, and the purposes for which data is shared, are set out below.
            All service providers are engaged under written agreements that contractually restrict their use
            of personal information to the specified purpose and prohibit secondary use, including use for
            AI model training, profiling, or advertising.
          </P>
          <Table>
            <thead>
              <tr>
                <Th>Category</Th>
                <Th>Location</Th>
                <Th>Purpose</Th>
                <Th>Child data shared</Th>
              </tr>
            </thead>
            <tbody>
              <Tr>
                <Td><strong>Cloud database and authentication provider</strong></Td>
                <Td>Australia</Td>
                <Td>Stores all account data, child profiles, and generated stories; manages user authentication</Td>
                <Td>Parent account, child profiles (name, age, gender, interests, appearance descriptors, generated stories)</Td>
              </Tr>
              <Tr shade>
                <Td><strong>AI text generation provider</strong></Td>
                <Td>United States</Td>
                <Td>Generates personalised story narrative based on the child&apos;s profile</Td>
                <Td>Child&apos;s name, age, gender, interests, reading level, and optionally appearance descriptors, sibling names, friend names, pet name, city, and country, as entered by the parent</Td>
              </Tr>
              <Tr>
                <Td><strong>AI image generation provider</strong></Td>
                <Td>United States</Td>
                <Td>Generates illustrations for each story page</Td>
                <Td>Image description prompts derived from the child profile and story content, including appearance descriptors and scene descriptions</Td>
              </Tr>
              <Tr shade>
                <Td><strong>Payment processing provider</strong></Td>
                <Td>United States</Td>
                <Td>Processes subscription and one-time payments</Td>
                <Td>Parent email address and payment details only. No child profile data is shared with our payment provider.</Td>
              </Tr>
              <Tr>
                <Td><strong>Cloud hosting and infrastructure provider</strong></Td>
                <Td>United States</Td>
                <Td>Hosts the TalePop web application and serves content to users</Td>
                <Td>Web traffic logs (IP address, request metadata) only. No structured child profile data.</Td>
              </Tr>
            </tbody>
          </Table>
          <P>
            Child profile data transmitted to our AI service providers is used solely to generate the
            requested story and illustrations for that child. We have confirmed that our AI service providers
            do not use personal data submitted through their APIs to train AI models without explicit opt-in
            consent, and no such opt-in is enabled for TalePop. Our data processing agreements with all
            third-party providers contractually prohibit secondary use of child profile data, including model
            training, profiling, or any other use beyond generating the requested output.
          </P>
        </Section>

        <Section id="international-transfers" title="7. International Data Transfers">
          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>7a. Australia — Transfers to the United States</p>
          <P>
            Under Australian Privacy Principle 8 (APP 8) of the Privacy Act 1988 (Cth), before disclosing
            personal information to overseas recipients, TalePop takes reasonable steps to ensure those
            recipients handle the information consistently with the Australian Privacy Principles. The United
            States does not have a law substantially similar to Australia&apos;s Privacy Act.
          </P>
          <P>
            TalePop relies on contractual protections, specifically data processing agreements with each
            US-based service provider, as the mechanism to ensure equivalent protection consistent with APP 8.
          </P>
          <P>
            By using TalePop and creating child profiles, you acknowledge that personal information may be
            disclosed to US-based providers that are not required to comply with the Australian Privacy
            Principles, and that you may have limited recourse under Australian law if such a provider
            mishandles your information. This acknowledgement is recorded as part of your account creation.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>7b. Canada — Transfers to the United States and Australia</p>
          <P>
            Under PIPEDA, organisations may transfer personal information to service providers in other
            countries for processing, provided those providers offer a comparable level of protection.
            TalePop transfers Canadian users&apos; personal information to service providers located in Australia
            and the United States.
          </P>
          <P>
            TalePop takes contractual measures, including data processing agreements with all service
            providers, to ensure that personal information transferred outside Canada is protected to a
            standard comparable to that required by PIPEDA. These agreements restrict service providers&apos;
            use of personal information to the specified purposes and require appropriate security safeguards.
          </P>
          <P>
            Canadian users are advised that personal information transferred to service providers in the
            United States and Australia may be subject to access by authorities in those countries under
            their applicable laws. By creating an account and child profiles, you acknowledge this transfer
            and consent to it for the purposes of receiving the TalePop service.
          </P>
          <P>
            For Quebec residents, this cross-border transfer has been assessed under Quebec Law 25. A
            Privacy Impact Assessment in respect of cross-border data flows is available on request by
            emailing <a href="mailto:info@talepopstories.com" style={{ color: orange }}>info@talepopstories.com</a>.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>7c. All Regions — Security of Transfers</p>
          <P>
            All personal data is transmitted between your browser, our servers, and our service providers
            using TLS encryption (HTTPS). All stored data is encrypted at rest. Generated illustrations are
            stored and served over encrypted connections.
          </P>
        </Section>

        <Section id="data-retention" title="8. Data Retention">
          <P>We retain your data only for as long as necessary to provide the service and meet our legal obligations.</P>
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
                <Td>7 years from the date of transaction (required under Australian taxation law and comparable Canadian record-keeping obligations)</Td>
              </Tr>
              <Tr>
                <Td>Parental consent records (COPPA)</Td>
                <Td>Duration of account, plus 7 years after account closure</Td>
              </Tr>
              <Tr shade>
                <Td>Breach of security safeguards records (PIPEDA Canada)</Td>
                <Td>24 months from the date of the breach (as required by the Breach of Security Safeguards Regulations, SOR/2018-64)</Td>
              </Tr>
              <Tr>
                <Td>Story feedback and ratings</Td>
                <Td>2 years from submission, or until account deletion, whichever is earlier</Td>
              </Tr>
              <Tr shade>
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

        <Section id="data-breach" title="9. Data Breach Notification">
          <P>
            TalePop has implemented technical and organisational measures to protect personal information
            against unauthorised access, disclosure, alteration, and destruction. In the event of a data
            breach that may result in risk of harm, we will take the following steps:
          </P>
          <P>
            <strong>Australia:</strong> In accordance with the Notifiable Data Breaches (NDB) scheme under
            Part IIIC of the Privacy Act 1988 (Cth), we will notify the Office of the Australian Information
            Commissioner (OAIC) and all affected account holders as soon as practicable, and no later than
            30 days after becoming aware that an eligible data breach has occurred or is likely to have
            occurred. Our notification will include a description of the breach, the type of personal
            information involved, and the steps we are taking in response.
          </P>
          <P>
            <strong>Canada:</strong> In accordance with the Breach of Security Safeguards Regulations under
            PIPEDA (SOR/2018-64), if a breach of security safeguards involving personal information creates
            a real risk of significant harm to an individual, we will report the breach to the Privacy
            Commissioner of Canada and notify all affected individuals as soon as feasible. We maintain
            records of all security breaches for a minimum of 24 months from the date of the breach,
            regardless of whether they create a real risk of significant harm. Factors we assess in
            determining real risk of significant harm include the sensitivity of the information, the
            probability of misuse, and the number of individuals affected.
          </P>
          <P>
            <strong>United States:</strong> We comply with all applicable US federal and state data breach
            notification laws. For California residents, we provide notice in accordance with the California
            Consumer Privacy Act (Cal. Civ. Code § 1798.150) and the California Civil Code § 1798.82
            (California Data Breach Notification Act). For residents of other states, we comply with
            applicable state breach notification statutes. Where federal law applies (including with respect
            to COPPA), we notify the Federal Trade Commission as required.
          </P>
        </Section>

        <Section id="your-rights" title="10. Your Privacy Rights">
          <P>
            Depending on your jurisdiction, you have the following rights in relation to your personal
            information and the child profile data you have provided. To exercise any right, contact us at{' '}
            <a href="mailto:info@talepopstories.com" style={{ color: orange }}>info@talepopstories.com</a>. We will
            respond within 30 days (Australia / Canada) or 45 days (US / CCPA).
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
                <Td>AU: APP 12 | CA: PIPEDA Principle 9 | US-CA: CCPA Right to Know</Td>
              </Tr>
              <Tr shade>
                <Td><strong>Correct inaccurate data</strong> — request correction of personal information that is inaccurate or incomplete</Td>
                <Td>AU: APP 13 | CA: PIPEDA Principle 9 | US-CA: CCPA Right to Correct</Td>
              </Tr>
              <Tr>
                <Td><strong>Delete your account and all associated data</strong> — including all child profiles, generated stories, and account information (subject to retention obligations for payment records)</Td>
                <Td>AU: APP 11 | CA: PIPEDA; Quebec Law 25 | US-CA: CCPA Right to Delete | COPPA: parental right to deletion</Td>
              </Tr>
              <Tr shade>
                <Td><strong>Data portability</strong> — receive a copy of your generated stories in a portable format</Td>
                <Td>CA: Quebec Law 25 right to portability | US-CA: CCPA</Td>
              </Tr>
              <Tr>
                <Td><strong>De-indexation / withdrawal of consent</strong> — withdraw consent for processing at any time where consent is the legal basis (does not affect lawfulness of prior processing)</Td>
                <Td>AU / CA / US</Td>
              </Tr>
              <Tr shade>
                <Td><strong>Limit use of sensitive personal information</strong> — including appearance data</Td>
                <Td>US-CA: CCPA | CA: PIPEDA; Quebec Law 25</Td>
              </Tr>
              <Tr>
                <Td><strong>Non-discrimination</strong> — you will not be penalised or offered a reduced level of service for exercising your privacy rights</Td>
                <Td>US-CA: CCPA | AU: APP | CA: PIPEDA</Td>
              </Tr>
              <Tr shade>
                <Td><strong>Lodge a complaint</strong> — escalate unresolved concerns to the relevant supervisory authority</Td>
                <Td>AU: OAIC | CA: OPC / provincial commissioners | US: FTC / state AGs</Td>
              </Tr>
            </tbody>
          </Table>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>California Residents</p>
          <P>
            We do not sell your personal information or your child&apos;s personal information. We do not share
            personal information for cross-context behavioural advertising. You have the right to opt out of
            any future sale or sharing. To submit a CCPA request, please email{' '}
            <a href="mailto:info@talepopstories.com" style={{ color: orange }}>info@talepopstories.com</a> with the
            subject line &ldquo;CCPA Privacy Request.&rdquo;
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>Quebec Residents</p>
          <P>
            Quebec residents have additional rights under Law 25, including the right to data portability
            (in a structured, commonly used, and technological format), the right to de-indexation (removal
            of publicly available personal information), and the right to request that personal information
            not be communicated outside Quebec where adequate protection cannot be ensured. To exercise
            these rights, contact{' '}
            <a href="mailto:info@talepopstories.com" style={{ color: orange }}>info@talepopstories.com</a>.
          </P>

          <p style={{ margin: '0 0 10px', fontWeight: 600, color: navy }}>Supervisory Authorities</p>
          <P>
            If you are not satisfied with our response to a privacy request or concern, you may contact
            the relevant authority:
          </P>
          <Ul>
            <Li>
              <strong>Australia:</strong> Office of the Australian Information Commissioner (OAIC) —{' '}
              <a href="https://www.oaic.gov.au" style={{ color: orange }} target="_blank" rel="noopener noreferrer">oaic.gov.au</a>
            </Li>
            <Li>
              <strong>Canada (federal):</strong> Office of the Privacy Commissioner of Canada (OPC) —{' '}
              <a href="https://www.priv.gc.ca" style={{ color: orange }} target="_blank" rel="noopener noreferrer">priv.gc.ca</a>
            </Li>
            <Li>
              <strong>Canada (Quebec):</strong> Commission d&apos;accès à l&apos;information du Québec (CAI) —{' '}
              <a href="https://www.cai.gouv.qc.ca" style={{ color: orange }} target="_blank" rel="noopener noreferrer">cai.gouv.qc.ca</a>
            </Li>
            <Li>
              <strong>United States:</strong> Federal Trade Commission (FTC) —{' '}
              <a href="https://www.ftc.gov" style={{ color: orange }} target="_blank" rel="noopener noreferrer">ftc.gov</a>, or your state Attorney General&apos;s office
            </Li>
          </Ul>
          <P>We encourage you to contact us first so we can address your concern before escalation.</P>
        </Section>

        <Section id="cookies" title="11. Cookies and Tracking">
          <P>TalePop uses the following types of cookies and similar technologies:</P>
          <Ul>
            <Li>
              <strong>Essential cookies:</strong> Required for authentication (session management) and
              core site functionality. These cannot be disabled without preventing you from logging in.
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
          <P>
            <strong>Canadian users (CASL):</strong> Where cookies or similar technologies constitute
            electronic access to a device under Canada&apos;s Anti-Spam Legislation (CASL), TalePop relies
            on implied consent for essential and functional cookies necessary to provide the service
            you have requested. No non-essential tracking technologies are deployed without express consent.
          </P>
        </Section>

        <Section id="changes" title="12. Changes to This Policy">
          <P>
            We may update this Privacy Policy from time to time to reflect changes in our practices,
            technology, legal requirements, or other factors. When we make material changes, we will update
            the &ldquo;Last updated&rdquo; date at the top of this page and, where the changes are significant, notify
            you by email to your registered account address.
          </P>
          <P>
            Your continued use of TalePop after a policy update constitutes acceptance of the updated
            policy. If you do not agree with a material change, you may close your account at any time
            through the account settings page.
          </P>
        </Section>

        <Section id="contact" title="13. Contact Us">
          <P>
            If you have any questions, concerns, or requests relating to this Privacy Policy or our
            handling of your personal information, please contact us:
          </P>
          <Ul>
            <Li>
              <strong>General enquiries:</strong>{' '}
              <a href="mailto:info@talepopstories.com" style={{ color: orange }}>info@talepopstories.com</a>
            </Li>
            <Li>
              <strong>Privacy and data requests (access, correction, deletion, CCPA, portability, de-indexation):</strong>{' '}
              <a href="mailto:info@talepopstories.com" style={{ color: orange }}>info@talepopstories.com</a>{' '}
              — we respond within 30 days (AU / CA) or 45 days (US / CCPA)
            </Li>
            <Li>
              <strong>COPPA parental requests (review, correction, or deletion of child data):</strong>{' '}
              <a href="mailto:info@talepopstories.com" style={{ color: orange }}>info@talepopstories.com</a>
            </Li>
          </Ul>
        </Section>

      </main>
      <Footer />
    </div>
  );
}
