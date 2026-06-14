export const LESSONS = [
  {id:1, title:'What is Artificial Intelligence?', desc:'5 min · Beginner',    xp:50,  emoji:'🤖'},
  {id:2, title:'The History of AI',                desc:'6 min · Beginner',    xp:50,  emoji:'📜'},
  {id:3, title:'AI in Everyday Life',              desc:'5 min · Beginner',    xp:60,  emoji:'🌍'},
  {id:4, title:'How ChatGPT Works',                desc:'8 min · Intermediate', xp:70, emoji:'💬'},
  {id:5, title:'What Are Prompts?',                desc:'6 min · Intermediate', xp:60, emoji:'✨'},
  {id:6, title:'AI Image Generation',              desc:'7 min · Intermediate', xp:70, emoji:'🎨'},
  {id:7, title:'AI Ethics & Fairness',             desc:'8 min · Intermediate', xp:80, emoji:'⚖️'},
  {id:8, title:'AI Safety Rules',                  desc:'6 min · Intermediate', xp:70, emoji:'🛡️'},
  {id:9, title:'What Are Deepfakes?',              desc:'7 min · Advanced',     xp:90, emoji:'🎭'},
  {id:10,title:'Detecting Fake News',              desc:'8 min · Advanced',     xp:90, emoji:'🔍'},
  {id:11,title:'Responsible AI Use',               desc:'7 min · Advanced',     xp:80, emoji:'🌟'},
  {id:12,title:'Build Your First AI Project!',     desc:'15 min · Advanced',    xp:150,emoji:'🚀'},
];

interface LessonContent {
  type:   string;
  title:  string;
  body:   string;
  visual: string;
  quiz:   { q:string; opts:string[]; correct:number; exp:string };
}

