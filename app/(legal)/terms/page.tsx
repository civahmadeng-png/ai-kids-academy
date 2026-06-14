import type { Metadata } from 'next';
import LegalPage, { LegalList, LegalCallout, LegalEmail } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The rules and agreements for using AI Kids Academy.',
};

export default function TermsPage() {
  return (
    <LegalPage
      badge="📋"
      title="Terms of Service"
      subtitle="By creating an account, you agree to these terms. We've written them in plain English so you actually understand what you're agreeing to."
      updated="June 2025"
      color="#8B5CF6"
      sections={[
        {
          heading: 'Who Can Use This Service',
          body: (
            <>
              <p>AI Kids Academy is designed for children aged 9–15 under the supervision of a parent or guardian. You must be at least 18 years old to create a parent account.</p>
              <LegalCallout color="#8B5CF6">
                By creating an account, you confirm: (1) you are the parent or legal guardian of the child you are registering, (2) you have the authority to agree to these terms on behalf of your child, and (3) you will supervise your child&apos;s use of the platform.
              </LegalCallout>
            </>
          ),
        },
        {
          heading: 'Subscription Plans',
          body: (
            <>
              <LegalList items={[
                'Free Plan: Basic access to AI Explorer, Science Lab, Habit Tracker, and limited AI usage (5 Mentor chats/day, 5 stories/month)',
                'Premium Plan: $9.99/month or $7.99/month (billed annually). Unlimited AI Mentor, full Engineering Lab, all modules, advanced parent reports',
                'Family Plan: $14.99/month or $11.99/month (billed annually). Everything in Premium plus up to 5 child profiles and Family Missions',
                'All paid plans include a 7-day free trial. You will not be charged until the trial ends',
                'Prices may change with 30 days\' notice to your registered email address',
              ]}/>
            </>
          ),
        },
        {
          heading: 'Cancellation and Refunds',
          body: (
            <LegalList items={[
              'You can cancel at any time from your account settings or billing portal',
              'Cancellation takes effect at the end of the current billing period — your child keeps full access until then',
              'We offer a 7-day refund for new subscribers who cancel within their first paid month — email us at billing@aikidsacademy.app',
              'No refunds are issued for partial months after the first billing cycle',
              'If we discontinue the service, we will provide a pro-rated refund for the unused portion of any active subscription',
            ]}/>
          ),
        },
        {
          heading: 'Acceptable Use',
          body: (
            <>
              <p>You agree not to:</p>
              <LegalList items={[
                'Attempt to bypass AI safety filters or extract inappropriate content',
                'Share your login credentials with anyone outside your family',
                'Attempt to access other users\' accounts or data',
                'Use the service for any commercial purpose without our permission',
                'Upload or submit any content containing personal information about real children',
                'Attempt to reverse-engineer or scrape the platform',
              ]}/>
            </>
          ),
        },
        {
          heading: 'Content You Create',
          body: (
            <>
              <p>Stories, creations, and content your child produces in the app belong to your family. We claim no ownership over user-generated content.</p>
              <p style={{marginTop:10}}>By using the platform, you grant us a limited licence to store and display your child&apos;s content to them within the app. We will never share it publicly or use it for marketing without explicit written consent.</p>
            </>
          ),
        },
        {
          heading: 'AI Content Disclaimer',
          body: (
            <>
              <p>Our AI Mentor and story tools are powered by large language models. While we apply multiple safety layers, AI can occasionally produce unexpected responses.</p>
              <LegalCallout color="#FFB800">
                <strong>Important:</strong> AI responses are for educational and entertainment purposes only. They do not constitute professional medical, legal, financial, or psychological advice. Please supervise your child&apos;s AI interactions.
              </LegalCallout>
            </>
          ),
        },
        {
          heading: 'Limitation of Liability',
          body: (
            <p>To the fullest extent permitted by law, AI Kids Academy&apos;s liability is limited to the amount you paid in the 12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages, including learning outcomes.</p>
          ),
        },
        {
          heading: 'Changes to These Terms',
          body: (
            <p>We may update these terms. When we do, we will email you at least 30 days in advance and display a notice in the app. Continued use after the effective date constitutes acceptance. If you disagree with changes, you may cancel your account before they take effect.</p>
          ),
        },
        {
          heading: 'Governing Law',
          body: (
            <p>These terms are governed by the laws of England and Wales. Disputes that cannot be resolved informally will be submitted to the courts of England and Wales.</p>
          ),
        },
        {
          heading: 'Contact',
          body: (
            <p>Questions about these terms: <LegalEmail email="legal@aikidsacademy.app" /></p>
          ),
        },
      ]}
    />
  );
}
