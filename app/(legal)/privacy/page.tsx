import type { Metadata } from 'next';
import LegalPage, { LegalList, LegalCallout, LegalEmail } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How AI Kids Academy collects, uses, and protects your family\'s data.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      badge="🔒"
      title="Privacy Policy"
      subtitle="We take your family's privacy seriously. This policy explains exactly what we collect, why, and how we protect it — in plain English."
      updated="June 2025"
      color="#4F8EF7"
      sections={[
        {
          heading: 'Who We Are',
          body: (
            <>
              <p>AI Kids Academy is an educational platform designed for children aged 9–15, operated by parents on behalf of their children. We are committed to protecting children&apos;s privacy under COPPA (US), the UK Children&apos;s Code, and GDPR (EU/UK).</p>
              <p style={{marginTop:10}}>Data controller contact: <LegalEmail email="privacy@aikidsacademy.app" /></p>
            </>
          ),
        },
        {
          heading: 'What We Collect — and What We Never Collect',
          body: (
            <>
              <LegalCallout color="#22D3A6">
                <strong>✅ We collect (about parents):</strong>
                <LegalList items={[
                  'Parent email address (for login and account recovery)',
                  'Parent full name (for account identification)',
                  'Payment method details (processed by Stripe — we never see card numbers)',
                  'Subscription plan and status',
                ]}/>
              </LegalCallout>
              <LegalCallout color="#4F8EF7">
                <strong>✅ We collect (about children):</strong>
                <LegalList items={[
                  'Child\'s first name or nickname (as entered by the parent)',
                  'Child\'s age (used to tailor content difficulty)',
                  'Learning progress: XP, completed activities, achievements, streaks',
                  'AI conversation logs (stored server-side, never shown publicly)',
                  'Stories and creative work created inside the app',
                ]}/>
              </LegalCallout>
              <LegalCallout color="#FF6B6B">
                <strong>🚫 We NEVER collect from children:</strong>
                <LegalList items={[
                  'Full name, home address, phone number, or email address',
                  'Photos or videos of the child',
                  'Location data of any kind',
                  'Biometric data',
                  'Social media profiles or connections',
                  'Behavioural data for advertising purposes',
                ]}/>
              </LegalCallout>
            </>
          ),
        },
        {
          heading: 'How We Use This Data',
          body: (
            <LegalList items={[
              'To provide personalised learning content tailored to your child\'s age and progress',
              'To track your child\'s achievements and display them in the parent dashboard',
              'To enforce daily usage limits on free plans and remove them on paid plans',
              'To process subscription payments securely via Stripe',
              'To send parents optional progress report emails (only if opted in)',
              'To improve the platform using anonymised, aggregated analytics',
              'We do NOT use any child data for advertising, profiling, or sale to third parties',
            ]}/>
          ),
        },
        {
          heading: 'Children\'s Data — Parental Control',
          body: (
            <>
              <p>A parent or guardian must create the account. Children under 13 in the US, or under 16 in the EU, cannot create accounts independently. All child profiles are created and managed by the parent.</p>
              <LegalCallout color="#4F8EF7">
                <strong>As a parent you can at any time:</strong>
                <LegalList items={[
                  'View all data stored about your child from the Parent Dashboard',
                  'Edit your child\'s name, avatar, and age',
                  'Delete individual child profiles',
                  'Request complete deletion of all data via our Data Deletion page',
                  'Export your child\'s progress data (available in Settings)',
                ]}/>
              </LegalCallout>
            </>
          ),
        },
        {
          heading: 'Data Sharing',
          body: (
            <>
              <p>We do not sell, rent, or share your family&apos;s data with third-party advertisers or data brokers. We share data only with:</p>
              <LegalList items={[
                'Stripe — to process payments (governed by Stripe\'s Privacy Policy)',
                'Supabase — our database infrastructure provider (EU data residency available)',
                'OpenRouter — to route AI requests (prompts only, no personal data included)',
                'Law enforcement, only if required by a valid legal order',
              ]}/>
              <p style={{marginTop:10}}>Child learning data is never shared publicly. It is never accessible to other users.</p>
            </>
          ),
        },
        {
          heading: 'AI Conversations',
          body: (
            <>
              <p>When your child uses the AI Mentor, Science Helper, or Story World, their messages are sent to an AI model. We apply strict safety filters before sending and after receiving every message.</p>
              <LegalList items={[
                'Conversation logs are stored in our database, associated with the child\'s internal ID (not their name)',
                'Conversations are used to provide context within a session only',
                'Conversations are NOT used to train AI models',
                'Conversations are NOT shared with any third parties beyond the AI API provider',
                'Parents can request deletion of all AI conversation logs at any time',
              ]}/>
            </>
          ),
        },
        {
          heading: 'Data Retention',
          body: (
            <LegalList items={[
              'Active accounts: data retained for the lifetime of the account',
              'Cancelled subscriptions: progress data retained for 60 days then auto-deleted',
              'Deleted accounts: all data permanently deleted within 30 days',
              'AI conversation logs: retained for 90 days then auto-deleted',
              'Analytics events: retained for 12 months in anonymised form',
            ]}/>
          ),
        },
        {
          heading: 'Your Rights',
          body: (
            <>
              <p>Depending on your location, you have the right to access, correct, export, or delete your personal data. To exercise any of these rights, please visit our <a href="/delete-data" style={{color:'#4F8EF7',fontWeight:700}}>Data Deletion Request</a> page or email <LegalEmail email="privacy@aikidsacademy.app" />.</p>
              <p style={{marginTop:10}}>We will respond to verified requests within 30 days.</p>
            </>
          ),
        },
        {
          heading: 'Contact Us',
          body: (
            <p>Questions about this policy? Email us at <LegalEmail email="privacy@aikidsacademy.app" />. For data deletion requests, use our <a href="/delete-data" style={{color:'#4F8EF7',fontWeight:700}}>Data Deletion page</a>.</p>
          ),
        },
      ]}
    />
  );
}