export const LESSON_CONTENT: Record<number, LessonContent> = {
  1: {
    type: 'Lesson 1 · Beginner',
    title: 'What is Artificial Intelligence? 🤖',
    body: `<p><strong>Artificial Intelligence (AI)</strong> means making computers smart enough to do things that normally need human thinking — like understanding speech, recognising faces, or making decisions.</p>
<p><strong>The simple definition:</strong> AI is when a machine learns from experience and uses that learning to solve new problems — just like you do!</p>
<p><strong>Fun analogy:</strong> Imagine teaching a dog to fetch. You show it what to do, reward it when it gets it right, and soon it learns automatically. AI learns the same way — except instead of treats, it uses maths! 🐕</p>
<p><strong>What can AI do right now?</strong></p>
<ul>
  <li>🎤 Understand your voice (Siri, Alexa)</li>
  <li>📸 Recognise faces in photos</li>
  <li>🎮 Play video games better than humans</li>
  <li>🩺 Help doctors spot diseases earlier</li>
  <li>🚗 Help self-driving cars navigate roads</li>
</ul>
<p><strong>Mini activity:</strong> Look around you right now. Can you spot 3 things that might use AI? (Hint: your phone, TV recommendation, or smart speaker!) 🔍</p>`,
    visual: '🧠 Human Brain → learns from experience\n🤖 AI System → learns from data\nBoth: improve with practice!',
    quiz: {
      q: 'What is the best description of Artificial Intelligence?',
      opts: ['A robot that looks like a human','Technology that makes computers think and learn like humans','A very fast calculator','A type of video game'],
      correct: 1,
      exp: 'Correct! AI is about making computers think and learn — not just calculate fast. It\'s the difference between a calculator and something that can actually understand what you\'re saying! 🤖✨'
    }
  },

  2: {
    type: 'Lesson 2 · Beginner',
    title: 'The History of AI 📜',
    body: `<p>AI isn't brand new — scientists have been dreaming about thinking machines for nearly 80 years!</p>
<p><strong>1950 — The Turing Test:</strong> Alan Turing, a British mathematician, asked: "Can machines think?" He invented a test: if you can't tell whether you're chatting with a human or a computer, the computer is intelligent. Pretty clever! 💡</p>
<p><strong>1956 — AI is born:</strong> A group of scientists at Dartmouth College in the USA officially named this new field "Artificial Intelligence." Party time! 🎉</p>
<p><strong>1997 — Deep Blue beats a chess champion:</strong> IBM's computer Deep Blue defeated world chess champion Garry Kasparov. Humans were shocked! ♟️</p>
<p><strong>2011 — Watson wins Jeopardy:</strong> IBM's Watson beat the all-time Jeopardy champions at trivia. AI could now understand natural language questions! 📺</p>
<p><strong>2016 — AlphaGo makes history:</strong> Google's AlphaGo beat the world's best Go player — a game so complex there are more possible positions than atoms in the universe! 🌌</p>
<p><strong>2022-present — The AI explosion:</strong> ChatGPT, DALL-E, and other tools brought AI to hundreds of millions of people. You are living through the most exciting moment in AI history! 🚀</p>
<p><strong>Fun fact:</strong> The word "robot" comes from the Czech word "robota" meaning "forced work" — coined in a 1920 play! 🤖</p>`,
    visual: '1950 Turing Test → 1956 AI named → 1997 Chess AI → 2011 Language AI → 2022 ChatGPT → YOU! 🚀',
    quiz: {
      q: 'Who invented the famous test to see if a machine can think?',
      opts: ['Albert Einstein','Alan Turing','Elon Musk','Steve Jobs'],
      correct: 1,
      exp: 'Correct! Alan Turing invented the Turing Test in 1950 — the idea that if you can\'t tell you\'re talking to a computer, it\'s being intelligent. He was a true genius! 🧠'
    }
  },

  3: {
    type: 'Lesson 3 · Beginner',
    title: 'AI in Everyday Life 🌍',
    body: `<p>You probably interact with AI dozens of times every day without even realising it! Let's go on a tour of a typical day with AI. 🌅</p>
<p><strong>Morning:</strong> Your phone's alarm uses AI to learn your sleep patterns. The news app shows you stories AI predicted you'd like. Your face unlock uses AI to recognise you!</p>
<p><strong>At school:</strong> Spell-check uses AI. Google Translate uses AI. Educational apps adapt to your level using AI.</p>
<p><strong>Entertainment:</strong> Netflix uses AI to suggest what to watch next. Spotify creates AI playlists just for you. YouTube recommends videos based on what you've liked before.</p>
<p><strong>Safety:</strong> AI helps detect spam and scam emails before they reach you. Banks use AI to spot when someone is stealing your money. Traffic cameras use AI to spot accidents.</p>
<p><strong>Health:</strong> AI can detect cancer in X-rays better than some doctors. AI helps design new medicines. Smartwatches use AI to detect irregular heartbeats.</p>
<p><strong>Fun analogy:</strong> AI is like a very helpful invisible assistant that's learned your preferences — it's working behind the scenes so your digital life runs smoothly! 🎩</p>
<p><strong>Mini activity:</strong> Write down every time you think AI helped you today. You'll be amazed how long the list gets! 📝</p>`,
    visual: '📱 Phone unlock → 🎵 Playlist → 🎬 Netflix → 📧 Spam filter → 🏥 Health AI\nAll powered by AI! 🤖',
    quiz: {
      q: 'Which of these everyday activities does NOT typically use AI?',
      opts: ['Netflix suggesting a film','A calculator adding numbers','Spotify creating a playlist','Google Maps finding a route'],
      correct: 1,
      exp: 'Correct! A basic calculator just does arithmetic — that\'s maths, not AI. But Netflix, Spotify, and Google Maps all use AI to learn your habits and make smart suggestions! 🎉'
    }
  },

  4: {
    type: 'Lesson 4 · Intermediate',
    title: 'How ChatGPT Works 💬',
    body: `<p>ChatGPT is a very smart AI program made by OpenAI. But how does it actually work?</p>
<p><strong>Step 1: It read billions of books and websites.</strong> Before ChatGPT could talk to you, it was "trained" by reading an enormous amount of text — billions of books, articles, and websites.</p>
<p><strong>Step 2: It learns patterns in language.</strong> ChatGPT didn't memorize all those words. Instead, it learned the PATTERNS of how words connect.</p>
<p><strong>Step 3: It predicts the next word.</strong> When you type a message, ChatGPT predicts what word should come next — millions of times, very fast.</p>
<p><strong>Think of it like this:</strong> Imagine you're playing a "finish the sentence" game. "The dog sat on the ___." Your brain says "mat" or "floor." ChatGPT has played this game so many times it got really, really good at it! 🤖</p>
<p><strong>The secret ingredient — attention:</strong> ChatGPT uses something called "transformers" that let it pay attention to ALL previous words in a conversation at once — not just the last word. That's why it remembers what you said earlier!</p>
<p><strong>Ethics note:</strong> ChatGPT can sometimes say things that sound confident but are wrong. This is called a "hallucination." Always double-check important facts! ⚠️</p>`,
    visual: '💬 Your question → 🔢 Converted to numbers → 🧠 Patterns matched → 📝 Word by word answer → 💬 Response!',
    quiz: {
      q: 'How does ChatGPT mainly generate its answers?',
      opts: ['It looks up answers in a secret database','It predicts the next word based on patterns','It has a human expert reviewing everything','It searches Google in real-time'],
      correct: 1,
      exp: 'Correct! ChatGPT works by predicting the next most likely word, based on patterns it learned from billions of texts. It\'s like a very smart autocomplete! 🎉'
    }
  },

  5: {
    type: 'Lesson 5 · Intermediate',
    title: 'What Are Prompts? ✨',
    body: `<p>A <strong>prompt</strong> is the text you type to an AI to get a response. Learning to write good prompts is one of the most valuable skills you can develop right now!</p>
<p><strong>Why does it matter?</strong> The same AI can give you a useless answer or an amazing answer — the difference is usually the prompt. Prompting is like giving clear instructions to a very smart but very literal assistant.</p>
<p><strong>Bad prompt:</strong> "Write a story"<br/><strong>Good prompt:</strong> "Write a 200-word adventure story for kids aged 10 about a girl who discovers she can talk to animals. Make it exciting and end with a twist."</p>
<p><strong>The 4 ingredients of a great prompt:</strong></p>
<ul>
  <li>🎭 <strong>Role</strong> — Tell the AI who to be: "You are a friendly science teacher..."</li>
  <li>📋 <strong>Task</strong> — Tell it exactly what to do: "Explain photosynthesis..."</li>
  <li>📏 <strong>Format</strong> — Tell it how to format: "in 5 bullet points, simple language..."</li>
  <li>👥 <strong>Audience</strong> — Tell it who it's for: "for a 12-year-old who loves football"</li>
</ul>
<p><strong>Pro tip — chain of thought:</strong> Add "Let's think step by step" to get better, more careful answers on maths or logic problems! 🧮</p>
<p><strong>Mini activity:</strong> Take the bad prompt "Help me with homework" and rewrite it using all 4 ingredients. Compare what each version gets you! 📝</p>`,
    visual: '🎭 Role + 📋 Task + 📏 Format + 👥 Audience = ✨ Perfect Prompt!',
    quiz: {
      q: 'Which is the BEST example of a well-written prompt?',
      opts: ['Tell me about space','Help','You are a space scientist. Explain black holes in 3 simple sentences for a 12-year-old.','What is a black hole? Tell me everything.'],
      correct: 2,
      exp: 'Correct! The third option gives the AI a role (space scientist), a task (explain black holes), a format (3 simple sentences), and an audience (12-year-old). That\'s all 4 ingredients! 🌟'
    }
  },

  6: {
    type: 'Lesson 6 · Intermediate',
    title: 'AI Image Generation 🎨',
    body: `<p>AI can now create stunning images from just a text description! Tools like DALL-E, Midjourney, and Stable Diffusion have changed art forever.</p>
<p><strong>How does it work?</strong> AI image generators were trained on millions of images and their descriptions. They learned what "a sunset over the ocean" looks like, what "a cartoon robot eating pizza" should look like, and millions of other concepts.</p>
<p><strong>The diffusion process:</strong> Start with random noise (like a TV with no signal). Then gradually remove the noise, guided by your text description, until a clear image appears. It's like sculpting something out of fog! 🌫️➡️🖼️</p>
<p><strong>What makes a good image prompt?</strong></p>
<ul>
  <li>📸 Style: "watercolor painting of...", "photorealistic...", "cartoon style..."</li>
  <li>💡 Lighting: "golden hour lighting", "dramatic shadows"</li>
  <li>🎭 Mood: "peaceful", "mysterious", "joyful"</li>
  <li>🔍 Details: "high resolution", "detailed", "close-up portrait"</li>
</ul>
<p><strong>Ethics note:</strong> AI image generators can be misused — like creating fake photos of real people, or copying artists' styles without permission. Always use AI art responsibly, clearly label AI-generated images, and respect artists' work! ⚠️</p>
<p><strong>Try it:</strong> Head to the Art Studio in this app to make your own AI artwork! 🎨</p>`,
    visual: '📝 Text prompt → 🌫️ Random noise → 🔄 Diffusion steps → 🖼️ Your image!\n(Thousands of tiny improvements)',
    quiz: {
      q: 'What technique do most modern AI image generators use?',
      opts: ['Copying images from the internet','Starting with random noise and gradually refining it','Drawing pixel by pixel like an artist','Taking photos with a digital camera'],
      correct: 1,
      exp: 'Correct! Most modern AI image generators use diffusion — starting with random noise and gradually removing it, guided by your text description, until a clear image appears. Amazing! 🖼️✨'
    }
  },

  7: {
    type: 'Lesson 7 · Intermediate',
    title: 'AI Ethics & Fairness ⚖️',
    body: `<p>AI is incredibly powerful — but power comes with responsibility. AI ethics is about making sure AI is used fairly, safely, and honestly.</p>
<p><strong>The problem of bias:</strong> AI learns from human-created data. If that data has biases (unfair assumptions), the AI learns those biases too!</p>
<p><strong>Real example:</strong> Early AI hiring tools were trained on past employee data. Since most past employees were male, the AI started preferring male candidates — even for jobs where gender makes no difference! This is called "algorithmic bias." 📊</p>
<p><strong>Other important ethics issues:</strong></p>
<ul>
  <li>🔒 <strong>Privacy</strong> — AI collects a lot of data. Who owns it? Who sees it?</li>
  <li>📋 <strong>Accountability</strong> — If an AI makes a mistake, who is responsible?</li>
  <li>🌍 <strong>Access</strong> — Will everyone benefit from AI, or only the wealthy?</li>
  <li>👷 <strong>Jobs</strong> — AI will change many jobs. How do we prepare people?</li>
  <li>🎭 <strong>Transparency</strong> — Should you always know when you're talking to an AI?</li>
</ul>
<p><strong>The "Five Principles of Ethical AI" (EU/UNESCO):</strong> Beneficence (help people), Non-maleficence (don't harm), Autonomy (respect choices), Justice (be fair), Explicability (be transparent).</p>
<p><strong>What can YOU do?</strong> Question AI decisions that affect you. Ask if AI was used. Demand fairness. Your generation will shape the future of AI! 💪</p>`,
    visual: '⚖️ Ethical AI = Fair + Safe + Honest + Transparent + Accountable',
    quiz: {
      q: 'What is "algorithmic bias" in AI?',
      opts: ['When an AI runs very slowly','When an AI learns unfair patterns from biased training data','When an AI makes mathematical errors','When an AI uses too much electricity'],
      correct: 1,
      exp: 'Correct! Algorithmic bias happens when AI learns unfair patterns from biased data — like an AI that discriminates based on gender or race because that\'s what was in the training data. We must always test AI for fairness! ⚖️'
    }
  },

  8: {
    type: 'Lesson 8 · Intermediate',
    title: 'AI Safety Rules 🛡️',
    body: `<p>As AI becomes more powerful, keeping it safe becomes more important. AI safety is one of the hottest research areas in the world right now!</p>
<p><strong>Why AI safety matters:</strong> A more powerful AI that's not aligned with human values could make decisions that harm people — even if it wasn't programmed to do so. It's like a very powerful robot that follows instructions too literally! 🤖</p>
<p><strong>The "alignment problem":</strong> How do you make sure an AI wants what humans want? If you tell an AI to "make people happy," it might decide to give everyone a happiness drug rather than actually helping them thrive. Oops! 😬</p>
<p><strong>Safety techniques being developed:</strong></p>
<ul>
  <li>🎯 <strong>RLHF</strong> — Reinforcement Learning from Human Feedback. Humans rate AI responses and the AI learns to do better.</li>
  <li>🔒 <strong>Constitutional AI</strong> — Teaching AI a set of principles to follow (like a moral code).</li>
  <li>🔴 <strong>Red-teaming</strong> — Having experts try to trick or break AI systems to find weaknesses.</li>
  <li>🚦 <strong>Kill switches</strong> — Building in ways to stop an AI if something goes wrong.</li>
</ul>
<p><strong>Content moderation in this app:</strong> Every message you send to Sparky (the AI Mentor) is checked for safety before and after the AI responds. We block harmful content automatically. 🛡️</p>
<p><strong>What you can do:</strong> Never try to "jailbreak" AI (trick it into ignoring safety rules). Those rules exist to protect you and others! 💪</p>`,
    visual: '🛡️ AI Safety Stack:\n👁️ Input filter → 🧠 Safety training → 📝 Output check → 🚦 Human oversight',
    quiz: {
      q: 'What is the "alignment problem" in AI safety?',
      opts: ['Making sure AI computers have good internet connections','Ensuring AI\'s goals and behaviours match human values','Making AI systems faster and more efficient','Aligning all AI companies under one government'],
      correct: 1,
      exp: 'Correct! The alignment problem is making sure AI systems actually want what humans want — that their goals are aligned with our values, not just following instructions in unexpected or harmful ways. 🛡️'
    }
  },

  9: {
    type: 'Lesson 9 · Advanced',
    title: 'What Are Deepfakes? 🎭',
    body: `<p>A <strong>deepfake</strong> is a video, image, or audio clip created using AI that shows a real person doing or saying something they never actually did. The name combines "deep learning" and "fake." 🎭</p>
<p><strong>How are they made?</strong> Deepfake AI is trained on thousands of images of a real person's face. It learns to map their facial movements onto another person's body in a video — frame by frame, perfectly. The results can look incredibly realistic.</p>
<p><strong>Why are they dangerous?</strong></p>
<ul>
  <li>🏛️ <strong>Political manipulation</strong> — Fake videos of politicians saying things they never said</li>
  <li>💸 <strong>Financial fraud</strong> — Fake video calls from "CEOs" ordering employees to send money</li>
  <li>🎭 <strong>Harassment</strong> — Creating fake videos to embarrass or harm individuals</li>
  <li>📰 <strong>Fake news</strong> — Making events appear to happen when they didn't</li>
</ul>
<p><strong>How to spot a deepfake:</strong></p>
<ul>
  <li>👁️ Unnatural blinking or eye movement</li>
  <li>💡 Lighting on the face doesn't match the background</li>
  <li>👂 Audio sounds slightly "off" from the lip movement</li>
  <li>✋ Hands and fingers look distorted</li>
  <li>🔲 Blurring or smearing near the face edges</li>
</ul>
<p><strong>The good news:</strong> Researchers are building "deepfake detectors" — AI that can spot AI-generated content. It's an arms race between creation and detection! ⚔️</p>`,
    visual: '🎭 Real person + 🤖 AI face-swap + 🎬 Source video = Deepfake\n⚠️ Can\'t always trust your eyes!',
    quiz: {
      q: 'What is the best first step when you see a shocking video of a famous person doing something unexpected?',
      opts: ['Share it immediately with all your friends','Check if trusted news sources are also reporting it','Believe it — video evidence is always real','Report it to police immediately'],
      correct: 1,
      exp: 'Correct! Always verify! Check if reputable news outlets are reporting the same thing. Deepfakes spread fastest when people share without checking. Be a critical thinker! 🔍🧠'
    }
  },

  10: {
    type: 'Lesson 10 · Advanced',
    title: 'Detecting Fake News 🔍',
    body: `<p>In a world where AI can generate convincing text, images, and video in seconds, <strong>media literacy</strong> — the ability to think critically about information — is a superpower! 🦸</p>
<p><strong>Why fake news spreads:</strong> Fake news is often designed to trigger strong emotions — outrage, fear, excitement. When we feel strong emotions, we share first and think second. AI content farms can generate thousands of fake articles per day!</p>
<p><strong>The SIFT method for fact-checking:</strong></p>
<ul>
  <li>⏸️ <strong>Stop</strong> — Pause before sharing. Do you feel a strong emotion? That's a warning sign!</li>
  <li>🔍 <strong>Investigate the source</strong> — Who published this? Are they reliable?</li>
  <li>🔎 <strong>Find better coverage</strong> — Search for other sources reporting the same story</li>
  <li>↩️ <strong>Trace claims</strong> — Find the original source of the claim or image</li>
</ul>
<p><strong>Red flags for fake news:</strong></p>
<ul>
  <li>🔴 Shocking headlines with lots of CAPS or exclamation marks!!!!</li>
  <li>🔴 No author name or a very unusual website address</li>
  <li>🔴 Blurry, reversed, or stolen images (reverse-search with Google Images)</li>
  <li>🔴 Very old news presented as new</li>
  <li>🔴 No other news source is reporting the same story</li>
</ul>
<p><strong>Useful free tools:</strong> Google Fact Check Explorer, Snopes, FactCheck.org, TinEye (reverse image search), InVID (video verification). 🔧</p>
<p><strong>AI and fake news:</strong> AI can now write articles that sound completely real. This makes your fact-checking skills MORE important, not less! 🧠</p>`,
    visual: '⏸️ STOP → 🔍 INVESTIGATE → 🔎 FIND MORE → ↩️ TRACE = ✅ Truth found!',
    quiz: {
      q: 'What does the "S" in the SIFT fact-checking method stand for?',
      opts: ['Search for evidence','Stop before sharing','Source verification','Share with others'],
      correct: 1,
      exp: 'Correct! S = Stop! Pausing before you react or share is the most important first step. Fake news is designed to make you feel emotions that make you act fast and think slow. Slow down! ⏸️🧠'
    }
  },

  11: {
    type: 'Lesson 11 · Advanced',
    title: 'Responsible AI Use 🌟',
    body: `<p>You now know a lot about AI — how it works, where it can go wrong, and how to spot misuse. Now let's talk about how to be a <strong>responsible AI user</strong> — and maybe one day, a responsible AI builder!</p>
<p><strong>Being a responsible AI user:</strong></p>
<ul>
  <li>✅ <strong>Be honest</strong> — Don't pretend AI-generated work is your own original work</li>
  <li>✅ <strong>Verify facts</strong> — AI makes mistakes. Check important information</li>
  <li>✅ <strong>Protect privacy</strong> — Don't share personal information with AI chatbots</li>
  <li>✅ <strong>Think critically</strong> — AI has biases. Question outputs that seem unfair</li>
  <li>✅ <strong>Use it to learn</strong> — Use AI as a learning tool, not a shortcut that stops you thinking</li>
</ul>
<p><strong>The "AI for Good" movement:</strong> Around the world, people are using AI to:</p>
<ul>
  <li>🌊 Predict floods and save lives</li>
  <li>🐋 Identify whale songs to track endangered species</li>
  <li>🌾 Optimise farming to reduce food waste</li>
  <li>💊 Discover new medicines faster</li>
  <li>♿ Create tools to help people with disabilities</li>
</ul>
<p><strong>You can be part of this!</strong> The AI revolution is only just beginning. People your age today will be the engineers, ethicists, artists, and policy-makers who shape AI's future. 💪</p>
<p><strong>Three questions to ask before using any AI output:</strong></p>
<ol>
  <li>Is this true? (Verify it!)</li>
  <li>Is this fair? (Check for bias!)</li>
  <li>Is this right? (Consider the ethics!)</li>
</ol>`,
    visual: '🌟 Responsible AI = ✅ Honest + 🔍 Verified + 🔒 Private + ⚖️ Fair + 🧠 Critical',
    quiz: {
      q: 'Which is the most responsible way to use an AI essay-writing tool for school?',
      opts: ['Copy the AI\'s essay word for word and submit it','Use it to get ideas, then write your own essay in your own words','Never use AI tools at all','Only use it if no one will find out'],
      correct: 1,
      exp: 'Correct! Using AI for ideas and then writing in your own words is both honest and smart. You learn more, it reflects your actual understanding, and you don\'t violate academic integrity. That\'s the responsible approach! 🌟'
    }
  },

  12: {
    type: 'Lesson 12 · Advanced',
    title: 'Build Your First AI Project! 🚀',
    body: `<p>🎉 Congratulations! You've made it to the final lesson. Now it's time to BUILD something with what you've learned!</p>
<p><strong>Your project:</strong> Design an AI app that solves a real problem in your school, community, or home.</p>
<p><strong>Step 1 — Find a problem 🔍</strong><br/>Think about something frustrating or inefficient around you. AI works best when it solves a clear, specific problem. Examples:</p>
<ul>
  <li>Students struggling to understand homework explanations</li>
  <li>Elderly neighbours who need help with technology</li>
  <li>Too much food waste at school lunches</li>
</ul>
<p><strong>Step 2 — Design your solution 📐</strong><br/>Sketch your app on paper. What does the user see? What do they type or click? What does the AI respond with? What data would the AI need to learn from?</p>
<p><strong>Step 3 — Write your system prompt ✨</strong><br/>Write the system prompt (instructions) you'd give an AI assistant to make your app work. Remember the 4 ingredients: Role, Task, Format, Audience!</p>
<p><strong>Step 4 — Think about safety ⚖️</strong><br/>How could your app be misused? What guardrails would you add? Who should NOT have access to it?</p>
<p><strong>Step 5 — Present your idea 🎤</strong><br/>Explain your project to a family member or friend. Can they understand the problem and solution? Great communicators make great engineers!</p>
<p><strong>🏆 You're now an AI Explorer!</strong> You understand how AI works, how to use it responsibly, and how to think about building with it. That puts you ahead of most adults on the planet. Keep learning, keep building, keep asking questions! 🚀</p>`,
    visual: '🔍 Problem → 📐 Design → ✨ Prompt → ⚖️ Safety → 🎤 Present → 🚀 Build!',
    quiz: {
      q: 'What is the FIRST and most important step when designing an AI project?',
      opts: ['Writing the code','Choosing which AI company to use','Clearly defining the problem you\'re trying to solve','Making the app look pretty'],
      correct: 2,
      exp: 'Correct! The most important first step is clearly defining the problem. The best engineers and AI builders spend most of their time understanding the problem before writing a single line of code. "A well-defined problem is half solved!" 🚀🏆'
    }
  },
};
