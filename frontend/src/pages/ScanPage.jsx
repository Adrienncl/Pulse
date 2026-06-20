import React, { useState, useEffect, useRef, useCallback } from 'react'

const API = '/api'

/* ═══════════════════════════════════════════════════════════
   AGENTS
   ═══════════════════════════════════════════════════════════ */
const AGENTS = [
  { type: 'seo',     label: 'SEO Technical Audit',   desc: 'Meta tags, schema, sitemap, indexation',      icon: 'globe',  color: '#d97706' },
  { type: 'geo',     label: 'AI Search (GEO)',        desc: 'ChatGPT, Gemini, Perplexity readiness',       icon: 'bot',    color: '#059669' },
  { type: 'trust',   label: 'Trust & Security',       desc: 'SSL, mobile, safe browsing, security',        icon: 'shield', color: '#dc2626' },
  { type: 'scoring', label: 'Nemotron Scoring',       desc: 'AI-powered score & prioritization',           icon: 'chart',  color: '#7c3aed' },
]

/* ── Icons ── */
const I = ({ n, s = 18, c = '' }) => {
  const m = {
    search: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10.5" cy="10.5" r="7.5"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>,
    globe: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    bot: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>,
    shield: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    chart: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    arrow: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    check: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    sparkles: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>,
  }
  return <span className={`inline-flex items-center justify-center ${c}`}>{m[n] || null}</span>
}

/* ═══════════════════════════════════════════════════════════
   AGENT CARD
   ═══════════════════════════════════════════════════════════ */
