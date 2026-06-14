'use client';
import { useProgress } from '@/hooks/useProgress';
import { BADGE_DEFINITIONS } from '@/lib/achievement-service';
import { useAuthStore } from '@/lib/auth-store';

const TIER_COLORS: Record<string,string> = {
  bronze:    '#CD7F32',  silver:  '#C0C0C0',
  gold:      '#FFB800',  diamond: '#4F8EF7',  legendary: '#8B5CF6',
};
const TIER_BG: Record<string,string> = {
  bronze:    '#FFF8F3',  silver:  '#F8F8F8',
  gold:      '#FFF7D6',  diamond: '#E8F1FF',  legendary: '#EDE9FE',
};

export default function AchievementsScreen() {
  const { stats, isLoaded } = useProgress();
  const { activeChild }     = useAuthStore();

  const totalBadges   = BADGE_DEFINITIONS.length;
  const earned        = BADGE_DEFINITIONS.filter(b => b.check(stats));
  const earnedCount   = earned.length;
  const totalXPBadges = earned.reduce((s,b) => s+b.xp, 0);

  // Group by tier
  const byTier = (['legendary','diamond','gold','silver','bronze'] as const).map(tier => ({
    tier,
    badges: BADGE_DEFINITIONS.filter(b => b.tier === tier),
    color: TIER_COLORS[tier],
    bg: TIER_BG[tier],
  }));

  return (
    <div>
      <div style={{background:'linear-gradient(135deg,#FFB800,#FF6B6B,#8B5CF6)',borderRadius:22,padding:26,color:'#fff',marginBottom:22,position:'relative',overflow:'hidden'}}>
        <div style={{fontSize:11,opacity:.8,fontWeight:600,marginBottom:4}}>Achievements</div>
        <div style={{fontSize:24,fontWeight:900,marginBottom:6}}>🏆 Your Badges!</div>
        <div style={{display:'flex',gap:16,flexWrap:'wrap',marginTop:10}}>
          {[
            {val:`${earnedCount}/${totalBadges}`, lbl:'Badges Earned'},
            {val:`${totalXPBadges}`,              lbl:'Bonus XP'},
            {val:stats.streakDays,                lbl:'Day Streak'},
            {val:stats.xp,                        lbl:'Total XP'},
          ].map(s => (
            <div key={s.lbl} style={{background:'rgba(255,255,255,.15)',borderRadius:10,padding:'8px 14px',textAlign:'center'}}>
              <div style={{fontSize:18,fontWeight:900}}>{s.val}</div>
              <div style={{fontSize:10,opacity:.8}}>{s.lbl}</div>
            </div>
          ))}
        </div>
        <div style={{position:'absolute',right:28,top:'50%',transform:'translateY(-50%)',fontSize:72,opacity:.2}}>🏅</div>
      </div>

      {!isLoaded && (
        <div style={{textAlign:'center',padding:32,color:'var(--text2)',fontSize:14}}>
          <div className="aka-spinner" style={{borderTopColor:'var(--sky)',borderColor:'var(--border)',margin:'0 auto 12px',width:28,height:28}}/>
          Loading your badges...
        </div>
      )}

      {/* Progress bar */}
      <div style={{background:'var(--card)',borderRadius:14,padding:18,border:'1.5px solid var(--border)',marginBottom:18}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:13,fontWeight:700,marginBottom:8}}>
          <span>Overall Progress</span>
          <span style={{color:'var(--sky)'}}>{Math.round(earnedCount/totalBadges*100)}%</span>
        </div>
        <div style={{height:10,background:'var(--border)',borderRadius:99,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${Math.round(earnedCount/totalBadges*100)}%`,background:'linear-gradient(90deg,var(--sky),var(--violet))',borderRadius:99,transition:'width 1s'}}/>
        </div>
        <div style={{fontSize:12,color:'var(--text2)',marginTop:6}}>{totalBadges - earnedCount} badges remaining to collect!</div>
      </div>

      {/* Badges by tier */}
      {byTier.map(({ tier, badges, color, bg }) => (
        <div key={tier} style={{marginBottom:22}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <div style={{width:12,height:12,borderRadius:'50%',background:color,flexShrink:0}}/>
            <h2 style={{fontSize:15,fontWeight:800,color:'var(--text)',textTransform:'capitalize'}}>{tier} Badges</h2>
            <span style={{fontSize:12,color:'var(--text2)'}}>{badges.filter(b=>b.check(stats)).length}/{badges.length}</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:11}}>
            {badges.map(badge => {
              const isEarned = badge.check(stats);
              return (
                <div key={badge.id} style={{
                  background: isEarned ? bg : 'var(--card)',
                  border: `2px solid ${isEarned ? color : 'var(--border)'}`,
                  borderRadius: 14, padding: 14, textAlign: 'center',
                  opacity: isEarned ? 1 : .45,
                  filter: isEarned ? 'none' : 'grayscale(1)',
                  transition: 'all .2s',
                }}>
                  <div style={{fontSize:36,marginBottom:6}}>{badge.icon}</div>
                  <div style={{fontWeight:800,fontSize:12,marginBottom:3,color:isEarned?'var(--text)':'var(--text2)'}}>{badge.name}</div>
                  <div style={{fontSize:10,color:'var(--text2)',marginBottom:6,lineHeight:1.3}}>{badge.category}</div>
                  {isEarned && (
                    <div style={{fontSize:10,fontWeight:800,color,padding:'2px 8px',background:bg,borderRadius:99}}>+{badge.xp} XP</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{textAlign:'center',padding:'20px 0',fontSize:13,color:'var(--text2)'}}>
        Logged in as <strong>{activeChild?.displayName ?? 'Explorer'}</strong> · Keep learning to unlock more! 🌟
      </div>
    </div>
  );
}
