'use client';
import { useState } from 'react';
import { useProgress } from '@/hooks/useProgress';

const PROJECTS = [
  {id:'phone_stand', icon:'📱', name:'Cardboard Phone Stand', xp:50, skill:'Engineering', time:'20 min', diff:'Easy',
   materials:['Cardboard box (cereal or shoe box)','Scissors (with adult help)','Ruler','Pencil','Tape','Paint or markers (optional)'],
   steps:['Cut a strip of cardboard 15cm × 8cm.','Fold it in a Z-shape: fold 5cm up, then 5cm back, leaving 5cm flat at base.','Tape the folds to hold.','Cut a slot in the middle fold to hold your phone.','Decorate with markers!'],
   safety:'Ask an adult to help with scissors on thick cardboard.',
   note:'Triangles make structures stronger — try bracing the back!'},
  {id:'pencil_organizer', icon:'✏️', name:'Pencil Organizer', xp:45, skill:'Design', time:'15 min', diff:'Easy',
   materials:['Empty toilet paper rolls (4-6)','Cereal box cardboard','Scissors','Glue or tape','Paint or stickers'],
   steps:['Cut cardboard into a rectangle for the base.','Glue toilet rolls upright onto the base.','Let dry completely.','Decorate however you like!','Fill with pens, pencils, and markers.'],
   safety:'Let glue dry fully before loading with heavy items.',
   note:'Try different heights for different length items!'},
  {id:'paper_bridge', icon:'🌉', name:'Paper Bridge Challenge', xp:70, skill:'Structural Engineering', time:'30 min', diff:'Medium',
   materials:['10 sheets of A4 paper','Sticky tape','Scissors','Small weights (coins)','2 books of equal height (for the bridge pillars)'],
   steps:['Place two stacks of books 20cm apart.','Design and build a bridge using only paper and tape to span the gap.','Test by adding coins — how many can it hold?','Rebuild with improvements!','Document your strongest design.'],
   safety:'Keep your workspace clear. Scissors: adult supervision.',
   note:'Folded paper (like corrugated cardboard) is much stronger than flat paper!'},
  {id:'rubber_band_car', icon:'🚗', name:'Rubber Band Car', xp:80, skill:'Mechanics', time:'45 min', diff:'Hard',
   materials:['Cardboard (thick cereal box)','4 plastic bottle caps or wooden spools (wheels)','2 bamboo skewers or straws (axles)','Rubber bands','Tape','Scissors','Craft knife (adult use only)'],
   steps:['Cut car body from cardboard (rectangle, about 15×8cm).','Push skewers through the body for axles.','Attach bottle caps as wheels with tape.','Loop rubber bands around the rear axle.','Wind the rubber band by rolling the car backwards, then release!'],
   safety:'Craft knife must be used by an adult only. Skewer tips are sharp.',
   note:'Newton\'s Third Law in action — tension released equals forward motion!'},
  {id:'recycled_robot', icon:'🤖', name:'Recycled Robot', xp:65, skill:'Creativity + Recycling', time:'40 min', diff:'Medium',
   materials:['Empty boxes and cartons (various sizes)','Bottle caps, lids, straws','Aluminium foil','Glue or tape','Markers','String or pipe cleaners'],
   steps:['Choose a large box for the body and smaller box for the head.','Attach the head with tape or glue.','Add foil for a shiny metallic look.','Use bottle caps for eyes, straws for antennae.','Add arms and legs from cardboard tubes.'],
   safety:'Wash out food containers before using them.',
   note:'Challenge: make a robot that can hold something, or has moving arms!'},
  {id:'vision_board', icon:'🎯', name:'Vision Board Poster', xp:55, skill:'Goal Setting', time:'60 min', diff:'Easy',
   materials:['Large sheet of paper or cardboard','Old magazines or printed pictures','Scissors','Glue stick','Markers and pens','Stickers (optional)'],
   steps:['Think about 5 goals or dreams for this year.','Find or draw images that represent each goal.','Arrange them on your board — play with layout first!','Glue everything down.','Add words, quotes, and colours around each goal.'],
   safety:'Use a child-safe glue stick.',
   note:'Put your vision board somewhere you\'ll see it every day!'},
  {id:'board_game', icon:'♟️', name:'Simple Board Game', xp:90, skill:'Game Design + Logic', time:'60 min', diff:'Hard',
   materials:['Large cardboard sheet','Markers (many colours)','Dice','Small objects as player tokens','Index cards (for challenges)','Ruler','Pencil'],
   steps:['Design a path of 30 squares on the cardboard.','Draw start and finish.','Add 5 "challenge" squares (players must answer a question).','Add 3 "shortcut" and 3 "setback" squares.','Write 20 challenge cards (questions on any topic you like).','Test play and improve!'],
   safety:'No safety concerns — creative fun only!',
   note:'The best games have clear rules, balance of luck and skill, and are fun to lose!'},
  {id:'bird_house', icon:'🐦', name:'Mini Bird House Concept', xp:60, skill:'Architecture + Nature', time:'45 min', diff:'Medium',
   materials:['Large cardboard box','Scissors','Paint (brown, grey, green)','Glue','Straw or sticks (for roof)','String (for hanging)'],
   steps:['Design your bird house on paper first — entrance hole, perch, roof.','Cut cardboard into: front/back (with arch), two sides, floor, and roof pieces.','Assemble with glue and tape.','Paint and decorate.','Ask an adult to hang it outside (optional)!'],
   safety:'Adult help for hanging outdoors. Keep hole small (3cm) so cats cannot reach in.',
   note:'Research what birds live near you — different birds prefer different hole sizes!'},
];

