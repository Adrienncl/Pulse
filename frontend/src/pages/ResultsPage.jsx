import React, { useState, useEffect } from 'react'

const API = '/api'

/* ═══════════════════════════════════════════════════════════
   SHARED DESIGN SYSTEM
   ═══════════════════════════════════════════════════════════ */

const scoreColor = (v) => v >= 70 ? '#059669' : v >= 40 ? '#d97706' : '#dc2626'
const scoreStatus = (v) => v >= 70 ? 'Strong' : v >= 40 ? 'Needs Attention' : 'Critical'
const scoreBg = (v) => v >= 70 ? 'rgba(5, 150, 105, 0.08)' : v >= 40 ? 'rgba(217, 119, 6, 0.08)' : 'rgba(220, 38, 38, 0.08)'

/* ── Gauge ── */
function Gauge({ v = 72, size = 96 }) {
  const sw = 6, r = (size - sw * 2) / 2, c = 2 * Math.PI * r, cx = size / 2, cy = size / 2
  const pct = Math.min(v, 100), col = scoreColor(v)
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8ddd0" strokeWidth={sw} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={sw}
          strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c}
          strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-bold tracking-tight" style={{ fontSize: size * 0.3, color: '#2d1f14', marginTop: 2 }}>{v}</span>
    </div>
  )
}

/* ── Issue card ── */
function IssueCard({ severity = 'high', title, impact }) {
  const colors = {
    high: { dot: '#dc2626', bg: 'rgba(220, 38, 38, 0.04)', border: 'rgba(220, 38, 38, 0.08)' },
    medium: { dot: '#d97706', bg: 'rgba(217, 119, 6, 0.04)', border: 'rgba(217, 119, 6, 0.08)' },
    low: { dot: '#ca8a04', bg: 'rgba(202, 138, 4, 0.04)', border: 'rgba(202, 138, 4, 0.08)' },
  }
  const c = colors[severity] || colors.high
  return (
    <div className="rounded-lg p-3" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <div className="flex items-start gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: c.dot }} />
        <div className="min-w-0">
          <div className="text-sm font-medium" style={{ color: '#2d1f14' }}>{title}</div>
          {impact && <div className="text-xs mt-1 leading-relaxed" style={{ color: '#8a7a6c' }}>{impact}</div>}
        </div>
      </div>
    </div>
  )
}

/* ── Logo ── */
const Logo = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className="flex-shrink-0">
    <circle cx="14" cy="14" r="2.5" fill="#d97706">
      <animate attributeName="r" values="2.5;3.2;2.5" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <path d="M14 4.5A9.5 9.5 0 0 1 23.5 14" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" opacity="0.5">
      <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3.5s" repeatCount="indefinite" />
    </path>
    <path d="M14 2A12 12 0 0 1 26 14" stroke="#d97706" strokeWidth="2" strokeLinecap="round" opacity="0.25">
      <animate attributeName="opacity" values="0.25;0.1;0.25" dur="4.5s" repeatCount="indefinite" />
    </path>
    <line x1="14" y1="14" x2="27" y2="14" stroke="#d97706" strokeWidth="0.7" opacity="0.3">
      <animateTransform attributeName="transform" type="rotate" from="0 14 14" to="360 14 14" dur="7s" repeatCount="indefinite" />
    </line>
  </svg>
)

const I = ({ n, s = 18, c = '' }) => {
  const m = {
    search: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10.5" cy="10.5" r="7.5"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>,
    check: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    alert: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    chart: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    card: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="5" width="22" height="14" rx="2" ry="2"/><line x1="1" y1="11" x2="23" y2="11"/></svg>,
    spin: <svg className="animate-spin" width={s} height={s} viewBox="0 0 24 24" fill="none"><circle opacity=".25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/><path opacity=".75" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z"/></svg>,
    arrow: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    sparkles: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>,
    x: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    lock: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  }
  return <span className={`inline-flex items-center justify-center ${c}`}>{m[n] || null}</span>
}

