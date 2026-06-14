'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';

const PETS = [
  {id:'pip',    name:'Pip',     emoji:'🦊', desc:'A curious fox who loves science experiments!',  unlockXP:0,    color:'#FFB800'},
  {id:'bolt',   name:'Bolt',   emoji:'⚡', desc:'A speedy wolf who loves engineering challenges!', unlockXP:200,  color:'#4F8EF7'},
  {id:'nova',   name:'Nova',   emoji:'🌟', desc:'A glowing star-cat who loves space exploration!', unlockXP:500,  color:'#8B5CF6'},
  {id:'draco',  name:'Draco',  emoji:'🐉', desc:'A wise dragon who loves AI and stories!',         unlockXP:1000, color:'#FF6B6B'},
  {id:'sparkle',name:'Sparkle',emoji:'✨', desc:'A magical unicorn who loves creativity and art!',  unlockXP:2000, color:'#22D3A6'},
];

const PET_LEVELS = [
  {min:0,   label:'Egg',       icon:'🥚'},
  {min:50,  label:'Baby',      icon:'🐣'},
  {min:150, label:'Young',     icon:'🐥'},
  {min:300, label:'Growing',   icon:'🌱'},
  {min:600, label:'Trained',   icon:'⭐'},
  {min:1000,label:'Legendary', icon:'👑'},
];

export default function PetScreen() {
  const { currentUser, addXP, updateUser } = useAppStore();
  const xp     = currentUser?.xp ?? 0;
  const active = currentUser?.activePet ?? 'pip';

  const [selectedPet, setSelectedPet] = useState(active);
  const petXP    = Math.floor(xp * 0.3);  // Pet XP = 30% of total XP
  const petLevel = PET_LEVELS.slice().reverse().find(l => petXP >= l.min) ?? PET_LEVELS[0];
  const nextLevel= PET_LEVELS.find(l => petXP < l.min);

  const pet = PETS.find(p => p.id === selectedPet) ?? PETS[0];

  function selectPet(id: string) {
    setSelectedPet(id);
    updateUser({ activePet: id });
  }

  const [interacted, setInteracted] = useState(false);

  function petPet() {
    if (interacted) return;
    // Rate-limit to 5 times per day via localStorage
    const today = new Date().toISOString().split('T')[0];
    const key   = `pet_pats_${today}`;
    try {
      const pats = parseInt(localStorage.getItem(key) ?? '0', 10);
      if (pats >= 5) return; // max 5 pats per day
      localStorage.setItem(key, String(pats + 1));
    } catch { /* */ }
    setInteracted(true);
    addXP(5);
    setTimeout(() => setInteracted(false), 3000);
  }

  return (
    <div style={{ maxWidth:600 }}>
      <div style={{ background:`linear-gradient(135deg,${pet.color},#1A1D3A)`, borderRadius:20, padding:24, color:'#fff', marginBottom:20, textAlign:'center' }}>
        <button onClick={petPet} style={{ background:'none', border:'none', cursor:interacted?'default':'pointer', animation: interacted ? 'bounce 0.5s ease' : 'float 3s ease-in-out infinite' }}>
          <div style={{ fontSize:80, marginBottom:8 }}>{pet.emoji}</div>
        </button>
        <div style={{ fontWeight:900, fontSize:22, marginBottom:4 }}>{pet.name}</div>
        <div style={{ fontSize:13, opacity:.85, marginBottom:4 }}>{pet.desc}</div>
        <div style={{ fontSize:12, opacity:.7 }}>{petLevel.icon} {petLevel.label} · {petXP} Pet XP</div>
        {interacted && <div style={{ fontSize:13, marginTop:8, animation:'slideInUp .3s ease' }}>❤️ {pet.name} loves you! +5 XP</div>}
      </div>

      {/* Level bar */}
      <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:16, padding:18, marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:700, marginBottom:8 }}>
          <span>{petLevel.icon} {petLevel.label}</span>
          {nextLevel && <span style={{ color:'var(--text2)', fontWeight:400 }}>{nextLevel.min - petXP} XP to {PET_LEVELS[PET_LEVELS.indexOf(petLevel)+1]?.label}</span>}
        </div>
        <div style={{ height:10, background:'#E5E7EB', borderRadius:99, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${Math.min(100, Math.round((petXP / (nextLevel?.min ?? petXP + 1)) * 100))}%`, background:`linear-gradient(90deg,${pet.color},#8B5CF6)`, borderRadius:99, transition:'width 1s' }}/>
        </div>
        <div style={{ fontSize:11, color:'var(--text2)', marginTop:6 }}>Your pet gains XP every time you complete activities! Tap {pet.name} to give them love 💕</div>
      </div>

      {/* Pet selection */}
      <div style={{ background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:16, padding:18 }}>
        <div style={{ fontWeight:800, fontSize:14, marginBottom:14 }}>🐾 Choose Your Pet</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>
          {PETS.map(p => {
            const unlocked = xp >= p.unlockXP;
            const isActive = p.id === selectedPet;
            return (
              <button key={p.id} onClick={() => unlocked && selectPet(p.id)} disabled={!unlocked}
                style={{
                  background: isActive ? `${p.color}22` : '#F9FAFB',
                  border:`2px solid ${isActive?p.color:'#E5E7EB'}`,
                  borderRadius:14, padding:'12px 6px', cursor:unlocked?'pointer':'default',
                  opacity:unlocked?1:.4, filter:unlocked?'none':'grayscale(0.8)', textAlign:'center',
                }}>
                <div style={{ fontSize:28, marginBottom:4 }}>{p.emoji}</div>
                <div style={{ fontSize:10, fontWeight:800 }}>{p.name}</div>
                {!unlocked && <div style={{ fontSize:9, color:'#9CA3AF', marginTop:2 }}>{p.unlockXP}XP</div>}
                {isActive && <div style={{ fontSize:9, color:p.color, fontWeight:800, marginTop:2 }}>Active!</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
