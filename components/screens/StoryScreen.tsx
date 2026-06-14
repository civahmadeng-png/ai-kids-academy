'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { SupabaseStories, isDemoMode } from '@/lib/supabaseClient';
import { useProgress } from '@/hooks/useProgress';

const WORLDS = [
  {id:'space',   name:'Space Adventure',    icon:'🚀', color:'linear-gradient(135deg,#1A1D3A,#4F8EF7)', heroes:['Astro Sam','Commander Lexa','Robot Helper']},
  {id:'dino',    name:'Dinosaur Island',    icon:'🦕', color:'linear-gradient(135deg,#22D3A6,#FFB800)', heroes:['Explorer Kai','Dino Whisperer','Dr. Rex']},
  {id:'robot',   name:'Robot City',         icon:'🤖', color:'linear-gradient(135deg,#8B5CF6,#FF6B6B)', heroes:['Bolt',   'Circuit',   'Giga']},
  {id:'ocean',   name:'Ocean Quest',        icon:'🌊', color:'linear-gradient(135deg,#4F8EF7,#22D3A6)', heroes:['Marina', 'Finn',      'Coral']},
  {id:'fantasy', name:'Fantasy Kingdom',    icon:'🏰', color:'linear-gradient(135deg,#FFB800,#8B5CF6)', heroes:['Princess Aria','Wizard Oak','Knight Leo']},
];

const DEMO_STORIES: Record<string, string[]> = {
  space:   ['A strange signal from a distant star… one daring explorer answers the call! 🚀 Navigating through an asteroid belt, they discover a planet that no one has ever seen. The skies shimmer with two suns and the ground glows purple.','The locals — small, glowing beings called Luminites — emerge cautiously. They have been waiting thousands of years for a visitor from across the stars. Their ancient city pulses with light.','A massive meteor threatens both worlds. With only minutes to act, our hero must choose: use the Luminites\' ancient crystal or trust their own Earth technology. "Together," the hero says, reaching out their hand. The Luminites beam with light.'],
  dino:    ['An ancient jungle island, untouched for 65 million years, suddenly appears on satellite maps! 🦕 A team of young scientists rushes to investigate. What they find defies all science.','Dinosaurs — living, breathing, and not at all happy about visitors — roam freely. But one young T-Rex is different: she helps the team rather than chasing them. She leads them to a hidden valley.','At the valley\'s heart is a mysterious glowing crystal that keeps the island hidden. The dinosaurs protect it. Our explorer must decide: tell the world, or keep the island\'s secret forever?'],
  robot:   ['In Robot City, every citizen is a machine — except you, a human child who arrived in a mysterious capsule! 🤖 The robots are friendly but confused. "What is laughter?" asks Bolt, the youngest robot.','Bolt decides to become your guide through the neon city. You visit the Memory Factory, the Dream Synthesiser, and the Emotion Engine. You teach Bolt what joy feels like.','But an ancient virus threatens to erase all robot memories. You and Bolt race through the circuit corridors. "I understand now," says Bolt, "friendship is worth more than any data."'],
  ocean:   ['A magical map leads you to the deepest trench in the Pacific — and a city that shouldn\'t exist! 🌊 Coral towers rise hundreds of metres. Schools of rainbow fish dart past like living fireworks.','The ocean people, the Marinae, are in danger. Their sacred Pearl of Tides has been stolen, and without it the currents will shift, wrecking coral reefs across the world.','You must swim deeper than anyone has before, outsmart the cunning moray guardian, and return the Pearl. "You breathe above, but you belong here too," whispers the reef. 🐚'],
  fantasy: ['A dragon egg has appeared on your doorstep — literally. It hatches into a tiny purple dragon named Ember who immediately sets your books on fire (accidentally). 🏰 Your quest has begun.','Following Ember\'s instincts, you travel to the Enchanted Mountains where an ancient prophecy awaits. Every creature you help along the way joins your growing band of unlikely friends.','The final challenge: a riddle posed by a sphinx. The answer isn\'t strength or magic — it\'s kindness. Your group of friends solves it together. Ember roars with rainbow fire.'],
};