/* ═══════════════════════════════════════════════════════════
   STRIPE CHECKOUT MODAL — Simulated payment for demo
   ═══════════════════════════════════════════════════════════ */
function StripeCheckoutModal({ type, onClose, onComplete }) {
  const [step, setStep] = useState('form')       // form → processing → success
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
  const [expiry, setExpiry] = useState('12/28')
  const [cvc, setCvc] = useState('123')
  const [cardName, setCardName] = useState('')

  const isReport = type === 'report'
  const title = isReport ? 'Full Report — $19' : 'Weekly Monitoring — $19/mo'
  const desc = isReport
    ? 'One-time payment for the detailed action plan'
    : 'Recurring weekly scans, alerts & trends'

  const handlePay = () => {
    setTimeout(() => setStep('processing'), 300)
  }

  useEffect(() => {
    if (step === 'processing') {
      const t = setTimeout(() => {
        setStep('success')
      }, 2200)
      return () => clearTimeout(t)
    }
  }, [step])

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape' && step === 'form') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [step, onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(45, 31, 20, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={step === 'form' ? onClose : undefined}>

      <div className="w-full max-w-md rounded-2xl bg-white overflow-hidden animate-fadeUp"
        style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.15)' }}
        onClick={e => e.stopPropagation()}>

        {/* ═══ FORM STEP ═══ */}
        {step === 'form' && (
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#635bff] flex items-center justify-center">
                  <I n="sparkles" s={14} c="text-white" />
                </div>
                <span className="text-sm font-bold tracking-tight" style={{ color: '#635bff' }}>stripe</span>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg transition-colors"
                style={{ color: '#d5c8bc' }}
                onMouseOver={e => e.currentTarget.style.color = '#2d1f14'}
                onMouseOut={e => e.currentTarget.style.color = '#d5c8bc'}>
                <I n="x" s={16} />
              </button>
            </div>

            {/* Order summary */}
            <div className="rounded-xl p-4 mb-5" style={{ background: '#f5f0e8' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium" style={{ color: '#2d1f14' }}>{title}</span>
                <span className="text-sm font-bold" style={{ color: '#2d1f14' }}>${isReport ? '19.00' : '19.00/mo'}</span>
              </div>
              <p className="text-[11px]" style={{ color: '#8a7a6c' }}>{desc}</p>
            </div>

            {/* Card form */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#8a7a6c' }}>Card number</label>
                <input type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border outline-none transition-all"
                  style={{ borderColor: 'rgba(217, 119, 6, 0.12)', color: '#2d1f14' }}
                  onFocus={e => e.target.style.borderColor = '#d97706'}
                  onBlur={e => e.target.style.borderColor = 'rgba(217, 119, 6, 0.12)'}
                  placeholder="4242 4242 4242 4242" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#8a7a6c' }}>Expiry</label>
                  <input type="text" value={expiry} onChange={e => setExpiry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border outline-none transition-all"
                    style={{ borderColor: 'rgba(217, 119, 6, 0.12)', color: '#2d1f14' }}
                    onFocus={e => e.target.style.borderColor = '#d97706'}
                    onBlur={e => e.target.style.borderColor = 'rgba(217, 119, 6, 0.12)'}
                    placeholder="MM/YY" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#8a7a6c' }}>CVC</label>
                  <input type="text" value={cvc} onChange={e => setCvc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border outline-none transition-all"
                    style={{ borderColor: 'rgba(217, 119, 6, 0.12)', color: '#2d1f14' }}
                    onFocus={e => e.target.style.borderColor = '#d97706'}
                    onBlur={e => e.target.style.borderColor = 'rgba(217, 119, 6, 0.12)'}
                    placeholder="CVC" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#8a7a6c' }}>Name on card</label>
                <input type="text" value={cardName} onChange={e => setCardName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border outline-none transition-all"
                  style={{ borderColor: 'rgba(217, 119, 6, 0.12)', color: '#2d1f14' }}
                  onFocus={e => e.target.style.borderColor = '#d97706'}
                  onBlur={e => e.target.style.borderColor = 'rgba(217, 119, 6, 0.12)'}
                  placeholder="John Doe" />
              </div>
            </div>

            <button onClick={handlePay}
              className="w-full mt-5 py-3 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: '#635bff' }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}>
              Pay ${isReport ? '19.00' : '19.00/mo'}
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-3">
              <I n="lock" s={10} c="text-[#d5c8bc]" />
              <span className="text-[9px]" style={{ color: '#d5c8bc' }}>Secured by Stripe</span>
            </div>
          </div>
        )}

        {/* ═══ PROCESSING STEP ═══ */}
        {step === 'processing' && (
          <div className="p-8 sm:p-10 text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'rgba(99, 91, 255, 0.08)' }}>
              <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#635bff" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-1" style={{ color: '#2d1f14' }}>Processing payment</h3>
            <p className="text-sm" style={{ color: '#8a7a6c' }}>Please wait while we process your payment securely...</p>
            <div className="flex items-center justify-center gap-1 mt-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#635bff] animate-pulse-soft" style={{ animationDelay: '0s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#635bff] animate-pulse-soft" style={{ animationDelay: '0.3s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#635bff] animate-pulse-soft" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>
        )}

        {/* ═══ SUCCESS STEP ═══ */}
        {step === 'success' && (
          <div className="p-8 sm:p-10 text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'rgba(5, 150, 105, 0.08)' }}>
              <I n="check" s={28} c="text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold mb-1" style={{ color: '#2d1f14' }}>Payment successful!</h3>
            <p className="text-sm mb-6" style={{ color: '#8a7a6c' }}>
              {isReport
                ? 'Your Full Report has been unlocked. You now have access to the detailed action plan.'
                : 'Your Weekly Monitoring subscription is active. We\'ll scan your site every week.'}
            </p>
            <div className="rounded-xl p-4 mb-5 text-left text-xs" style={{ background: '#f5f0e8' }}>
              <div className="flex items-center justify-between mb-1">
                <span style={{ color: '#8a7a6c' }}>Amount</span>
                <span className="font-semibold" style={{ color: '#2d1f14' }}>${isReport ? '19.00' : '19.00/mo'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: '#8a7a6c' }}>Card</span>
                <span className="font-medium" style={{ color: '#2d1f14' }}>···· {cardNumber.slice(-4)}</span>
              </div>
            </div>
            <button onClick={onComplete}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: '#059669' }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}>
              {isReport ? 'View Full Report' : 'Go to Dashboard'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   RESULTSPAGE — AI Visibility Audit
   ═══════════════════════════════════════════════════════════ */

export default function ResultsPage({ result, taskId, onNavigate }) {
  const [checkout, setCheckout] = useState(null)   // { type: 'report'|'monitoring' }

  const sc = result?.score || 0

  // Extract pillars data
  const pillars = result?.pillars || {}
  const pillarEntries = Object.entries(pillars).slice(0, 4)

  // AI summary based on score
  const aiSummary = sc >= 80
    ? 'Your website is performing well across all visibility dimensions. Maintaining current optimizations and monitoring for regressions will keep you ahead of competitors.'
    : sc >= 50
      ? 'Your site has a solid technical foundation but needs improvement in AI search readiness. Adding structured data and optimizing for AI platforms will significantly boost visibility.'
      : 'Significant visibility gaps detected — particularly in AI search optimization and technical SEO. Addressing these issues will have a strong impact on your overall presence.'

  const openCheckout = (type) => setCheckout({ type })
  const closeCheckout = () => setCheckout(null)

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: '#f5f0e8', color: '#2d1f14' }}>

      {/* ═══ STRIPE CHECKOUT MODAL ═══ */}
      {checkout && (
        <StripeCheckoutModal
          type={checkout.type}
          onClose={closeCheckout}
          onComplete={() => { closeCheckout(); onNavigate('client-dashboard', { result, taskId }) }}
        />
      )}

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{
        background: 'rgba(245, 240, 232, 0.85)', backdropFilter: 'blur(20px) saturate(1.4)',
        borderBottom: '1px solid rgba(217, 119, 6, 0.06)'
      }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={20} />
            <span className="text-sm font-semibold tracking-tight" style={{ color: '#2d1f14' }}>
              RankFix <span style={{ color: '#a69484' }}>Agent</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('client-dashboard', { result, taskId })}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: '#a69484' }}
              onMouseOver={e => e.currentTarget.style.color = '#d97706'}
              onMouseOut={e => e.currentTarget.style.color = '#a69484'}>
              <I n="chart" s={12} />
              Dashboard
            </button>
            <button onClick={() => onNavigate('landing')}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: '#a69484' }}
              onMouseOver={e => e.currentTarget.style.color = '#d97706'}
              onMouseOut={e => e.currentTarget.style.color = '#a69484'}>
              <I n="arrow" s={12} />
              New scan
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-16 relative z-10">

        {/* ═══════════════════════════════════════════════════════
           SCORE + GAUGE + AI SUMMARY
           ═══════════════════════════════════════════════════════ */}
        <section className="max-w-4xl mx-auto px-6 mb-10 animate-fadeUp">
          <div className="rounded-2xl bg-white p-6 sm:p-8" style={{
            boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(217, 119, 6, 0.06)'
          }}>
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6">
              <Gauge v={sc} size={96} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h1 className="text-xl font-bold tracking-tight" style={{ color: '#2d1f14' }}>
                    Visibility Score: <span style={{ color: scoreColor(sc) }}>{sc}/100</span>
                  </h1>
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{
                    background: scoreBg(sc), color: scoreColor(sc)
                  }}>{scoreStatus(sc)}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#6b5a4e' }}>
                  {aiSummary}
                </p>
                {result?.estimated_impact?.visibility && (
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg text-[10px] font-medium" style={{
                    background: 'rgba(217, 119, 6, 0.06)', border: '1px solid rgba(217, 119, 6, 0.1)', color: '#d97706'
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                    Estimated impact: {result.estimated_impact.visibility}
                  </div>
                )}
              </div>
            </div>

            <div className="h-px mb-5" style={{ background: 'rgba(217, 119, 6, 0.06)' }} />

            {/* Visibility Breakdown — Vercel-style thin bars */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#a69484' }}>Visibility Breakdown</span>
                <span className="h-px flex-1" style={{ background: 'rgba(217, 119, 6, 0.05)' }} />
              </div>
              <div className="space-y-3">
                {pillarEntries.map(([k, v], i) => {
                  const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                  const val = v.score || 0
                  return (
                    <div key={k} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium tracking-tight" style={{ color: '#6b5a4e' }}>{label}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                          <span className="text-xs font-semibold tabular-nums" style={{ color: scoreColor(val) }}>{val}</span>
                          <span className="text-[8px] font-medium px-1 py-0.5 rounded" style={{
                            background: scoreBg(val), color: scoreColor(val)
                          }}>{scoreStatus(val)}</span>
                        </div>
                      </div>
                      <div className="h-[3px] rounded-full overflow-hidden" style={{ background: '#efe6da' }}>
                        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{
                          width: `${val}%`,
                          backgroundColor: scoreColor(val),
                          transitionDelay: `${i * 120}ms`
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {result?.display_url && (
              <div className="mt-6 pt-4 text-[10px] text-center sm:text-left" style={{ borderTop: '1px solid rgba(217, 119, 6, 0.04)', color: '#d5c8bc' }}>
                Scanned: <span style={{ color: '#a69484' }}>{result.display_url}</span>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
           ISSUES + ACTIONS
           ═══════════════════════════════════════════════════════ */}
        <section className="max-w-4xl mx-auto px-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {result?.top_issues?.length > 0 && (
              <div className="rounded-2xl bg-white p-6" style={{
                boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)',
                border: '1px solid rgba(217, 119, 6, 0.05)'
              }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#dc2626' }}>Issues Found</span>
                  <span className="h-px flex-1" style={{ background: 'rgba(220, 38, 38, 0.06)' }} />
                </div>
                <div className="space-y-2">
                  {result.top_issues.map((x, i) => {
                    const sev = i === 0 ? 'high' : i === 1 ? 'medium' : 'low'
                    return (
                      <IssueCard key={i} severity={sev} title={x}
                        impact={i === 0
                          ? 'Directly impacts your ranking in search engines and AI platforms.'
                          : i === 1
                            ? 'Affects click-through rates and user engagement.'
                            : 'May limit visibility in competitive search results.'} />
                    )
                  })}
                </div>
              </div>
            )}

            {result?.action_plan?.length > 0 && (
              <div className="rounded-2xl bg-white p-6" style={{
                boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)',
                border: '1px solid rgba(217, 119, 6, 0.05)'
              }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#d97706' }}>Priority Actions</span>
                  <span className="h-px flex-1" style={{ background: 'rgba(217, 119, 6, 0.06)' }} />
                </div>
                <div className="space-y-2">
                  {result.action_plan.slice(0, 6).map((a, i) => {
                    const ic = a.impact === 'high' ? '#dc2626' : a.impact === 'medium' ? '#d97706' : '#059669'
                    return (
                      <div key={i} className="p-3 rounded-lg text-sm" style={{
                        background: 'rgba(45, 31, 20, 0.02)',
                        borderLeft: `3px solid ${ic}`
                      }}>
                        <div className="font-medium mb-1" style={{ color: '#2d1f14' }}>
                          <span style={{ color: '#a69484' }} className="mr-1.5">{a.priority}.</span>
                          {a.action}
                        </div>
                        <div className="flex items-center gap-3 text-xs" style={{ color: '#a69484' }}>
                          <span>Impact: <span style={{ color: ic, fontWeight: 600 }}>{a.impact}</span></span>
                          <span>·</span>
                          <span>Effort: {a.effort === 'low' ? 'Quick fix' : a.effort === 'medium' ? 'Moderate' : 'Significant'}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
           STRIPE CTA — Opens simulated checkout modal
           ═══════════════════════════════════════════════════════ */}
        <section className="max-w-3xl mx-auto px-6 mb-10">
          <div className="rounded-2xl bg-white p-6 sm:p-8 text-center" style={{
            boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)',
            border: '1px solid rgba(217, 119, 6, 0.05)'
          }}>
            <h2 className="text-lg font-semibold tracking-tight mb-1" style={{ color: '#2d1f14' }}>Get the full roadmap</h2>
            <p className="text-sm mb-6" style={{ color: '#a69484' }}>
              Detailed action plan with step-by-step instructions to fix every issue — or set up weekly monitoring.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
              <button onClick={() => openCheckout('report')}
                className="btn-amber p-4 rounded-xl text-left transition-all">
                <div className="flex items-center gap-2 text-sm font-semibold mb-0.5 text-white">
                  <I n="card" s={16} c="text-white" />
                  Full Report — $19
                </div>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Detailed report + prioritized recommendations</p>
              </button>
              <button onClick={() => openCheckout('monitoring')}
                className="p-4 rounded-xl text-left border transition-all" style={{
                  background: '#ffffff', borderColor: 'rgba(217, 119, 6, 0.12)'
                }}>
                <div className="flex items-center gap-2 text-sm font-medium mb-0.5" style={{ color: '#2d1f14' }}>
                  <I n="chart" s={16} c="text-[#d97706]" />
                  Weekly Monitoring — $19/mo
                </div>
                <p className="text-xs" style={{ color: '#a69484' }}>Weekly scans + regression alerts + trends</p>
              </button>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="max-w-4xl mx-auto px-6 pt-8 text-center" style={{ borderTop: '1px solid rgba(217, 119, 6, 0.04)' }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Logo size={14} />
            <span className="text-[11px] font-medium" style={{ color: '#a69484' }}>RankFix Agent</span>
          </div>
          <p className="text-[9px]" style={{ color: '#d5c8bc' }}>Powered by Hermes Agent · NVIDIA Nemotron 3 · Stripe</p>
        </footer>
      </main>
    </div>
  )
}
