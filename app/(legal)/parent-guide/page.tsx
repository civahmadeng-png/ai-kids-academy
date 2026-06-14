import type { Metadata } from 'next';
import LegalPage, { LegalList, LegalCallout } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Parent Guide',
  description: 'Everything parents need to know to get the most from AI Kids Academy safely.',
};

export default function ParentGuidePage() {
  return (
    <LegalPage
      badge="👨‍👩‍👧"
      title="Parent Guide"
      subtitle="Welcome! This guide explains how the platform works, what your child will learn, and the safety measures we've built to protect them."
      updated="June 2025"
      color="#22D3A6"
      sections={[
        {
          heading: 'What Is AI Kids Academy?',
          body: (
            <>
              <p>AI Kids Academy is a safe, ad-free learning platform for children aged 9–15. It uses artificial intelligence to personalise learning experiences across six core skill areas:</p>
              <LegalList items={[
                '🧠 AI & Technology Literacy — understanding how AI works',
                '🧪 Science — hands-on experiments and the science behind them',
                '⚙️ Engineering & STEM — building challenges and design thinking',
                '🎨 Creativity — AI-assisted storytelling and creative writing',
                '🌍 Exploration & Career Discovery — real-world learning missions',
                '💰 Financial Literacy — savings goals and money habits',
              ]}/>
            </>
          ),
        },
        {
          heading: 'How to Set Up Your Account',
          body: (
            <LegalList items={[
              'Step 1: Create your parent account with your email and a secure password',
              'Step 2: Verify your email address by clicking the link we send you',
              'Step 3: Create one or more child profiles — you choose their name, avatar, and age',
              'Step 4: Your child selects their profile and enters the learning world',
              'Step 5: Check the Parent Dashboard anytime to see progress, achievements, and reports',
            ]}/>
          ),
        },
        {
          heading: 'You Are Always in Control',
          body: (
            <>
              <LegalCallout color="#22D3A6">
                <strong>Parental controls built in:</strong>
                <LegalList items={[
                  'Only you (the parent) can create, edit, or delete child profiles',
                  'Only you can change the subscription plan',
                  'Only you can request data deletion',
                  'Children cannot make purchases or change account settings',
                  'Children cannot communicate with other users — there are no social features',
                  'You can pause or delete any child profile at any time',
                ]}/>
              </LegalCallout>
            </>
          ),
        },
        {
          heading: 'Understanding the AI Mentor',
          body: (
            <>
              <p>Sparky, the AI Mentor, answers your child&apos;s questions about science, technology, AI, and the world. Here&apos;s how we keep it safe:</p>
              <LegalList items={[
                'Every message is checked for harmful content before being sent to the AI',
                'The AI is given a locked system prompt it cannot override — it must behave like a friendly teacher',
                'Responses are filtered for age-appropriate content before being shown to your child',
                'Free accounts have 5 AI chats per day; Premium has unlimited (with fair-use limits)',
                'You can view AI conversation logs from the Parent Dashboard',
              ]}/>
              <LegalCallout color="#FFB800">
                <strong>Tip:</strong> Encourage your child to ask Sparky about topics they studied at school. It reinforces learning and gives them a safe space to ask questions they might feel shy about in class.
              </LegalCallout>
            </>
          ),
        },
        {
          heading: 'Age-Appropriate Content',
          body: (
            <>
              <p>All content is designed for ages 9–15. We adjust complexity based on the age your child enters when their profile is created.</p>
              <LegalList items={[
                'Ages 9-10: Shorter lessons, simpler language, more visual explanations',
                'Ages 11-12: Standard content with analogies and real-world connections',
                'Ages 13-15: More depth, secondary-school vocabulary, and critical thinking challenges',
              ]}/>
              <p style={{marginTop:10}}>You can update your child&apos;s age at any time in their profile settings.</p>
            </>
          ),
        },
        {
          heading: 'Screen Time Recommendations',
          body: (
            <>
              <p>We recommend the following daily usage to maximise learning without fatigue:</p>
              <LegalList items={[
                '15-20 minutes on weekdays for structured learning (one lesson or experiment)',
                '30-45 minutes at weekends for exploration and creative projects',
                'Use the streak system to build a consistent daily habit — even 10 minutes counts',
              ]}/>
              <LegalCallout color="#4F8EF7">
                Research shows children who spend 15-20 minutes daily on focused educational activities outperform those doing 2-hour weekend sessions. Consistency beats intensity.
              </LegalCallout>
            </>
          ),
        },
        {
          heading: 'How to Make the Most of the Platform',
          body: (
            <LegalList items={[
              'Check the Parent Dashboard weekly to see what your child has been exploring',
              'Ask your child to show you what they learned — it doubles their retention',
              'Try a Family Mission together — missions are designed for parent-child co-play',
              'Use the Recommended Next Activities section to guide your child\'s next session',
              'Print the Monthly Report to share with teachers or grandparents',
            ]}/>
          ),
        },
        {
          heading: 'Getting Help',
          body: (
            <>
              <p>If you have questions, problems, or feedback:</p>
              <LegalList items={[
                'Email: support@aikidsacademy.app',
                'Response time: within 1 business day',
                'For safety concerns: safety@aikidsacademy.app (monitored daily)',
              ]}/>
            </>
          ),
        },
      ]}
    />
  );
}
