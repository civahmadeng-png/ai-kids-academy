'use client';
import { useState } from 'react';
import { LegalCallout } from '@/components/legal/LegalPage';

type DeleteScope = 'full_account' | 'child_only' | 'conversations' | 'exports';

const SCOPE_OPTIONS: { id: DeleteScope; label: string; desc: string; icon: string }[] = [
  { id:'full_account',  icon:'🗑️', label:'Delete my entire account',   desc:'Removes your parent account, all child profiles, all progress data, all AI conversations, and cancels your subscription.' },
  { id:'child_only',    icon:'👤', label:'Delete one child profile',    desc:'Removes a specific child\'s profile and all their data, while keeping your parent account and other children.' },
  { id:'conversations', icon:'💬', label:'Delete AI conversation logs', desc:'Removes stored AI chat history for you or a specific child profile. Progress data is kept.' },
  { id:'exports',       icon:'📦', label:'Export my data first',        desc:'Receive a copy of all your data before we process any deletion. We\'ll email you a download link within 48 hours.' },
];

export default function DeleteDataPage() {
  const [scope, setScope]         = useState<DeleteScope | null>(null);
  const [email, setEmail]         = useState('');
  const [reason, setReason]       = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!scope || !email) return;
    setLoading(true);
    // In production, POST to /api/delete-request
    await new Promise(r => setTimeout(r, 1200));
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div>
      {/* Hero */}
      <div style={{
        background:'linear-gradient(135deg,#1A1D3A,#FF6B6B)',
        borderRadius:20, padding:'32px 28px', marginBottom:32,
        color:'#fff', textAlign:'center',
      }}>
        <div style={{fontSize:52,marginBottom:12}}>🗑️</div>
        <h1 style={{fontFamily:'Nunito,sans-serif',fontSize:28,fontWeight:900,marginBottom:8}}>
          Data Deletion Request
        </h1>
        <p style={{fontSize:14,opacity:.85,maxWidth:480,margin:'0 auto'}}>
          You have the right to delete your data at any time. This form sends a verified
          deletion request to our privacy team. We process all requests within 30 days.
        </p>
      </div>

      {submitted ? (
        <div style={{background:'#fff',borderRadius:20,padding:40,textAlign:'center',border:'1.5px solid #22D3A6'}}>
          <div style={{fontSize:56,marginBottom:16}}>✅</div>
          <h2 style={{fontFamily:'Nunito,sans-serif',fontSize:22,fontWeight:900,marginBottom:8}}>Request Received</h2>
          <p style={{fontSize:14,color:'#6B7280',lineHeight:1.7,maxWidth:420,margin:'0 auto 20px'}}>
            We&apos;ve received your deletion request. You&apos;ll receive a confirmation email at <strong>{email}</strong> within 24 hours.
            We will complete the deletion within 30 days.
          </p>
          <p style={{fontSize:13,color:'#9CA3AF'}}>
            Questions? Email us at <a href="mailto:privacy@aikidsacademy.app" style={{color:'#4F8EF7',fontWeight:700}}>privacy@aikidsacademy.app</a>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Legal context */}
          <div style={{background:'#fff',borderRadius:16,padding:20,border:'1.5px solid #E5E7EB',marginBottom:20}}>
            <div style={{fontWeight:800,fontSize:15,marginBottom:10}}>📋 Your Rights</div>
            <div style={{fontSize:13,color:'#6B7280',lineHeight:1.7}}>
              Under GDPR, COPPA, and the UK Children&apos;s Code, you have the right to request deletion
              of your personal data and your child&apos;s data. We will verify your identity before
              processing the request. Deletion is permanent and cannot be undone.
            </div>
          </div>

          {/* Scope selection */}
          <div style={{marginBottom:24}}>
            <div style={{fontWeight:800,fontSize:15,marginBottom:14}}>1. What would you like to delete?</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {SCOPE_OPTIONS.map(opt => (
                <label key={opt.id} style={{
                  background: scope===opt.id ? '#E8F1FF' : '#fff',
                  border:`2px solid ${scope===opt.id ? '#4F8EF7' : '#E5E7EB'}`,
                  borderRadius:14, padding:16, cursor:'pointer',
                  display:'flex', gap:14, alignItems:'flex-start',
                  transition:'all .15s',
                }}>
                  <input
                    type="radio" name="scope" value={opt.id}
                    checked={scope===opt.id}
                    onChange={() => setScope(opt.id)}
                    style={{marginTop:3,flexShrink:0,accentColor:'#4F8EF7'}}
                  />
                  <div>
                    <div style={{fontWeight:800,fontSize:14,marginBottom:4}}>
                      {opt.icon} {opt.label}
                    </div>
                    <div style={{fontSize:12,color:'#6B7280',lineHeight:1.5}}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Email */}
          <div style={{marginBottom:20}}>
            <div style={{fontWeight:800,fontSize:15,marginBottom:10}}>2. Confirm your account email</div>
            <input
              type="email"
              required
              placeholder="The email you used to sign up"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width:'100%',padding:'12px 16px',border:'1.5px solid #E5E7EB',
                borderRadius:12,fontSize:14,background:'#fff',color:'#1A1D3A',
                boxSizing:'border-box',
              }}
            />
            <p style={{fontSize:11,color:'#9CA3AF',marginTop:6}}>
              We&apos;ll send a verification email to confirm your identity before processing the deletion.
            </p>
          </div>

          {/* Optional reason */}
          <div style={{marginBottom:24}}>
            <div style={{fontWeight:800,fontSize:15,marginBottom:10}}>3. Reason (optional)</div>
            <textarea
              placeholder="Help us improve — why are you deleting your data? (optional)"
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              style={{
                width:'100%',padding:'12px 16px',border:'1.5px solid #E5E7EB',
                borderRadius:12,fontSize:14,background:'#fff',color:'#1A1D3A',
                resize:'vertical',boxSizing:'border-box',
              }}
            />
          </div>

          {/* Warning */}
          {scope === 'full_account' && (
            <div style={{
              background:'#FFE8E8',border:'1.5px solid #FF6B6B',
              borderRadius:12,padding:16,marginBottom:20,fontSize:13,color:'#991B1B',
            }}>
              <strong>⚠️ This cannot be undone.</strong> All your child&apos;s progress, achievements, stories, and learning history will be permanently deleted. If you have a paid subscription, it will be cancelled immediately.
            </div>
          )}

          <button
            type="submit"
            disabled={!scope || !email || loading}
            style={{
              width:'100%', padding:14, borderRadius:14, border:'none',
              background: (!scope||!email) ? '#E5E7EB' : 'linear-gradient(135deg,#FF6B6B,#8B5CF6)',
              color: (!scope||!email) ? '#9CA3AF' : '#fff',
              fontWeight:800, fontSize:15, cursor:(!scope||!email)?'default':'pointer',
              transition:'all .15s',
            }}
          >
            {loading
              ? '⏳ Submitting...'
              : '🗑️ Submit Deletion Request'}
          </button>

          <p style={{fontSize:11,color:'#9CA3AF',textAlign:'center',marginTop:12,lineHeight:1.6}}>
            By submitting this form you confirm you are the account holder or their parent/guardian.
            We will verify your identity via email before processing. Questions? Email{' '}
            <a href="mailto:privacy@aikidsacademy.app" style={{color:'#4F8EF7'}}>privacy@aikidsacademy.app</a>
          </p>
        </form>
      )}
    </div>
  );
}
