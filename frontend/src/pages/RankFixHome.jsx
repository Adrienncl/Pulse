import React, { useState } from 'react'

/* ═══════════════════════════════════════════════════════════
   PULSE — Site Performance & Competitive Ranking
   ═══════════════════════════════════════════════════════════ */

const I = ({ n, s = 18, c = '' }) => {
  const m = {
    search: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10.5" cy="10.5" r="7.5"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>,
    check: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    spin: <svg className="animate-spin" width={s} height={s} viewBox="0 0 24 24" fill="none"><circle opacity=".25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/><path opacity=".75" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z"/></svg>,
    globe: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    bot: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>,
    shield: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    chart: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    arrow: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    zap: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    trophy: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 6 9 6 9z"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 18 9 18 9z"/><path d="M12 9v8"/><path d="M8 21h8"/><path d="M12 17a4 4 0 0 0 4-4H8a4 4 0 0 0 4 4z"/></svg>,
  }
  return <span className={`inline-flex items-center justify-center ${c}`}>{m[n] || null}</span>
}

const Logo = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className="flex-shrink-0">
    <circle cx="14" cy="14" r="2.5" fill="#0d9488">
      <animate attributeName="r" values="2.5;3.2;2.5" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <path d="M14 4.5A9.5 9.5 0 0 1 23.5 14" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" opacity="0.5">
      <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3.5s" repeatCount="indefinite" />
    </path>
  </svg>
)

const AGENTS = [
  { type: 'visibility',   label: 'Visibility Audit',       desc: 'Search & AI discoverability — structured data, metadata, sitemaps',  icon: 'globe',  color: '#0d9488' },
  { type: 'trust',        label: 'Trust & Security',        desc: 'SSL, privacy, legal pages, security headers, contact info',          icon: 'shield', color: '#059669' },
  { type: 'performance',  label: 'Performance Audit',       desc: 'Page speed, mobile experience, Core Web Vitals, assets',             icon: 'bot',    color: '#dc2626' },
  { type: 'conversion',   label: 'Conversion Audit',        desc: 'CTA visibility, forms, checkout, navigation, user journey',          icon: 'chart',  color: '#7c3aed' },
  { type: 'ranking',      label: 'Competitive Ranking',     desc: 'Industry benchmarks, competitive position, strengths & weaknesses',   icon: 'trophy', color: '#ea580c' },
]

