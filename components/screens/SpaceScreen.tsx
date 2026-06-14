'use client';
import { useAppStore } from '@/lib/store';
import { useState } from 'react';
import { useProgress } from '@/hooks/useProgress';

const TOPICS = [
  {id:'solar_system', icon:'☀️', name:'The Solar System', xp:60,
   body:`Our solar system has 8 planets orbiting the Sun. The Sun contains 99.86% of all the solar system's mass! The 4 inner planets (Mercury, Venus, Earth, Mars) are rocky and small. The 4 outer giants (Jupiter, Saturn, Uranus, Neptune) are made mostly of gas and ice.`,
   fact:'Jupiter is so large that all other planets in the solar system could fit inside it with room to spare!',
   quiz:{q:'How many planets are in our solar system?',opts:['7','8','9','10'],correct:1,exp:'8 planets! Pluto was reclassified as a "dwarf planet" in 2006, which upset a lot of people!'}},
  {id:'planets', icon:'🪐', name:'Planets Deep Dive', xp:70,
   body:`Each planet is unique! Mercury is covered in craters and has no atmosphere. Venus is the hottest planet (460°C!) due to its thick atmosphere. Earth is the only known planet with life. Mars has the tallest volcano in the solar system — Olympus Mons at 21km high. Saturn's rings are made of ice and rock.`,
   fact:'A day on Venus is longer than a year on Venus — it rotates incredibly slowly!',
   quiz:{q:'Which planet is the hottest in our solar system?',opts:['Mercury','Venus','Earth','Mars'],correct:1,exp:'Venus! Even though Mercury is closer to the Sun, Venus\'s thick atmosphere traps heat like a greenhouse.'}},
  {id:'stars', icon:'⭐', name:'Stars & Their Life', xp:70,
   body:`Stars are giant balls of hot plasma powered by nuclear fusion — smashing hydrogen atoms together to create helium and enormous energy. Our Sun is a medium-sized, middle-aged star. Stars are born in nebulae (clouds of gas and dust), live for millions to billions of years, and die in spectacular ways — sometimes as supernovae!`,
   fact:'The nearest star to Earth (after the Sun) is Proxima Centauri — 4.24 light-years away. At the speed of light it would take 4.24 years to reach it!',
   quiz:{q:'What powers stars?',opts:['Burning fuel like wood','Nuclear fusion','Chemical reactions','Electricity'],correct:1,exp:'Nuclear fusion! Stars smash hydrogen atoms together at their cores, releasing massive energy. The Sun fuses 600 million tonnes of hydrogen every second!'}},
  {id:'galaxies', icon:'🌌', name:'Galaxies', xp:80,
   body:`A galaxy is a massive collection of stars, gas, dust, and dark matter held together by gravity. Our Milky Way contains about 200-400 billion stars! There are an estimated 2 trillion galaxies in the observable universe. Galaxies come in three shapes: spiral (like the Milky Way), elliptical, and irregular.`,
   fact:'The Andromeda Galaxy is heading towards the Milky Way at 110km per second — they\'ll collide in about 4.5 billion years!',
   quiz:{q:'What shape is the Milky Way galaxy?',opts:['Circular','Elliptical','Spiral','Rectangular'],correct:2,exp:'Spiral! The Milky Way has beautiful spiral arms. If you could see it from above, it would look like a cosmic pinwheel.'}},
  {id:'black_holes', icon:'🕳️', name:'Black Holes', xp:90,
   body:`A black hole is a region of space where gravity is so strong that not even light can escape. They form when massive stars die and collapse. The boundary of no return is called the "event horizon." The first-ever photo of a black hole was taken in 2019 — it was 6.5 billion times the mass of our Sun!`,
   fact:'Spaghettification is a real word! Near a black hole, tidal forces would stretch you like spaghetti.',
   quiz:{q:'What is the "event horizon" of a black hole?',opts:['Its visible edge','The point of no return where light can\'t escape','Its atmosphere','The ring around it'],correct:1,exp:'The event horizon is the point of no return — anything that crosses it, even light, cannot escape the black hole\'s gravity. Beyond it, we can\'t know what happens!'}},
  {id:'rockets', icon:'🚀', name:'Rockets & Space Travel', xp:70,
   body:`Rockets work by Newton's Third Law: for every action there is an equal and opposite reaction. Burning fuel pushes downward, rocket goes upward. To reach orbit, you need to travel at about 28,000 km/h! The Saturn V rocket that took humans to the Moon was 111 metres tall — taller than the Statue of Liberty.`,
   fact:'Reusable rockets, like SpaceX\'s Falcon 9, can land themselves back on Earth after launch!',
   quiz:{q:'What scientific law do rockets use to generate thrust?',opts:['Law of Gravity','Newton\'s Third Law','Law of Conservation','Boyle\'s Law'],correct:1,exp:'Newton\'s Third Law! "For every action, there is an equal and opposite reaction." Exhaust gases push down, rocket goes up!'}},
  {id:'astronauts', icon:'👨‍🚀', name:'Life as an Astronaut', xp:70,
   body:`Astronauts on the International Space Station (ISS) float in microgravity — they have to be strapped in to sleep and their food is specially packaged. They exercise 2 hours every day to prevent muscle loss. They see 16 sunrises every 24 hours as the ISS orbits Earth every 90 minutes!`,
   fact:'Astronauts grow 2-3cm taller in space because their spines expand without gravity compressing them!',
   quiz:{q:'Why do astronauts exercise 2 hours every day in space?',opts:['Because they enjoy it','To prevent muscle and bone loss in microgravity','Because there\'s nothing else to do','Station rules require it'],correct:1,exp:'Muscles and bones weaken without gravity to work against. Without daily exercise, astronauts would come back to Earth too weak to stand!'}},
  {id:'missions', icon:'🌍', name:'Famous Space Missions', xp:80,
   body:`Apollo 11 (1969): Neil Armstrong and Buzz Aldrin became the first humans on the Moon. Voyager 1 (1977): Now 23 billion km from Earth — the farthest human-made object ever! Hubble Space Telescope (1990): Showed us the universe is 13.8 billion years old. James Webb Space Telescope (2021): Looking at galaxies from just 300 million years after the Big Bang!`,
   fact:`Neil Armstrong's first words on the Moon were "That's one small step for man, one giant leap for mankind."`,
   quiz:{q:'What was special about the Voyager 1 spacecraft?',opts:['It landed on Mars','It is the farthest human-made object from Earth','It found life in space','It photographed black holes'],correct:1,exp:'Voyager 1 is the most distant human-made object ever — over 23 billion kilometres from Earth, now in interstellar space!'}},
];