export default function DIYScreen() {
  const { isCompleted, completeItem } = useProgress();
  const [selected, setSelected] = useState<typeof PROJECTS[0] | null>(null);
  const [completing, setCompleting] = useState(false);

  const completedCount = PROJECTS.filter(p => isCompleted('diy_project', p.id)).length;

  async function handleComplete(proj: typeof PROJECTS[0]) {
    if (completing) return;
    setCompleting(true);
    await completeItem('diy_project', proj.id, proj.name, proj.xp, 15);
    setCompleting(false);
    setSelected(null);
  }

  if (selected) {
    const done = isCompleted('diy_project', selected.id);
    return (
      <div style={{ maxWidth:680 }}>
        <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', color:'var(--sky)', fontWeight:700, cursor:'pointer', marginBottom:14 }}>← Back to projects</button>
        <div style={{ background:'linear-gradient(135deg,#FFB800,#FF6B6B)', borderRadius:20, padding:24, color:'#fff', marginBottom:16 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>{selected.icon}</div>
          <div style={{ fontWeight:900, fontSize:20, marginBottom:4 }}>{selected.name}</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', fontSize:12, opacity:.9 }}>
            <span>⏱️ {selected.time}</span><span>📊 {selected.diff}</span>
            <span>🎓 {selected.skill}</span><span>+{selected.xp} XP</span>
          </div>
        </div>
        <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:16, padding:18, marginBottom:12 }}>
          <div style={{ fontWeight:800, fontSize:13, color:'var(--text2)', marginBottom:10, textTransform:'uppercase' }}>📦 Materials</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {selected.materials.map((m,i) => <span key={i} style={{ background:'#F5F7FF', border:'1px solid #E5E7EB', borderRadius:99, padding:'5px 12px', fontSize:12, fontWeight:600 }}>{m}</span>)}
          </div>
        </div>
        <div style={{ background:'#FFF5F3', border:'1.5px solid #FFB800', borderRadius:12, padding:14, marginBottom:12, fontSize:13 }}>
          ⚠️ <strong>Safety:</strong> {selected.safety}
        </div>
        <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:16, padding:18, marginBottom:12 }}>
          <div style={{ fontWeight:800, fontSize:13, color:'var(--text2)', marginBottom:12, textTransform:'uppercase' }}>📋 Steps</div>
          {selected.steps.map((s,i) => (
            <div key={i} style={{ display:'flex', gap:12, marginBottom:10, alignItems:'flex-start' }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#FFB800,#FF6B6B)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, flexShrink:0 }}>{i+1}</div>
              <div style={{ fontSize:14, lineHeight:1.6, paddingTop:3 }}>{s}</div>
            </div>
          ))}
        </div>
        <div style={{ background:'var(--sky-light)', borderRadius:12, padding:14, marginBottom:16, fontSize:13 }}>
          💡 <strong>Engineering tip:</strong> {selected.note}
        </div>
        <button onClick={() => handleComplete(selected)} disabled={done || completing}
          style={{ width:'100%', background:done?'#E5E7EB':'linear-gradient(135deg,#FFB800,#FF6B6B)', color:done?'#6B7280':'#fff', border:'none', borderRadius:14, padding:14, fontWeight:800, fontSize:15, cursor:done?'default':'pointer' }}>
          {completing ? '...' : done ? '✅ Already completed!' : `🎉 Mark Complete & Earn ${selected.xp} XP`}
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:720 }}>
      <div style={{ background:'linear-gradient(135deg,#FFB800,#FF6B6B)', borderRadius:20, padding:22, color:'#fff', marginBottom:20 }}>
        <div style={{ fontSize:40, marginBottom:8 }}>🔨</div>
        <div style={{ fontWeight:900, fontSize:22 }}>DIY Creator</div>
        <div style={{ fontSize:13, opacity:.85 }}>Build amazing things with everyday materials! · {completedCount}/8 done</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(165px,1fr))', gap:12 }}>
        {PROJECTS.map(p => {
          const done = isCompleted('diy_project', p.id);
          return (
            <div key={p.id} onClick={() => setSelected(p)}
              style={{ background:done?'#DCFDF2':'#fff', border:`2px solid ${done?'#22D3A6':'#E5E7EB'}`, borderRadius:16, padding:16, cursor:'pointer', transition:'all .2s' }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor='#FFB800')}
              onMouseLeave={e=>(e.currentTarget.style.borderColor=done?'#22D3A6':'#E5E7EB')}>
              <div style={{ fontSize:32, marginBottom:6 }}>{p.icon}</div>
              <div style={{ fontWeight:800, fontSize:12, marginBottom:4 }}>{p.name}</div>
              <div style={{ fontSize:11, color:'#6B7280', marginBottom:2 }}>{p.time} · {p.diff}</div>
              <div style={{ fontSize:11, color:done?'#065F46':'var(--sky)', fontWeight:700 }}>{done?'✅ Done':'+'+p.xp+' XP'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
