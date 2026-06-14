import type { Metadata } from 'next';
import LegalPage, { LegalList, LegalCallout, LegalEmail } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Child Safety Policy',
  description: 'How AI Kids Academy protects children online.',
};

export default function ChildSafetyPage() {
  return (
    <LegalPage
      badge="🛡️"
      title="Child Safety Policy"
      subtitle="Protecting children is our highest priority. This policy explains the technical and human safeguards we have in place."
      updated="June 2025"
      color="#FF6B6B"
      sections={[
        {
          heading: 'Our Core Safety Commitments',
          body: (
            <LegalCallout color="#FF6B6B">
              <LegalList items={[
                '🚫 No advertising of any kind — ever',
                '🚫 No data sold or shared with third-party advertisers',
                '🚫 No social features — children cannot contact each other',
                '🚫 No external links accessible to children',
                '🚫 No collection of photos, location data, or real names from children',
                '✅ All AI responses safety-filtered for age-appropriate content',
                '✅ All child profiles controlled exclusively by parents',
                '✅ Platform compliant with COPPA, UK Children\'s Code, and GDPR',
              ]}/>
            </LegalCallout>
          ),
        },
        {
          heading: 'Age Verification and Parental Consent',
          body: (
            <>
              <p>We require a verified parent or guardian email to create an account. Children under 13 (US) or under 16 (EU/UK) cannot create their own accounts. All child profiles are created by the parent.</p>
              <p style={{marginTop:10}}>When you create a child profile, you are confirming that you are the parent or guardian of that child and that you consent to their use of this platform.</p>
            </>
          ),
        },
        {
          heading: 'AI Content Safety',
          body: (
            <>
              <p>Every AI interaction goes through a multi-layer safety process:</p>
              <LegalList items={[
                'Layer 1 — Input filter: Messages are scanned for harmful content before being sent to the AI',
                'Layer 2 — System prompt lock: The AI is given a locked, child-safe instruction set it cannot bypass',
                'Layer 3 — Output filter: AI responses are checked for harmful, inappropriate, or distressing content',
                'Layer 4 — Fallback responses: If the AI is unavailable or produces an error, safe pre-written responses are shown',
                'Layer 5 — Escalation: If a message suggests distress or danger, the AI is instructed to suggest speaking to a trusted adult',
              ]}/>
            </>
          ),
        },
        {
          heading: 'Prohibited Content Categories',
          body: (
            <>
              <p>Our systems block all of the following categories in both user inputs and AI outputs:</p>
              <LegalList items={[
                'Violence, self-harm, or suicide-related content',
                'Sexual or romantic content of any kind',
                'Instructions for dangerous activities (weapons, chemicals, controlled substances)',
                'Content that could be used for grooming, manipulation, or exploitation',
                'Attempts to obtain personal information from the child',
                'Extremist ideology or hate speech',
              ]}/>
            </>
          ),
        },
        {
          heading: 'Data Protection for Children',
          body: (
            <LegalList items={[
              'Children\'s data is stored on secure, encrypted servers',
              'Child profiles use internal IDs — real names are only stored if entered by the parent',
              'AI conversations are stored server-side and are never publicly visible',
              'Parents can view and delete all data at any time from the Parent Dashboard',
              'Data is never shared with schools, governments, or third parties without explicit parent consent',
              'Deleted child profiles are permanently removed from all systems within 30 days',
            ]}/>
          ),
        },
        {
          heading: 'No External Communication',
          body: (
            <>
              <p>AI Kids Academy has no social features. Children cannot:</p>
              <LegalList items={[
                'Message or contact other children on the platform',
                'See other users\' profiles or achievements',
                'Share content outside the app',
                'Access external websites or links from within the platform',
                'Receive unsolicited messages from anyone',
              ]}/>
            </>
          ),
        },
        {
          heading: 'Reporting a Safety Concern',
          body: (
            <>
              <LegalCallout color="#FF6B6B">
                <strong>If you notice something that concerns you about your child&apos;s experience on our platform, please contact us immediately.</strong>
              </LegalCallout>
              <p style={{marginTop:10}}>Safety email: <LegalEmail email="safety@aikidsacademy.app" /></p>
              <p style={{marginTop:6}}>We take all safety reports seriously and respond within 24 hours. For immediate concerns about a child&apos;s wellbeing, please also contact your local emergency services or child protection authority.</p>
            </>
          ),
        },
        {
          heading: 'Legal Compliance',
          body: (
            <LegalList items={[
              'COPPA (Children\'s Online Privacy Protection Act) — US federal law protecting children under 13',
              'UK Children\'s Code (Age Appropriate Design Code) — UK regulations for online services used by children',
              'GDPR Article 8 — EU regulations on children\'s consent for data processing',
              'We do not serve personalised advertising — no consent for advertising is ever sought from children',
            ]}/>
          ),
        },
      ]}
    />
  );
}