function AgentCard({ agent, status }) {
  const st = (status || 'waiting').toLowerCase()
  const isDone = st === 'completed' || st === 'done'
  const isRunning = st === 'running'
  const isError = st === 'error' || st === 'failed'

  const stateColor = isDone ? '#059669' : isError ? '#dc2626' : isRunning ? agent.color : '#d5c8bc'
  const stateLabel = isDone ? 'Completed' : isError ? 'Failed' : isRunning ? 'Running...' : 'Waiting'
  const bgRunning = isRunning ? `${agent.color}06` : 'transparent'
  const borderRunning = isRunning ? `${agent.color}18` : isDone ? '#05966918' : isError ? '#dc262618' : 'transparent'

  return (
    <div className="rounded-xl transition-all duration-500" style={{
      background: bgRunning,
      border: `1px solid ${borderRunning}`,
      opacity: isDone ? 1 : isRunning ? 1 : 0.55,
      transform: isRunning ? 'translateY(-1px)' : 'none',
    }}>
      <div className="flex items-center gap-3.5 px-4 py-3.5">
        {/* Status indicator */}
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          {isDone ? (
            <div className="w-6 h-6 rounded-full bg-emerald-500/12 flex items-center justify-center">
              <I n="check" s={12} c="text-emerald-500" />
            </div>
          ) : isError ? (
            <div className="w-6 h-6 rounded-full bg-red-500/12 flex items-center justify-center">
              <span className="text-red-500 text-xs font-bold">!</span>
            </div>
          ) : isRunning ? (
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke={agent.color} strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
            </svg>
          ) : (
            <div className="w-2 h-2 rounded-full" style={{ background: '#d5c8bc' }} />
          )}
        </div>

        {/* Agent info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate" style={{
              color: isDone ? '#059669' : isError ? '#dc2626' : isRunning ? '#2d1f14' : '#a69484'
            }}>
              {agent.label}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: stateColor }}>
              {stateLabel}
            </span>
            {isRunning && (
              <>
                <span style={{ color: '#d5c8bc', fontSize: 8 }}>·</span>
                <span className="text-[10px]" style={{ color: '#8a7a6c' }}>{agent.desc}</span>
              </>
            )}
            {isDone && (
              <>
                <span style={{ color: '#d5c8bc', fontSize: 8 }}>·</span>
                <span className="text-[10px]" style={{ color: '#8a7a6c' }}>{agent.desc}</span>
              </>
            )}
          </div>
        </div>

        {/* Agent icon */}
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{
          background: isDone ? '#05966908' : `${agent.color}08`,
          opacity: isDone ? 1 : 0.6,
        }}>
          <I n={agent.icon} s={14} c={`text-[${isDone ? '#059669' : agent.color}]`} />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   LOGO
   ═══════════════════════════════════════════════════════════ */
const Logo = ({ size = 20 }) => (
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

/* ═══════════════════════════════════════════════════════════
   SCAN PAGE
   ═══════════════════════════════════════════════════════════ */
export default function ScanPage({ url, onNavigate }) {
  const [agentStatuses, setAgentStatuses] = useState({})
  const [allDone, setAllDone] = useState(false)
  const [result, setResult] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [error, setError] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const iv = useRef(null)
  const elapsedIv = useRef(null)
  const timeoutRef = useRef(null)
  const startedAt = useRef(Date.now())

  const cleanUrl = url?.startsWith('http') ? url.replace(/^https?:\/\//, '') : url || ''

  /* ── Start scan on mount ── */
  useEffect(() => {
    if (!url) { setError('No URL provided'); return }

    const u = url.startsWith('http') ? url : `https://${url}`

    ;(async () => {
      try {
        const r = await fetch(`${API}/rankfix/kanban-scan`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: u })
        })
        const d = await r.json()
        if (!d.session_id) { setError('Failed to start scan'); return }

        setSessionId(d.session_id)
        startedAt.current = Date.now()

        // Start elapsed timer
        elapsedIv.current = setInterval(() => {
          setElapsed(Math.floor((Date.now() - startedAt.current) / 1000))
        }, 1000)

        // Poll status
        iv.current = setInterval(async () => {
          try {
            const s = await (await fetch(`${API}/rankfix/kanban-status/${d.session_id}`)).json()
            const updates = {}
            AGENTS.forEach(a => {
              const task = s.tasks?.find(t => t.type === a.type)
              updates[a.type] = task?.status || 'waiting'
            })
            setAgentStatuses(prev => ({ ...prev, ...updates }))

            if (s.all_done && s.result) {
              clearInterval(iv.current)
              clearInterval(elapsedIv.current)
              clearTimeout(timeoutRef.current)
              setAllDone(true)
              setResult(s.result)
            }
          } catch (e) { /* poll failed, retry */ }
        }, 3000)

        // 180s timeout → fallback
        timeoutRef.current = setTimeout(async () => {
          if (iv.current) clearInterval(iv.current)
          if (elapsedIv.current) clearInterval(elapsedIv.current)
          try {
            const r2 = await fetch(`${API}/rankfix/audit`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: u })
            })
            const d2 = await r2.json()
            if (!d2.task_id) { setError('Scan timed out'); return }
            setSessionId(d2.task_id)
            iv.current = setInterval(async () => {
              try {
                const s = await (await fetch(`${API}/rankfix/status/${d2.task_id}`)).json()
                if (s.status === 'completed') {
                  clearInterval(iv.current)
                  clearInterval(elapsedIv.current)
                  setAllDone(true)
                  setResult({ ...s, display_url: cleanUrl })
                } else if (s.status === 'error') {
                  setError(s.error || 'Audit failed')
                  clearInterval(iv.current)
                  clearInterval(elapsedIv.current)
                }
              } catch (e) { }
            }, 2000)
            setTimeout(() => {
              if (iv.current) { clearInterval(iv.current); clearInterval(elapsedIv.current); setError('Scan timed out') }
            }, 40000)
          } catch (e) { setError('Fallback failed'); clearInterval(elapsedIv.current) }
        }, 180000)

      } catch (e) { setError(e.message) }
    })()

    return () => {
      if (iv.current) clearInterval(iv.current)
      if (elapsedIv.current) clearInterval(elapsedIv.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [url])

  /* ── Auto-redirect when done ── */
  useEffect(() => {
    if (allDone && result) {
      const timer = setTimeout(() => {
        onNavigate('results', { result: { ...result, display_url: cleanUrl }, taskId: sessionId })
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [allDone, result])

  const goToResults = () => {
    onNavigate('results', { result: { ...result, display_url: cleanUrl }, taskId: sessionId })
  }

  const completedCount = Object.values(agentStatuses).filter(s => s === 'completed' || s === 'done').length
  const runningCount = Object.values(agentStatuses).filter(s => s === 'running').length

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: '#f5f0e8', color: '#2d1f14' }}>

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{
        background: 'rgba(245, 240, 232, 0.85)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        borderBottom: '1px solid rgba(217, 119, 6, 0.06)',
      }}>
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={18} />
            <span className="text-sm font-semibold tracking-tight" style={{ color: '#2d1f14' }}>
              RankFix <span style={{ color: '#a69484' }}>Agent</span>
            </span>
          </div>
          <button onClick={() => onNavigate('landing')}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors"
            style={{ color: '#a69484' }}
            onMouseOver={e => e.currentTarget.style.color = '#d97706'}
            onMouseOut={e => e.currentTarget.style.color = '#a69484'}>
            <I n="arrow" s={12} />
            New scan
          </button>
        </div>
      </nav>

      <main className="pt-20 pb-16 relative z-10">
        <div className="max-w-lg mx-auto px-6">

          {/* ═══ HEADER ═══ */}
          <div className="text-center mb-8 animate-fadeUp">
            {allDone ? (
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <I n="check" s={24} c="text-emerald-500" />
              </div>
            ) : error ? (
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-red-500 text-xl font-bold">!</span>
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4 animate-glow-amber">
                <I n="sparkles" s={20} c="text-amber-500" />
              </div>
            )}

            <h1 className="text-xl font-bold tracking-tight mb-1" style={{ color: '#2d1f14' }}>
              {allDone ? 'Scan complete!' : error ? 'Scan failed' : 'Scanning your site'}
            </h1>

            {/* URL badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide mt-1" style={{
              background: 'rgba(217, 119, 6, 0.05)',
              border: '1px solid rgba(217, 119, 6, 0.1)',
              color: '#8a7a6c',
              maxWidth: '100%',
            }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{
                background: allDone ? '#059669' : error ? '#dc2626' : '#d97706',
              }} />
              <span className="truncate">{cleanUrl}</span>
            </div>

            {/* Progress stats */}
            {!allDone && !error && (
              <p className="text-xs mt-3" style={{ color: '#a69484' }}>
                {completedCount > 0 && `${completedCount}/4 completed · `}
                {runningCount > 0 && `${runningCount} running · `}
                {elapsed}s elapsed
              </p>
            )}

            {allDone && result?.score !== undefined && (
              <div className="mt-4 animate-countUp">
                <span className="text-4xl font-bold tracking-tight" style={{
                  color: result.score >= 70 ? '#059669' : result.score >= 40 ? '#d97706' : '#dc2626',
                }}>
                  {result.score}
                </span>
                <span className="text-lg font-medium ml-1" style={{ color: '#a69484' }}>/100</span>
              </div>
            )}
          </div>

          {/* ═══ AGENTS ═══ */}
          <div className="space-y-2.5 mb-8">
            {AGENTS.map(agent => (
              <div key={agent.type} className="animate-fadeUp" style={{ animationDelay: `${AGENTS.indexOf(agent) * 60}ms` }}>
                <AgentCard agent={agent} status={agentStatuses[agent.type]} />
              </div>
            ))}
          </div>

          {/* ═══ STATUS / ERROR / CTA ═══ */}
          <div className="text-center">

            {error && (
              <div className="rounded-xl p-4 mb-4" style={{
                background: 'rgba(220, 38, 38, 0.04)',
                border: '1px solid rgba(220, 38, 38, 0.1)',
                color: '#dc2626',
              }}>
                <p className="text-sm font-medium mb-1">Something went wrong</p>
                <p className="text-xs">{error}</p>
                <button onClick={() => onNavigate('landing')}
                  className="mt-3 text-xs font-medium underline underline-offset-2"
                  style={{ color: '#dc2626' }}>
                  Try again
                </button>
              </div>
            )}

            {allDone && (
              <div className="space-y-3 animate-fadeUp">
                <p className="text-xs" style={{ color: '#a69484' }}>
                  Our AI agents have analyzed your site across all dimensions
                </p>
                <button onClick={goToResults}
                  className="btn-amber px-8 py-3 text-sm rounded-xl inline-flex items-center gap-2 font-semibold">
                  View Full Results
                  <I n="arrow" s={14} c="text-white" />
                </button>
              </div>
            )}

            {!allDone && !error && (
              <div className="flex flex-col items-center gap-3">
                {/* Pulse dots */}
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse-soft" style={{ animationDelay: '0s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse-soft" style={{ animationDelay: '0.3s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse-soft" style={{ animationDelay: '0.6s' }} />
                </div>
                <p className="text-[10px]" style={{ color: '#d5c8bc' }}>
                  Autonomous agents working in parallel · NVIDIA Nemotron 3
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="pt-8 pb-8 text-center" style={{ borderTop: '1px solid rgba(217, 119, 6, 0.04)' }}>
        <p className="text-[9px]" style={{ color: '#d5c8bc' }}>Powered by Hermes Agent · NVIDIA Nemotron 3 · Stripe</p>
      </footer>
    </div>
  )
}
