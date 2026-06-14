'use client';
import { useState, useEffect } from 'react';
import { useSubscription }    from '@/hooks/useSubscription';
import { useAuthStore }       from '@/lib/auth-store';
import { useAppStore }        from '@/lib/store';
import { PLANS, SubscriptionService, type Plan } from '@/lib/subscription-service';
import {
  startCheckout, openCustomerPortal, cancelSubscription,
  reactivateSubscription, fetchSubscriptionStatus,
  formatPeriodEnd, STRIPE_CONFIGURED, type BillingInterval,
} from '@/lib/stripe-client';
import { trackEvent } from '@/lib/analytics';

const isDev = process.env.NODE_ENV === 'development';

export default function UpgradeScreen() {
  const { plan: currentPlan, planDef }           = useSubscription();
  const { supabaseUser }                         = useAuthStore();
  const { currentUser, updateUser, showModal }   = useAppStore();

  const [billing, setBilling]       = useState<BillingInterval>('monthly');
  const [loading, setLoading]       = useState<Plan|null>(null);
  const [portalLoading, setPortal]  = useState(false);
  const [cancelLoading, setCancel]  = useState(false);
  const [statusMsg, setStatusMsg]   = useState('');
  const [subStatus, setSubStatus]   = useState<{ cancelAtPeriodEnd: boolean; periodEnd: string | null; trialEndsAt: string | null } | null>(null);
  const [devSwitching, setDev]      = useState(false);

  // Sync subscription status on mount (handles post-checkout redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');

    async function syncStatus() {
      const status = await fetchSubscriptionStatus();
      if (status) {
        updateUser({ plan: status.plan });
        setSubStatus({
          cancelAtPeriodEnd: status.cancelAtPeriodEnd,
          periodEnd: status.currentPeriodEnd,
          trialEndsAt: status.trialEndsAt,
        });
        if (checkout === 'success') {
          showModal(PLANS[status.plan].emoji, 'Welcome to ' + PLANS[status.plan].name + '!',
            'Your subscription is now active! Enjoy all the premium features. 🎉');
          void trackEvent('subscription_started', { plan: status.plan }, { parentId: supabaseUser?.id });
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }

    if (supabaseUser && STRIPE_CONFIGURED) syncStatus();
    // Fire plan_upgrade_viewed on every visit to this screen
    void trackEvent('plan_upgrade_viewed', {}, { parentId: supabaseUser?.id });
  }, [supabaseUser]);

  async function handleUpgrade(targetPlan: Plan) {
    if (targetPlan === 'free' || targetPlan === currentPlan) return;
    setLoading(targetPlan);
    setStatusMsg('');

    if (!STRIPE_CONFIGURED) {
      setLoading(null);
      showModal('🛠️', 'Stripe Not Configured',
        'Add your Stripe keys to .env.local to enable real payments.\n\nSee .env.example for the required variables.');
      return;
    }

    void trackEvent('upgrade_clicked', { plan: targetPlan, billing }, { parentId: supabaseUser?.id });
    if (supabaseUser) {
      await SubscriptionService.recordUpgradeIntent(supabaseUser.id, targetPlan, billing);
    }

    const result = await startCheckout(targetPlan as 'premium' | 'family', billing);
    if (result.error) {
      setStatusMsg(result.error);
      setLoading(null);
    }
    // If no error, browser is redirecting to Stripe — loader stays
  }

  async function handlePortal() {
    setPortal(true);
    const result = await openCustomerPortal();
    if (result.error) { setStatusMsg(result.error); setPortal(false); }
  }

  async function handleCancel() {
    if (!confirm('Cancel your subscription? You keep access until the end of your billing period.')) return;
    setCancel(true);
    const result = await cancelSubscription();
    setCancel(false);
    if (result.error) { setStatusMsg(result.error); }
    else {
      setStatusMsg(result.message ?? '');
      showModal('📋', 'Subscription Scheduled for Cancellation', result.message ?? '');
      void trackEvent('subscription_cancelled', { plan: currentPlan }, { parentId: supabaseUser?.id });
    }
  }

  async function handleReactivate() {
    setCancel(true);
    const result = await reactivateSubscription();
    setCancel(false);
    if (result.error) setStatusMsg(result.error);
    else showModal('🎉', 'Subscription Reactivated!', result.message ?? '');
  }

  async function devSwitch(p: Plan) {
    setDev(true);
    if (supabaseUser) await SubscriptionService.devSwitchPlan(supabaseUser.id, p);
    updateUser({ plan: p });
    setTimeout(() => setDev(false), 300);
    showModal('🛠️', 'Dev Mode', 'Switched to ' + PLANS[p].name);
  }

  const plansArr = [PLANS.free, PLANS.premium, PLANS.family];

  return (
    <div style={{ maxWidth: 920 }}>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#1A1D3A,#4F8EF7,#8B5CF6)', borderRadius:22, padding:30, color:'#fff', marginBottom:24, textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:10 }}>🚀</div>
        <div style={{ fontSize:26, fontWeight:900, marginBottom:6 }}>Unlock Your Child&apos;s Full Potential</div>
        <div style={{ fontSize:14, opacity:.9, marginBottom:20 }}>Join thousands of families building future-ready kids</div>

        {/* Status message */}
        {statusMsg && (
          <div style={{ background:'rgba(255,107,107,.25)', border:'1px solid rgba(255,107,107,.5)', borderRadius:10, padding:'10px 16px', fontSize:13, marginBottom:16 }}>
            {statusMsg}
          </div>
        )}

        {/* Billing toggle */}
        <div className="up-billing-toggle">
          <button className={`up-billing-btn${billing==='monthly'?' active':''}`} onClick={()=>setBilling('monthly')}>Monthly</button>
          <button className={`up-billing-btn${billing==='yearly'?' active':''}`} onClick={()=>setBilling('yearly')}>
            Yearly <span className="up-save-badge">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Trial / active status banner */}
      {subStatus?.trialEndsAt && (
        <div style={{ background:'var(--sun-light)', border:'1.5px solid var(--sun)', borderRadius:14, padding:'12px 18px', marginBottom:16, display:'flex', alignItems:'center', gap:10, fontSize:13 }}>
          <span style={{ fontSize:20 }}>⏳</span>
          <span>Your <strong>7-day free trial</strong> ends on <strong>{formatPeriodEnd(subStatus.trialEndsAt)}</strong>. Enjoy full access!</span>
        </div>
      )}
      {subStatus?.cancelAtPeriodEnd && subStatus.periodEnd && (
        <div style={{ background:'var(--coral-light)', border:'1.5px solid var(--coral)', borderRadius:14, padding:'12px 18px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, fontSize:13, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:20 }}>⚠️</span>
            <span>Subscription cancels on <strong>{formatPeriodEnd(subStatus.periodEnd)}</strong>. You keep access until then.</span>
          </div>
          <button className="up-plan-btn" style={{ width:'auto', padding:'8px 16px', background:'linear-gradient(135deg,var(--sky),var(--violet))', color:'#fff', fontSize:12 }}
            onClick={handleReactivate} disabled={cancelLoading}>
            {cancelLoading ? <span className="aka-spinner"/> : '↩️ Keep Subscription'}
          </button>
        </div>
      )}

      {/* Plan cards */}
      <div className="up-plans-grid">
        {plansArr.map(p => {
          const isCurrent = p.id === currentPlan;
          const isPopular = p.id === 'premium';
          const price     = billing==='yearly' ? p.yearlyPrice : p.price;

          return (
            <div key={p.id} className={`up-plan-card${isPopular?' featured':''}`}
              style={{ borderColor: isCurrent ? p.color : isPopular ? p.color : 'var(--border)' }}>
              {isPopular && <div className="up-popular-badge">⭐ Most Popular</div>}
              {isCurrent && <div className="up-current-badge" style={{ background:p.color }}>Your Plan</div>}

              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:32, marginBottom:6 }}>{p.emoji}</div>
                <div style={{ fontWeight:900, fontSize:18, marginBottom:4 }}>{p.name}</div>
                <div style={{ fontSize:13, color:'var(--text2)', marginBottom:12 }}>{p.tagline}</div>
                <div className="up-price-row">
                  {price===0 ? <span className="up-price-big">Free</span> : (
                    <><span className="up-price-big" style={{ color:p.color }}>${price.toFixed(2)}</span>
                      <span className="up-price-sub">/ month{billing==='yearly'?' · billed yearly':''}</span></>
                  )}
                </div>
                {billing==='yearly'&&price>0&&(
                  <div style={{ fontSize:11, color:p.color, fontWeight:700, marginTop:3 }}>
                    Save ${((p.price-p.yearlyPrice)*12).toFixed(0)}/year
                  </div>
                )}
              </div>

              <button
                className={`up-plan-btn${isCurrent?' current':''}`}
                style={{ background:isCurrent?'var(--border)':p.gradient, color:isCurrent?'var(--text2)':'#fff' }}
                onClick={() => !isCurrent && handleUpgrade(p.id)}
                disabled={isCurrent || loading!==null || portalLoading}
              >
                {loading===p.id ? <span className="aka-spinner"/> : isCurrent ? '✓ Current Plan' : p.cta}
              </button>

              {p.id!=='free' && <div style={{ fontSize:11, color:'var(--text2)', textAlign:'center', marginTop:6 }}>7-day free trial · Cancel anytime</div>}

              <div className="up-features">
                {p.features.map((f,i) => (
                  <div key={i} className={`up-feat-row${f.highlight?' highlight':''}`}>
                    <span style={{ color:f.included?p.color:'var(--border)', fontSize:14, fontWeight:900, flexShrink:0 }}>{f.included?'✓':'✗'}</span>
                    <span style={{ color:f.included?'var(--text)':'var(--text2)', fontWeight:f.highlight?700:400, fontSize:12 }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current plan management */}
      {currentPlan !== 'free' && (
        <div style={{ background:'var(--card)', borderRadius:18, border:'1.5px solid var(--border)', padding:22, marginBottom:18 }}>
          <div style={{ fontWeight:800, fontSize:15, marginBottom:14 }}>⚙️ Manage Your Subscription</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <button className="up-manage-btn" onClick={handlePortal} disabled={portalLoading || !STRIPE_CONFIGURED}>
              {portalLoading ? <span className="aka-spinner" style={{ borderTopColor:'var(--sky)', borderColor:'var(--border)', width:14, height:14 }}/> : '💳 Update Payment Method'}
            </button>
            <button className="up-manage-btn" onClick={handlePortal} disabled={portalLoading || !STRIPE_CONFIGURED}>
              📄 View Billing History
            </button>
            {!subStatus?.cancelAtPeriodEnd && (
              <button className="up-manage-btn danger" onClick={handleCancel} disabled={cancelLoading || !STRIPE_CONFIGURED}>
                {cancelLoading ? <span className="aka-spinner" style={{ borderTopColor:'var(--coral)', borderColor:'var(--border)', width:14, height:14 }}/> : '❌ Cancel Subscription'}
              </button>
            )}
          </div>
          {!STRIPE_CONFIGURED && (
            <div style={{ fontSize:11, color:'var(--text2)', marginTop:10 }}>
              Billing management requires Stripe configuration. See .env.example.
            </div>
          )}
          {subStatus?.periodEnd && !subStatus.cancelAtPeriodEnd && (
            <div style={{ fontSize:12, color:'var(--text2)', marginTop:10 }}>
              Next billing: <strong>{formatPeriodEnd(subStatus.periodEnd)}</strong>
            </div>
          )}
        </div>
      )}

      {/* Comparison table */}
      <div style={{ background:'var(--card)', borderRadius:20, border:'1.5px solid var(--border)', overflow:'hidden', marginBottom:20 }}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--border)', fontWeight:800, fontSize:15 }}>📊 Full Feature Comparison</div>
        <ComparisonTable currentPlan={currentPlan}/>
      </div>

      {/* Trust signals */}
      <div className="up-trust-row">
        {[
          STRIPE_CONFIGURED ? '🔒 Secure payments via Stripe' : '🔒 Stripe-ready payment system',
          '✅ Cancel anytime — no penalties',
          '👨‍👩‍👧 Safe for children aged 9-15',
          '📧 Email receipt after purchase',
        ].map(t => <div key={t} className="up-trust-item">{t}</div>)}
      </div>

      <FAQSection />

      {/* Dev switcher */}
      {isDev && (
        <div className="up-dev-panel">
          <div style={{ fontWeight:800, fontSize:13, marginBottom:10 }}>🛠️ Dev Mode — Plan Switcher (hidden in production)</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:8 }}>
            {plansArr.map(p => (
              <button key={p.id} className={`up-dev-btn${currentPlan===p.id?' active':''}`}
                onClick={() => devSwitch(p.id)} disabled={devSwitching||currentPlan===p.id}>
                {p.badge} {p.name}
              </button>
            ))}
          </div>
          <div style={{ fontSize:11, color:'var(--text2)' }}>
            Stripe configured: <strong>{STRIPE_CONFIGURED?'✅ Yes':'❌ No — add STRIPE_SECRET_KEY to .env.local'}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Comparison table ──────────────────────────────────────────
const COMPARE = [
  {label:'Child profiles',        free:'1',         premium:'1',          family:'Up to 5'},
  {label:'AI Mentor/day',         free:'5 chats',   premium:'Unlimited',  family:'Unlimited'},
  {label:'Stories/month',         free:'5',         premium:'Unlimited',  family:'Unlimited'},
  {label:'Engineering Lab',       free:'🔒 Locked', premium:'✅ Full',    family:'✅ Full'},
  {label:'Space Explorer',        free:'🔒 Locked', premium:'✅ Full',    family:'✅ Full'},
  {label:'Achievement badges',    free:'20',        premium:'48 ✅',      family:'48 ✅'},
  {label:'Parent dashboard',      free:'Basic',     premium:'Advanced ✅',family:'Advanced ✅'},
  {label:'Weekly reports',        free:'✗',         premium:'✅',          family:'✅'},
  {label:'Monthly report (PDF)',  free:'✗',         premium:'✅',          family:'✅'},
  {label:'Family Missions',       free:'✗',         premium:'✗',          family:'✅'},
  {label:'Multiple children',     free:'✗',         premium:'✗',          family:'✅'},
  {label:'Email digests',         free:'✗',         premium:'✗',          family:'✅'},
];

function ComparisonTable({ currentPlan }: { currentPlan: Plan }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table className="up-compare-table">
        <thead><tr>
          <th>Feature</th>
          {[PLANS.free, PLANS.premium, PLANS.family].map(p => (
            <th key={p.id} style={{ color:currentPlan===p.id?p.color:'var(--text)' }}>
              {p.badge} {p.name}
              {currentPlan===p.id&&<div style={{fontSize:10,fontWeight:700,color:p.color}}>Your Plan</div>}
            </th>
          ))}
        </tr></thead>
        <tbody>
          {COMPARE.map(r=>(
            <tr key={r.label}>
              <td>{r.label}</td>
              <td className={r.free.includes('✅')?'td-yes':r.free.includes('🔒')||r.free==='✗'?'td-no':''}>{r.free}</td>
              <td className={r.premium.includes('✅')?'td-yes':r.premium==='✗'?'td-no':''}>{r.premium}</td>
              <td className={r.family.includes('✅')?'td-yes':r.family==='✗'?'td-no':''}>{r.family}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── FAQ ───────────────────────────────────────────────────────
const FAQS = [
  {q:'Can I cancel anytime?',a:'Yes — cancel with one click. No penalties, no questions asked. Your child keeps full access until the end of the billing period.'},
  {q:'Is there really a 7-day free trial?',a:'Yes! Both Premium and Family plans start with a full 7-day free trial. You are only charged if you do not cancel before the trial ends.'},
  {q:'How does payment work?',a:'Payments are processed securely by Stripe — the same platform used by Amazon and Shopify. We never see or store your card details.'},
  {q:'Can I switch between Premium and Family?',a:'Yes — upgrade or downgrade at any time. Prorated billing means you only pay for what you use.'},
  {q:'What happens to our data if we cancel?',a:'All progress, stories, and achievements are saved for 60 days after cancellation. You can export everything before leaving.'},
  {q:'Is the app safe for my child?',a:'All AI responses are filtered for child safety. No ads, no social features, no external links. COPPA compliant. We never collect personal data from children.'},
];

function FAQSection() {
  const [open, setOpen] = useState<number|null>(null);
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontWeight:800, fontSize:15, marginBottom:14 }}>❓ Frequently Asked Questions</div>
      {FAQS.map((f,i)=>(
        <div key={i} className="up-faq-item" onClick={()=>setOpen(open===i?null:i)}>
          <div className="up-faq-q"><span>{f.q}</span><span className="up-faq-icon">{open===i?'▲':'▼'}</span></div>
          {open===i&&<div className="up-faq-a">{f.a}</div>}
        </div>
      ))}
    </div>
  );
}
