import React, { useState } from 'react'

/* ═══════════════════════════════════════════════════════════
   AI VISIBILITY AUDIT — Preview dashboard
   ═══════════════════════════════════════════════════════════ */

const scoreColor = (v) => v >= 70 ? '#059669' : v >= 40 ? '#d97706' : '#dc2626'
const scoreStatus = (v) => v >= 70 ? 'Strong' : v >= 40 ? 'Needs Attention' : 'Critical'
const scoreBg = (v) => v >= 70 ? 'rgba(5, 150, 105, 0.08)' : v >= 40 ? 'rgba(217, 119, 6, 0.08)' : 'rgba(220, 38, 38, 0.08)'

/* ── Mini gauge (72px) ── */
function MiniGauge({ v = 72, size = 72 }) {
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
    high: { dot: '#dc2626', bg: 'rgba(220, 38, 38, 0.04)', border: 'rgba(220, 38, 38, 0.08)', text: '#b91c1c' },
    medium: { dot: '#d97706', bg: 'rgba(217, 119, 6, 0.04)', border: 'rgba(217, 119, 6, 0.08)', text: '#b45309' },
    low: { dot: '#ca8a04', bg: 'rgba(202, 138, 4, 0.04)', border: 'rgba(202, 138, 4, 0.08)', text: '#854d0e' },
  }
  const c = colors[severity] || colors.high
  return (
    <div className="rounded-lg p-2.5" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <div className="flex items-start gap-2">
        <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: c.dot }} />
        <div className="min-w-0">
          <div className="text-xs font-medium" style={{ color: '#2d1f14' }}>{title}</div>
          <div className="text-[10px] mt-0.5 leading-relaxed" style={{ color: '#8a7a6c' }}>{impact}</div>
        </div>
      </div>
    </div>
  )
}