export default function StoryScreen() {
  const { currentUser, addXP, addCoins, updateUser } = useAppStore();
  const { activeChild } = useAuthStore();
  const childId = activeChild?.id ?? 'demo';
  const { completeItem, isCompleted }                 = useProgress();
  const [world,   setWorld]   = useState<typeof WORLDS[0] | null>(null);
  const [hero,    setHero]    = useState('');
  const [chapter, setChapter] = useState(0);
  const [done,    setDone]    = useState(false);

  async function finishStory() {
    if (!world) return;
    const id = `story_${world.id}_${hero}`;
    const { isNew } = await completeItem('story', id, `${hero} in ${world.name}`, 80, 20, { world: world.id, hero });
    if (isNew) {
      // Add to local store
      updateUser({
        completedStories: [
          ...(currentUser?.completedStories ?? []),
          { title:`${hero} in ${world.name}`, world:world.id, hero, date:Date.now() }
        ]
      });
      // Save to Supabase stories table
      if (!isDemoMode() && childId !== 'demo') {
        SupabaseStories.save({
          child_id: childId,
          title:    `${hero} in ${world.name}`,
          world_id: world.id,
          hero_id:  hero,
          xp_earned: 80,
        }).catch(() => { /* offline — OK */ });
      }
    }
    setDone(true);
  }

  if (!world) return (
    <div style={{ maxWidth:680 }}>
      <div style={{ background:'linear-gradient(135deg,#8B5CF6,#4F8EF7)', borderRadius:20, padding:22, color:'#fff', marginBottom:20 }}>
        <div style={{ fontSize:40, marginBottom:8 }}>📚</div>
        <div style={{ fontWeight:900, fontSize:22 }}>AI Story World</div>
        <div style={{ fontSize:13, opacity:.85 }}>Choose a world and create your own adventure!</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {WORLDS.map(w => (
          <button key={w.id} onClick={() => setWorld(w)}
            style={{ background:w.color, borderRadius:16, padding:20, color:'#fff', border:'none', cursor:'pointer', textAlign:'left', transition:'transform .15s' }}
            onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.02)')}
            onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}>
            <div style={{ fontSize:36, marginBottom:8 }}>{w.icon}</div>
            <div style={{ fontWeight:900, fontSize:15 }}>{w.name}</div>
          </button>
        ))}
      </div>
    </div>
  );

  if (!hero) return (
    <div style={{ maxWidth:680 }}>
      <button onClick={() => setWorld(null)} style={{ background:'none', border:'none', color:'var(--sky)', fontWeight:700, cursor:'pointer', marginBottom:14 }}>← Back</button>
      <div style={{ background:world.color, borderRadius:20, padding:22, color:'#fff', marginBottom:20 }}>
        <div style={{ fontSize:40, marginBottom:6 }}>{world.icon}</div>
        <div style={{ fontWeight:900, fontSize:20 }}>{world.name}</div>
        <div style={{ fontSize:13, opacity:.85 }}>Choose your hero:</div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {world.heroes.map(h => (
          <button key={h} onClick={() => setHero(h)}
            style={{ background:'#fff', border:'2px solid #E5E7EB', borderRadius:14, padding:'14px 18px', fontWeight:700, fontSize:15, cursor:'pointer', textAlign:'left', transition:'all .15s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#8B5CF6';e.currentTarget.style.background='#EDE9FE';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#E5E7EB';e.currentTarget.style.background='#fff';}}>
            🦸 {h}
          </button>
        ))}
      </div>
    </div>
  );

  const storyParts = DEMO_STORIES[world.id] ?? DEMO_STORIES.space;
  const storyId    = `story_${world.id}_${hero}`;
  const alreadyDone = isCompleted('story', storyId);

  return (
    <div style={{ maxWidth:680 }}>
      <button onClick={() => { setHero(''); setChapter(0); setDone(false); }} style={{ background:'none', border:'none', color:'var(--sky)', fontWeight:700, cursor:'pointer', marginBottom:14 }}>← Choose different hero</button>
      <div style={{ background:world.color, borderRadius:20, padding:22, color:'#fff', marginBottom:20 }}>
        <div style={{ fontWeight:900, fontSize:20 }}>{world.icon} {world.name}</div>
        <div style={{ fontSize:14, opacity:.85 }}>Hero: {hero} · Chapter {chapter+1}/3</div>
        <div style={{ height:6, background:'rgba(255,255,255,.2)', borderRadius:99, marginTop:10, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${Math.round((chapter+1)/3*100)}%`, background:'#fff', borderRadius:99, transition:'width .5s' }}/>
        </div>
      </div>

      {done || alreadyDone ? (
        <div style={{ background:'linear-gradient(135deg,#FFB800,#FF6B6B)', borderRadius:20, padding:28, color:'#fff', textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:10 }}>🏆</div>
          <div style={{ fontWeight:900, fontSize:20, marginBottom:6 }}>Story Complete!</div>
          <div style={{ fontSize:14, opacity:.9 }}>+80 XP · +20 coins · Saved to My Creations</div>
        </div>
      ) : (
        <>
          <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:20, padding:24, marginBottom:16, fontSize:15, lineHeight:1.8, color:'#1A1D3A' }}>
            {storyParts[chapter]}
          </div>
          <div style={{ display:'flex', gap:10 }}>
            {chapter < storyParts.length - 1 ? (
              <button onClick={() => setChapter(c => c + 1)}
                style={{ flex:1, background:'linear-gradient(135deg,#8B5CF6,#4F8EF7)', color:'#fff', border:'none', borderRadius:14, padding:14, fontWeight:800, fontSize:15, cursor:'pointer' }}>
                Continue Story →
              </button>
            ) : (
              <button onClick={finishStory}
                style={{ flex:1, background:'linear-gradient(135deg,#FFB800,#FF6B6B)', color:'#fff', border:'none', borderRadius:14, padding:14, fontWeight:800, fontSize:15, cursor:'pointer' }}>
                🎉 Finish Story & Earn 80 XP!
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