export default function SpaceScreen() {
  const { isCompleted, completeItem, newBadgesQueue, clearBadgesQueue } = useProgress();
  const [selected, setSelected] = useState<typeof TOPICS[0] | null>(null);
  const [quizDone, setQuizDone] = useState<{chosen:number;correct:boolean}|null>(null);
  const [completing, setCompleting] = useState(false);

  const completedCount = TOPICS.filter(t => isCompleted('discovery_mission', `space_${t.id}`)).length;

  async function handleComplete(topic: typeof TOPICS[0]) {
    if (completing) return;
    setCompleting(true);
    await completeItem('discovery_mission', `space_${topic.id}`, topic.name, topic.xp, 15);
    const spaceStore = useAppStore.getState();
    const spaceUser  = spaceStore.currentUser;
    if (spaceUser && !(spaceUser.completedSpace ?? []).includes(topic.id)) {
      spaceStore.updateUser({ completedSpace: [...(spaceUser.completedSpace ?? []), topic.id] });
    }
    setCompleting(false);
    setSelected(null); setQuizDone(null);
  }

  if (selected) {
    const done = isCompleted('discovery_mission', `space_${selected.id}`);
    return (
      <div style={{ maxWidth:680 }}>
        <button onClick={() => { setSelected(null); setQuizDone(null); }} style={{ background:'none', border:'none', color:'var(--sky)', fontWeight:700, cursor:'pointer', marginBottom:14 }}>← Back</button>
        <div style={{ background:'linear-gradient(135deg,#1A1D3A,#4F8EF7)', borderRadius:20, padding:24, color:'#fff', marginBottom:16 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>{selected.icon}</div>
          <div style={{ fontWeight:900, fontSize:20 }}>{selected.name}</div>
          <div style={{ fontSize:12, opacity:.7 }}>+{selected.xp} XP</div>
        </div>
        <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:16, padding:20, marginBottom:12 }}>
          <div style={{ fontWeight:800, fontSize:13, color:'var(--text2)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.05em' }}>📖 Lesson</div>
          <p style={{ fontSize:14, lineHeight:1.8, color:'#374151' }}>{selected.body}</p>
        </div>
        <div style={{ background:'linear-gradient(135deg,var(--sky-light),var(--violet-light))', borderRadius:14, padding:16, marginBottom:12 }}>
          <div style={{ fontWeight:800, fontSize:13, marginBottom:4 }}>🤯 Mind-blowing Fact</div>
          <p style={{ fontSize:13, lineHeight:1.6, color:'#374151' }}>{selected.fact}</p>
        </div>
        <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:16, padding:20 }}>
          <div style={{ fontWeight:800, fontSize:14, marginBottom:14 }}>🎯 Quick Quiz</div>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:14, color:'#1A1D3A' }}>{selected.quiz.q}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
            {selected.quiz.opts.map((opt, i) => {
              let bg = '#F5F7FF', border = '#E5E7EB', color = '#374151';
              if (quizDone) {
                if (i === selected.quiz.correct) { bg='#DCFDF2'; border='#22D3A6'; color='#065F46'; }
                else if (i === quizDone.chosen && !quizDone.correct) { bg='#FFE8E8'; border='#FF6B6B'; color='#991B1B'; }
              }
              return (
                <button key={i} disabled={!!quizDone}
                  onClick={() => setQuizDone({ chosen:i, correct:i===selected.quiz.correct })}
                  style={{ background:bg, border:`2px solid ${border}`, color, borderRadius:12, padding:'12px 16px', fontWeight:600, fontSize:14, cursor:quizDone?'default':'pointer', textAlign:'left' }}>
                  {opt}
                </button>
              );
            })}
          </div>
          {quizDone && (
            <>
              <div style={{ background: quizDone.correct?'#DCFDF2':'#FFE8E8', borderRadius:12, padding:14, marginTop:12, fontSize:13, color: quizDone.correct?'#065F46':'#991B1B', fontWeight:600 }}>
                {quizDone.correct ? '✅' : '❌'} {selected.quiz.exp}
              </div>
              <button onClick={() => handleComplete(selected)} disabled={done || completing}
                style={{ width:'100%', background:done?'#E5E7EB':'linear-gradient(135deg,#1A1D3A,#4F8EF7)', color:done?'#6B7280':'#fff', border:'none', borderRadius:12, padding:13, fontWeight:800, fontSize:14, cursor:done?'default':'pointer', marginTop:12 }}>
                {completing ? '...' : done ? '✅ Already completed!' : `🚀 Complete & Earn ${selected.xp} XP`}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:720 }}>
      <div style={{ background:'linear-gradient(135deg,#1A1D3A,#4F8EF7,#8B5CF6)', borderRadius:20, padding:22, color:'#fff', marginBottom:20 }}>
        <div style={{ fontSize:40, marginBottom:8 }}>🚀</div>
        <div style={{ fontWeight:900, fontSize:22 }}>Space Explorer</div>
        <div style={{ fontSize:13, opacity:.85 }}>Explore the universe — from your bedroom! · {completedCount}/8 complete</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(165px,1fr))', gap:12 }}>
        {TOPICS.map(t => {
          const done = isCompleted('discovery_mission', `space_${t.id}`);
          return (
            <div key={t.id} onClick={() => { setSelected(t); setQuizDone(null); }}
              style={{ background: done ? '#DCFDF2' : '#fff', border:`2px solid ${done?'#22D3A6':'#E5E7EB'}`, borderRadius:16, padding:16, cursor:'pointer', textAlign:'center', transition:'all .2s' }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor='#4F8EF7')}
              onMouseLeave={e=>(e.currentTarget.style.borderColor=done?'#22D3A6':'#E5E7EB')}>
              <div style={{ fontSize:32, marginBottom:6 }}>{t.icon}</div>
              <div style={{ fontWeight:800, fontSize:12, marginBottom:4 }}>{t.name}</div>
              <div style={{ fontSize:11, color:'#6B7280' }}>{done?'✅ Done':'+'+t.xp+' XP'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