/* ── Dashboard preview ── */
function ScoreDashboard() {
  return (
    <div className="w-full max-w-sm mx-auto rounded-2xl bg-white" style={{
      boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
      border: '1px solid rgba(217, 119, 6, 0.06)'
    }}>
      <div className="p-5 pb-3">
        <div className="flex items-start gap-3.5">
          <MiniGauge v={72} />
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold tracking-tight" style={{ color: '#2d1f14' }}>Visibility Score</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-medium uppercase tracking-wider"
                style={{ background: 'rgba(5, 150, 105, 0.08)', color: '#059669' }}>
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse-soft" />
                live
              </span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: '#6b5a4e' }}>
              Your website performs well technically but lacks structured data and AI-search optimization.
            </p>
          </div>
        </div>
      </div>
      <div className="px-5 py-2">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#a69484' }}>Visibility Breakdown</span>
          <span className="h-px flex-1" style={{ background: 'rgba(217, 119, 6, 0.05)' }} />
        </div>
        <div className="space-y-3">
          {[
            { n: 'SEO Technical', v: 78 },
            { n: 'AI Search (GEO)', v: 52 },
            { n: 'Trust & Security', v: 63 },
            { n: 'Technical Health', v: 71 },
          ].map((o, i) => (
            <div key={i} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-medium tracking-tight" style={{ color: '#6b5a4e' }}>{o.n}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                  <span className="text-xs font-semibold tabular-nums" style={{ color: scoreColor(o.v) }}>{o.v}</span>
                  <span className="text-[8px] font-medium px-1 py-0.5 rounded" style={{
                    background: scoreBg(o.v), color: scoreColor(o.v)
                  }}>{scoreStatus(o.v)}</span>
                </div>
              </div>
              <div className="h-[3px] rounded-full overflow-hidden" style={{ background: '#efe6da' }}>
                <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{
                  width: `${o.v}%`,
                  backgroundColor: scoreColor(o.v),
                  transitionDelay: `${i * 120}ms`
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 pb-5 pt-3">
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#dc2626' }}>Critical Issues</span>
          <span className="h-px flex-1" style={{ background: 'rgba(220, 38, 38, 0.08)' }} />
        </div>
        <div className="space-y-1.5">
          <IssueCard severity="high" title="No structured data detected"
            impact="Reduced visibility in AI search engines." />
          <IssueCard severity="medium" title="Missing meta descriptions"
            impact="Lower CTR from Google Search results." />
          <IssueCard severity="low" title="Slow mobile Core Web Vitals"
            impact="Reduced ranking potential on mobile." />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════════════════════ */
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
    spin: <svg className="animate-spin" width={s} height={s} viewBox="0 0 24 24" fill="none"><circle opacity=".25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/><path opacity=".75" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z"/></svg>,
    globe: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    bot: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>,
    shield: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    chart: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    arrow: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  }
  return <span className={`inline-flex items-center justify-center ${c}`}>{m[n] || null}</span>
}

/* ═══════════════════════════════════════════════════════════
   MAIN — Landing page
   ═══════════════════════════════════════════════════════════ */
export default function RankFixHome({ onNavigate, isLoggedIn = false, userEmail = '', userName = '', onOpenLogin, onLogout }) {
  const [url, setUrl] = useState('')

  const handleScan = (e) => {
    e.preventDefault()
    if (!url.trim()) return
    const cleanUrl = url.startsWith('http') ? url.replace(/^https?:\/\//, '') : url
    onNavigate('scan', { url: cleanUrl })
  }

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: '#f5f0e8', color: '#2d1f14' }}>

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{
        background: 'rgba(245, 240, 232, 0.85)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        borderBottom: '1px solid rgba(217, 119, 6, 0.06)'
      }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 no-underline select-none">
            <Logo size={20} />
            <span className="text-sm font-semibold tracking-tight" style={{ color: '#2d1f14' }}>
              RankFix <span style={{ color: '#a69484' }}>Agent</span>
            </span>
          </a>
          <div className="flex items-center gap-3 sm:gap-6 text-xs" style={{ color: '#a69484' }}>
            <span className="hidden sm:inline hover:text-[#d97706] transition-colors cursor-default font-medium">How it works</span>
            <span className="hidden sm:inline hover:text-[#d97706] transition-colors cursor-default font-medium">Pricing</span>
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button onClick={() => onNavigate('client-dashboard')}
                  className="flex items-center gap-1.5 hover:text-[#d97706] transition-colors font-medium">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Dashboard
                </button>
                <button onClick={onLogout}
                  className="flex items-center gap-1.5 hover:text-[#dc2626] transition-colors opacity-60 hover:opacity-100">
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={onOpenLogin}
                className="flex items-center gap-1.5 hover:text-[#d97706] transition-colors font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-14 relative z-10">

        {/* ═══════════════════════════════════════════════════════
           HERO
           ═══════════════════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-6 pt-6 pb-14">
          <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">

            {/* Left */}
            <div className="flex-1 text-center lg:text-left animate-fadeUp max-w-xl lg:max-w-none">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-medium tracking-wide mb-7" style={{
                background: 'rgba(217, 119, 6, 0.05)',
                border: '1px solid rgba(217, 119, 6, 0.1)',
                color: '#d97706'
              }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
                Built for Google &amp; the next generation of AI search
              </div>

              <h1 className="text-[2.2rem] sm:text-[3.2rem] lg:text-[3.8rem] font-bold leading-[1.05] tracking-[-0.03em] mb-5">
                Make your site visible to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d97706] to-[#f59e0b]">Google</span>{' '}
                and{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d97706] to-[#f59e0b]">AI search</span>.
              </h1>

              <p className="text-sm sm:text-base max-w-lg mb-8 leading-relaxed lg:mx-0 mx-auto" style={{ color: '#8a7a6c' }}>
                Get an instant visibility score across SEO, AI search, trust signals, and technical issues — powered by NVIDIA Nemotron 3 autonomous agents.
              </p>

              {/* Scan form */}
              <form onSubmit={handleScan} className="max-w-xl mx-auto lg:mx-0">
                <div className="relative flex items-center gap-2 p-1.5 rounded-xl bg-white shadow-sm transition-shadow focus-within:shadow-md" style={{
                  border: '1px solid rgba(217, 119, 6, 0.1)'
                }}>
                  <div className="pl-3 flex items-center" style={{ color: '#d5c8bc' }}>
                    <I n="search" s={15} />
                  </div>
                  <input id="url" type="text" value={url} onChange={e => setUrl(e.target.value)}
                    placeholder="yourwebsite.com"
                    className="flex-1 bg-transparent border-none text-sm outline-none py-2.5 min-w-0 placeholder-[#d5c8bc]"
                    style={{ color: '#2d1f14' }}
                    required />
                  <button type="submit"
                    className="btn-amber px-5 py-2.5 text-sm rounded-lg flex items-center gap-2 whitespace-nowrap font-medium">
                    <I n="search" s={14} c="text-white" />
                    Scan My Site
                  </button>
                </div>
              </form>

              <div className="mt-5 text-xs flex items-center gap-4 lg:justify-start justify-center" style={{ color: '#a69484' }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                  <span><span className="font-medium" style={{ color: '#6b5a4e' }}>1,247+</span> sites analyzed</span>
                </span>
                <span style={{ color: '#d5c8bc' }}>·</span>
                <span>Trusted by founders</span>
              </div>
            </div>

            {/* Right: Score Dashboard preview */}
            <div className="flex-1 flex justify-center lg:justify-end w-full">
              <ScoreDashboard />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
           STATS ROW
           ═══════════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden bg-white/40 border" style={{ borderColor: 'rgba(217, 119, 6, 0.06)' }}>
            {[
              { n: '4', t: 'AI Agents', d: 'SEO · GEO · Trust · Scoring', col: '#d97706' },
              { n: '32', t: 'Checks per Scan', d: 'Meta, schema, CWV, SSL, mobile +', col: '#059669' },
              { n: '~60s', t: 'Scan Time', d: 'Parallel Nemotron 3 agents', col: '#dc2626' },
              { n: '$19', t: 'Full Report', d: 'Prioritized action plan', col: '#7c3aed' },
            ].map((o, i) => (
              <div key={i} className="bg-white/70 p-5 text-center hover:bg-white transition-all">
                <div className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: o.col }}>{o.n}</div>
                <div className="text-xs font-medium mb-0.5" style={{ color: '#2d1f14' }}>{o.t}</div>
                <div className="text-[10px]" style={{ color: '#a69484' }}>{o.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
           WHAT WE ANALYZE
           ═══════════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: '#a69484' }}>What we analyze</p>
            <p className="text-xl font-bold tracking-tight" style={{ color: '#2d1f14' }}>4 dimensions. 32 checks. 4 autonomous agents.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { t: 'Google Visibility', d: 'Meta tags, HTTPS, sitemap, indexation, and technical SEO that determines how Google ranks your pages.', icon: 'globe', col: '#d97706' },
              { t: 'AI Search Readiness', d: 'How your site appears in ChatGPT, Gemini, and more. Structured data, citations, and AI-ready content.', icon: 'bot', col: '#059669' },
              { t: 'Trust & Security', d: 'SSL, mobile readiness, safe browsing, and security signals that both Google and users rely on.', icon: 'shield', col: '#dc2626' },
            ].map((o, i) => (
              <div key={i} className="rounded-2xl bg-white border p-6 transition-all duration-200 hover:shadow-sm" style={{ borderColor: 'rgba(217, 119, 6, 0.06)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${o.col}08` }}>
                  <I n={o.icon} s={18} c={`text-[${o.col}]`} />
                </div>
                <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#2d1f14' }}>{o.t}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#a69484' }}>{o.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="pt-8 pb-8 text-center" style={{ borderTop: '1px solid rgba(217, 119, 6, 0.04)' }}>
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