export default function RankFixHome({ onNavigate, isLoggedIn, userEmail, userName, onOpenLogin, onLogout }) {
  const [url, setUrl] = useState('')

  const handleScan = (e) => {
    e.preventDefault()
    if (!url.trim()) return
    onNavigate('scan', { url: url.replace(/^https?:\/\//, '') })
  }

  return (
    <div className="min-h-screen antialiased relative" style={{ 
      backgroundColor: '#f8fafc', 
      color: '#1e293b',
      scrollBehavior: 'smooth',
    }}>
      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(16px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
      }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={18} />
            <span className="text-sm font-semibold tracking-tight" style={{ color: '#1e293b' }}>Pulse</span>
          </div>
          <div className="flex items-center gap-6 text-xs font-medium">
            <span className="hidden sm:inline hover:text-[#0d9488] transition-colors cursor-pointer"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              How it works
            </span>
            <span className="hidden sm:inline hover:text-[#0d9488] transition-colors cursor-pointer"
              onClick={() => document.getElementById('agents')?.scrollIntoView({ behavior: 'smooth' })}>
              Agents
            </span>
            <span className="hidden sm:inline hover:text-[#0d9488] transition-colors cursor-pointer"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              Pricing
            </span>
            {isLoggedIn ? (
              <>
                <span className="text-xs" style={{ color: '#64748b' }}>{userName}</span>
                <button onClick={onLogout}
                  className="flex items-center gap-1.5 hover:text-[#dc2626] transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <button onClick={onOpenLogin}
                className="flex items-center gap-1.5 hover:text-[#0d9488] transition-colors">
                Sign in
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="pt-28 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #0d9488 0%, transparent 50%), radial-gradient(circle at 75% 75%, #6366f1 0%, transparent 50%)' }} />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-medium mb-8 tracking-wider uppercase"
            style={{ background: 'rgba(13, 148, 136, 0.04)', border: '1px solid rgba(13, 148, 136, 0.08)', color: '#0d9488' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Powered by 5 Nemotron 3 AI Agents
          </div>

          <h1 className="font-display text-[3.2rem] sm:text-[4.5rem] lg:text-[5.5rem] leading-[0.95] tracking-[-0.04em] mb-6"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, color: '#1e293b' }}>
            Know exactly what<br />
            <span style={{ color: '#0d9488', fontStyle: 'italic' }}>your site needs.</span>
          </h1>

          <p className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#475569' }}>
            Five autonomous Hermes agents audit your visibility, trust, speed, and conversion — then Pulse ranks you against competitors and delivers a prioritized action plan.
          </p>

          <div className="flex items-center justify-center gap-8 mb-10">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#1e293b' }}>5</div>
              <div className="text-[10px] mt-0.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Hermes Agent</div>
            </div>
            <div className="w-px h-8" style={{ background: '#cbd5e1' }} />
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#1e293b' }}>~3m</div>
              <div className="text-[10px] mt-0.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Scan Time</div>
            </div>
          </div>

          <form onSubmit={handleScan} className="max-w-lg mx-auto">
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white transition-all duration-300 focus-within:shadow-lg hover:shadow-md"
              style={{ border: '1px solid rgba(0, 0, 0, 0.06)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)' }}>
              <div className="pl-4 flex items-center" style={{ color: '#94a3b8' }}>
                <I n="search" s={15} />
              </div>
              <input id="url" type="text" value={url} onChange={e => setUrl(e.target.value)}
                placeholder="yourwebsite.com"
                className="flex-1 bg-transparent border-none text-sm outline-none py-3 min-w-0"
                style={{ color: '#1e293b' }}
                required />
              <button type="submit"
                className="btn-amber px-6 py-3 text-sm rounded-xl font-semibold whitespace-nowrap flex items-center gap-2">
                <I n="zap" s={14} c="text-white" />
                Scan My Site
              </button>
            </div>
          </form>

          {/* Dashboard mockup preview */}
          <div className="mt-16 max-w-3xl mx-auto" style={{ animationDelay: '300ms' }}>
            <div className="rounded-2xl bg-white p-6 text-left"
              style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 20px 60px rgba(0,0,0,0.06)' }}>
              {/* Mock header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#e2e8f0' }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#e2e8f0' }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#e2e8f0' }} />
                </div>
                <div className="text-[9px] font-medium" style={{ color: '#94a3b8' }}>pulse.ai/results</div>
              </div>
              {/* Score gauge + bars */}
              <div className="flex items-center gap-8 mb-6">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg width="96" height="96" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                    <circle cx="48" cy="48" r="40" fill="none" stroke="#0d9488" strokeWidth="6"
                      strokeDasharray="251" strokeDashoffset="125" strokeLinecap="round"
                      transform="rotate(-90 48 48)" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold" style={{ color: '#0d9488' }}>—</span>
                    <span className="text-[7px] uppercase tracking-wider" style={{ color: '#94a3b8' }}>Score</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2.5">
                  {[
                    { label: 'Visibility', val: 0, color: '#e2e8f0' },
                    { label: 'Trust', val: 0, color: '#e2e8f0' },
                    { label: 'Performance', val: 0, color: '#e2e8f0' },
                    { label: 'Conversion', val: 0, color: '#e2e8f0' },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[9px] font-medium w-20 flex-shrink-0" style={{ color: '#475569' }}>{b.label}</span>
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: '#f1f5f9' }}>
                        <div className="h-full rounded-full" style={{ width: `${b.val}%`, background: b.color }} />
                      </div>
                      <span className="text-[9px] font-bold w-7 text-right" style={{ color: '#cbd5e1' }}>—</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Priority actions preview */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[9px]" style={{ color: '#475569' }}>
                  <span className="w-1 h-1 rounded-full" style={{ background: '#ea580c' }} />
                  Add H1 heading tag for search engine indexing
                </div>
                <div className="flex items-center gap-2 text-[9px]" style={{ color: '#475569' }}>
                  <span className="w-1 h-1 rounded-full" style={{ background: '#ea580c' }} />
                  Enable gzip compression on server
                </div>
                <div className="flex items-center gap-2 text-[9px]" style={{ color: '#475569' }}>
                  <span className="w-1 h-1 rounded-full" style={{ background: '#0d9488' }} />
                  Fix OG image URLs to absolute paths
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         HOW IT WORKS
         ═══════════════════════════════════════════════════════════ */}
      <section id="features" className="max-w-6xl mx-auto px-6 pb-24" style={{ scrollMarginTop: 80 }}>
        <div className="text-center mb-16">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: '#0d9488' }}>How it works</p>
          <h2 className="font-display text-[2.4rem] sm:text-[3rem] leading-[1.0] tracking-[-0.03em]"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, color: '#1e293b' }}>
            Your site, analyzed in{' '}
            <span style={{ color: '#0d9488', fontStyle: 'italic' }}>three steps.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { step: '01', title: 'Enter your URL', desc: 'Type your website address and click Scan. No account needed, no credit card.' },
            { step: '02', title: '5 agents analyze', desc: 'Five Nemotron 3-powered agents crawl your site in parallel, checking visibility, trust, performance, conversion, and competitive position.' },
            { step: '03', title: 'Get your action plan', desc: 'Receive a prioritized list of improvements with estimated revenue impact, competitive ranking, and step-by-step fix instructions.' },
          ].map(({ step, title, desc }, i) => (
            <div key={i} className="text-center" style={{ animationDelay: `${i * 120}ms` }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5 text-sm font-bold"
                style={{ background: 'rgba(13, 148, 136, 0.06)', color: '#0d9488' }}>
                {step}
              </div>
              <h3 className="text-base font-semibold mb-2" style={{ color: '#1e293b' }}>{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         AGENTS
         ═══════════════════════════════════════════════════════════ */}
      <section id="agents" className="max-w-6xl mx-auto px-6 pb-24" style={{ scrollMarginTop: 80 }}>
        <div className="text-center mb-16">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: '#0d9488' }}>The agents</p>
          <h2 className="font-display text-[2.4rem] sm:text-[3rem] leading-[1.0] tracking-[-0.03em]"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, color: '#1e293b' }}>
            Five dimensions.{' '}
            <span style={{ color: '#0d9488', fontStyle: 'italic' }}>One Pulse Score.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {AGENTS.map((a, i) => (
            <div key={a.type} className="rounded-2xl p-6 group transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                animationDelay: `${i * 80}ms`,
              }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: `${a.color}08` }}>
                <I n={a.icon} s={16} c={`text-[${a.color}]`} />
              </div>
              <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#1e293b' }}>{a.label}</h3>
              <p className="text-xs leading-relaxed mb-3" style={{ color: '#475569' }}>{a.desc}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ background: `${a.color}12`, color: a.color }}>
                  Hermes Agent
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         PRICING
         ═══════════════════════════════════════════════════════════ */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 pb-24" style={{ scrollMarginTop: 80 }}>
        <div className="text-center mb-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: '#0d9488' }}>Pricing</p>
          <h2 className="font-display text-[2rem] sm:text-[2.6rem] leading-[1.0] tracking-[-0.03em]"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, color: '#1e293b' }}>
            Start free.{' '}<span style={{ color: '#0d9488', fontStyle: 'italic' }}>Upgrade for the full Pulse report.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl p-6" style={{
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.04)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}>
            <div className="text-lg font-bold mb-1" style={{ color: '#1e293b' }}>Free</div>
            <div className="text-3xl font-bold mb-4" style={{ color: '#1e293b' }}>$0</div>
            <ul className="space-y-2 text-xs mb-6">
              <li className="flex items-center gap-2"><I n="check" s={12} c="text-emerald-500" /> Score + 5-dimension breakdown</li>
              <li className="flex items-center gap-2"><I n="check" s={12} c="text-emerald-500" /> Competitive ranking position</li>
              <li className="flex items-center gap-2"><I n="check" s={12} c="text-emerald-500" /> 6 prioritized improvements</li>
              <li className="flex items-center gap-2"><I n="check" s={12} c="text-emerald-500" /> Action plan with estimated impact</li>
            </ul>
            <button onClick={handleScan} className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(13, 148, 136, 0.06)', color: '#0d9488', border: '1px solid rgba(13, 148, 136, 0.1)' }}>
              Scan your site
            </button>
          </div>

          {/* Premium */}
          <div className="rounded-2xl p-6 relative" style={{
            background: '#ffffff',
            border: '1px solid rgba(13, 148, 136, 0.15)',
            boxShadow: '0 4px 24px rgba(13, 148, 136, 0.06)',
          }}>
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider"
              style={{ background: '#ea580c', color: '#ffffff' }}>Popular</div>
            <div className="text-lg font-bold mb-1 mt-1" style={{ color: '#1e293b' }}>Premium</div>
            <div className="text-3xl font-bold mb-4" style={{ color: '#1e293b' }}>$19</div>
            <ul className="space-y-2 text-xs mb-6">
              <li className="flex items-center gap-2"><I n="check" s={12} c="text-emerald-500" /> Everything in Free</li>
              <li className="flex items-center gap-2"><I n="check" s={12} c="text-emerald-500" /> Radar charts & agent detail cards</li>
              <li className="flex items-center gap-2"><I n="check" s={12} c="text-emerald-500" /> Actionable checklist with tracking</li>
              <li className="flex items-center gap-2"><I n="check" s={12} c="text-emerald-500" /> Score history & trends</li>
              <li className="flex items-center gap-2"><I n="check" s={12} c="text-emerald-500" /> PDF export & invoice</li>
            </ul>
            <button onClick={handleScan} className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all btn-amber">
              Get Full Report
            </button>
          </div>

          {/* Weekly */}
          <div className="rounded-2xl p-6" style={{
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.04)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}>
            <div className="text-lg font-bold mb-1" style={{ color: '#1e293b' }}>Weekly</div>
            <div className="text-3xl font-bold mb-4" style={{ color: '#1e293b' }}>$19<span className="text-sm font-normal" style={{ color: '#64748b' }}>/mo</span></div>
            <ul className="space-y-2 text-xs mb-6">
              <li className="flex items-center gap-2"><I n="check" s={12} c="text-emerald-500" /> Everything in Premium</li>
              <li className="flex items-center gap-2"><I n="check" s={12} c="text-emerald-500" /> Weekly auto-scans</li>
              <li className="flex items-center gap-2"><I n="check" s={12} c="text-emerald-500" /> Regression alerts by email</li>
              <li className="flex items-center gap-2"><I n="check" s={12} c="text-emerald-500" /> Score history dashboard</li>
              <li className="flex items-center gap-2"><I n="check" s={12} c="text-emerald-500" /> Priority support</li>
            </ul>
            <button onClick={handleScan} className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(13, 148, 136, 0.06)', color: '#0d9488', border: '1px solid rgba(13, 148, 136, 0.1)' }}>
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         FINAL CTA
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 pb-24" style={{ scrollMarginTop: 80 }}>
        <div className="rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.03) 0%, rgba(99, 102, 241, 0.02) 100%)', border: '1px solid rgba(13, 148, 136, 0.06)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: '#0d9488' }}>Get started</p>
          <h2 className="font-display text-[2rem] sm:text-[2.8rem] leading-[1.0] tracking-[-0.03em] mb-4"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, color: '#1e293b' }}>
            Get your <span style={{ color: '#0d9488', fontStyle: 'italic' }}>Pulse Score</span> in one click.<br />
          </h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: '#475569' }}>
            Five autonomous agents. No account needed.
          </p>
          <form onSubmit={handleScan} className="max-w-md mx-auto">
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white transition-all duration-300 focus-within:shadow-lg"
              style={{ border: '1px solid rgba(0, 0, 0, 0.06)' }}>
              <input type="text" value={url} onChange={e => setUrl(e.target.value)}
                placeholder="yourwebsite.com"
                className="flex-1 bg-transparent border-none text-sm outline-none py-3 px-4 min-w-0"
                style={{ color: '#1e293b' }}
                required />
              <button type="submit"
                className="btn-amber px-6 py-3 text-sm rounded-xl font-semibold whitespace-nowrap">
                Scan
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         FAQ
         ═══════════════════════════════════════════════════════════ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 pb-24" style={{ scrollMarginTop: 80 }}>
        <div className="text-center mb-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: '#0d9488' }}>FAQ</p>
          <h2 className="font-display text-[2rem] sm:text-[2.6rem] leading-[1.0] tracking-[-0.03em]"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, color: '#1e293b' }}>
            Questions?{' '}<span style={{ color: '#0d9488', fontStyle: 'italic' }}>We've got answers.</span>
          </h2>
        </div>
        <div className="space-y-3">
          {[
            { q: 'How does Pulse analyze my site?', a: 'Five autonomous Nemotron 3 AI agents crawl your site in parallel — each checking a different dimension: visibility, trust, performance, conversion, and competitive ranking. Results are compiled into a single Pulse Score with prioritized actions.' },
            { q: 'Do I need to create an account?', a: 'No. Enter your URL and click Scan. You get your Pulse Score and action plan instantly. Create an account only if you want to track score history or subscribe to weekly monitoring.' },
            { q: 'How long does a scan take?', a: 'Most scans complete in under 3 minutes. The five agents run in parallel, so even complex sites with hundreds of pages are analyzed quickly.' },
            { q: 'Is my data stored or shared?', a: 'Scan results are stored temporarily to generate your report. We do not share your data with third parties or use it for AI training. You can request deletion at any time.' },
            { q: 'What is the Pulse Score?', a: 'A 0-100 score combining visibility (30%), trust (25%), performance (25%), and conversion (20%). Scores above 70 are strong, 40-70 need attention, below 40 are critical.' },
          ].map((item, i) => (
            <details key={i} className="rounded-xl p-4 group" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.04)' }}>
              <summary className="text-sm font-semibold cursor-pointer list-none flex items-center justify-between" style={{ color: '#1e293b' }}>
                {item.q}
                <span className="text-[#0d9488] transition-transform group-open:rotate-45 text-lg leading-none">+</span>
              </summary>
              <p className="mt-3 text-xs leading-relaxed" style={{ color: '#475569' }}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="max-w-6xl mx-auto px-6 pb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Logo size={14} />
          <span className="text-[11px] font-medium" style={{ color: '#475569' }}>Pulse</span>
        </div>
        <p className="text-xs" style={{ color: '#64748b' }}>Pulse · Powered by Hermes Agent · Nemotron 3 · Stripe</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <a href="/privacy" target="_blank" className="text-xs underline underline-offset-2 hover:text-[#0d9488] transition-colors" style={{ color: '#64748b' }}>Privacy Policy</a>
          <span className="text-[10px]" style={{ color: '#64748b' }}>·</span>
          <a href="/contact" target="_blank" className="text-xs underline underline-offset-2 hover:text-[#0d9488] transition-colors" style={{ color: '#64748b' }}>Contact</a>
          <span className="text-[10px]" style={{ color: '#64748b' }}>·</span>
          <a href="/security" target="_blank" className="text-xs underline underline-offset-2 hover:text-[#0d9488] transition-colors" style={{ color: '#64748b' }}>Security</a>
        </div>
        <button onClick={() => onNavigate('admin')}
          className="mt-3 text-xs px-2.5 py-1 rounded-lg transition-all hover:opacity-70"
          style={{ background: 'rgba(13, 148, 136, 0.04)', color: '#64748b' }}>
          Admin
        </button>
      </footer>
    </div>
  )
}
