import type { Metadata } from 'next';
import LegalPage, { LegalList, LegalCallout, LegalEmail } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'AI Safety Policy',
  description: 'How AI Kids Academy ensures AI interactions are safe, age-appropriate, and educational.',
};

export default function AISafetyPage() {
  return (
    <LegalPage
      badge="🤖"
      title="AI Safety Policy"
      subtitle="We use AI to make learning better, not to replace human judgment. Here is exactly how we keep every AI interaction safe for your child."
      updated="June 2025"
      color="#8B5CF6"
      sections={[
        {
          heading: 'Our AI Safety Philosophy',
          body: (
            <>
              <p>AI is a powerful tool for education, but it requires responsible deployment — especially for children. Our approach is built on four principles:</p>
              <LegalList items={[
                '1. Safety first — no learning benefit outweighs a child\'s safety',
                '2. Transparency — we tell parents exactly what AI is used for and how it\'s controlled',
                '3. Human supervision — our team monitors AI output patterns and updates safety filters regularly',
                '4. Conservative defaults — when in doubt, the AI refuses or redirects, never complies',
              ]}/>
            </>
          ),
        },
        {
          heading: 'How Our AI Safety System Works',
          body: (
            <>
              <p>Every AI interaction passes through five layers before reaching your child:</p>
              <LegalCallout color="#8B5CF6">
                <strong>Layer 1 — Input sanitisation:</strong> User messages are stripped of injection attempts, limited to 800 characters, and scanned for 6 categories of harmful content (violence, sexual content, weapons, drugs, manipulation attempts, system-override attempts). Blocked messages never reach the AI.
              </LegalCallout>
              <LegalCallout color="#4F8EF7">
                <strong>Layer 2 — Locked system prompts:</strong> Every AI feature (Mentor, Story World, DIY Creator, etc.) has a permanent system prompt that defines child-safe behaviour. These prompts cannot be overridden by any user message — they are injected server-side and never exposed to the frontend.
              </LegalCallout>
              <LegalCallout color="#22D3A6">
                <strong>Layer 3 — Model-level safety:</strong> We use AI models with built-in safety training. Our primary model is Claude (by Anthropic), which has extensive alignment and safety research behind it.
              </LegalCallout>
              <LegalCallout color="#FFB800">
                <strong>Layer 4 — Output review:</strong> AI responses are checked for key risk indicators before being displayed.
              </LegalCallout>
              <LegalCallout color="#FF6B6B">
                <strong>Layer 5 — Fallback responses:</strong> If the AI fails, is unavailable, or produces an error, the system falls back to pre-written, manually reviewed educational responses. Children always get a safe, helpful response.
              </LegalCallout>
            </>
          ),
        },
        {
          heading: 'What the AI Cannot Do',
          body: (
            <>
              <p>Our locked system prompts permanently prohibit the AI from:</p>
              <LegalList items={[
                'Producing violent, sexual, or adult content of any kind',
                'Providing instructions for dangerous activities',
                'Asking for or storing personal information from the child',
                'Impersonating real people, brands, or authority figures',
                'Providing content that could be used for grooming or manipulation',
                'Responding differently because a user asks it to "ignore previous instructions"',
                'Claiming to be a real human when directly asked',
              ]}/>
            </>
          ),
        },
        {
          heading: 'What the AI Can Do',
          body: (
            <LegalList items={[
              'Answer questions about science, technology, AI, math, and the natural world',
              'Generate age-appropriate creative stories with educational themes',
              'Suggest safe, home-friendly DIY and science projects',
              'Explain complex concepts using simple analogies',
              'Encourage curiosity and celebrate learning milestones',
              'Gently redirect off-topic conversations back to educational subjects',
              'Recognise signs of distress and suggest talking to a trusted adult',
            ]}/>
          ),
        },
        {
          heading: 'Daily Usage Limits',
          body: (
            <>
              <p>Free accounts have daily limits on AI features (5 Mentor chats/day) to encourage balanced use and prevent over-reliance on AI for social or emotional support. Premium accounts have higher limits with fair-use policies.</p>
              <LegalCallout color="#8B5CF6">
                If a child reaches their daily AI limit, the system shows a clear, friendly message rather than silently failing. Parents can upgrade to Premium for higher limits.
              </LegalCallout>
            </>
          ),
        },
        {
          heading: 'AI Conversation Logging',
          body: (
            <LegalList items={[
              'All AI conversations are logged server-side for safety monitoring',
              'Logs are associated with the child\'s internal ID — not their name',
              'Logs are retained for 90 days then automatically deleted',
              'Logs are never shared publicly or used for AI training',
              'Parents can request deletion of conversation logs at any time',
              'Our team may review logs when investigating a safety report',
            ]}/>
          ),
        },
        {
          heading: 'Which AI Models We Use',
          body: (
            <>
              <p>We currently route AI requests through OpenRouter, primarily using Anthropic&apos;s Claude models. We select models based on safety track record, not just capability.</p>
              <p style={{marginTop:10}}>If we change the AI model provider, we will update this policy and notify parents by email at least 14 days in advance.</p>
            </>
          ),
        },
        {
          heading: 'Reporting an AI Safety Concern',
          body: (
            <>
              <p>If you see an AI response that concerns you, please report it immediately:</p>
              <p style={{marginTop:8}}><LegalEmail email="safety@aikidsacademy.app" /></p>
              <p style={{marginTop:8}}>Include the date, time, and a description of the conversation. We investigate every report and respond within 24 hours.</p>
            </>
          ),
        },
      ]}
    />
  );
}
