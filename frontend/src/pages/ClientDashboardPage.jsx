import React, { useState, useEffect, useRef } from 'react'

const API = '/api'

/* ═══════════════════════════════════════════════════════════
   DESIGN SYSTEM
   ═══════════════════════════════════════════════════════════ */

const scoreColor = (v) => v >= 70 ? '#059669' : v >= 40 ? '#d97706' : '#dc2626'
const scoreStatus = (v) => v >= 70 ? 'Strong' : v >= 40 ? 'Needs Attention' : 'Critical'

/* ── Gauge ── */
function Gauge({ v = 72, size = 80 }) {
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

/* ── Icons ── */
const I = ({ n, s = 18, c = '' }) => {
  const m = {
    search: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10.5" cy="10.5" r="7.5"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>,
    check: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    chart: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    card: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="5" width="22" height="14" rx="2"/><line x1="1" y1="11" x2="23" y2="11"/></svg>,
    spin: <svg className="animate-spin" width={s} height={s} viewBox="0 0 24 24" fill="none"><circle opacity=".25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/><path opacity=".75" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z"/></svg>,
    arrow: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    sparkles: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>,
    globe: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    history: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    bell: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  }
  return <span className={`inline-flex items-center justify-center ${c}`}>{m[n] || null}</span>
}

/* ── Logo ── */
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
  </svg>
)

/* ═══════════════════════════════════════════════════════════
   SCAN HISTORY CARD
   ═══════════════════════════════════════════════════════════ */

function ScanHistoryCard({ scan, isActive, onClick }) {
  const sc = scan?.score || 0
  return (
    <button onClick={onClick}
      className="w-full rounded-xl p-4 text-left transition-all duration-200"
      style={{
        background: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
        border: isActive ? '1px solid rgba(217, 119, 6, 0.15)' : '1px solid rgba(217, 119, 6, 0.04)',
        boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: sc >= 70 ? 'rgba(5, 150, 105, 0.08)' : sc >= 40 ? 'rgba(217, 119, 6, 0.08)' : 'rgba(220, 38, 38, 0.08)',
          }}>
          <I n="globe" s={16} c={`text-[${scoreColor(sc)}]`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate" style={{ color: '#2d1f14' }}>{scan.domain || 'Unknown'}</span>
            <span className="text-[10px] font-bold tabular-nums" style={{ color: scoreColor(sc) }}>{sc}/100</span>
            {scan.paid && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-medium uppercase tracking-wider"
                style={{ background: 'rgba(5, 150, 105, 0.08)', color: '#059669' }}>
                Pro
              </span>
            )}
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: '#a69484' }}>
            {scan.timestamp ? new Date(scan.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
          </div>
        </div>
        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{
          background: isActive ? 'rgba(217, 119, 6, 0.08)' : 'transparent',
        }}>
          <I n="arrow" s={10} c={`text-[${isActive ? '#d97706' : '#d5c8bc'}]`} />
        </div>
      </div>
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════
   CLIENT DASHBOARD
   ═══════════════════════════════════════════════════════════ */

export default function ClientDashboardPage({ onNavigate, initialResult, initialTaskId, isLoggedIn = false, userEmail = '', userName = '', onLogout }) {
  const [scans, setScans] = useState([])
  const [selectedScan, setSelectedScan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // overview | history | billing
  const [elapsed, setElapsed] = useState(0)
  const startedAt = useRef(Date.now())

  // Load scans on mount
  useEffect(() => {
    (async () => {
      try {
        // If we were just redirected from a scan, prepend it
        if (initialResult && initialTaskId) {
          const fresh = { ...initialResult, task_id: initialTaskId, timestamp: new Date().toISOString() }
          setSelectedScan(fresh)
          setScans(prev => [fresh, ...prev.filter(s => s.task_id !== initialTaskId)])
        }

        const r = await fetch(`${API}/rankfix/client-scans?limit=10`)
        const d = await r.json()
        if (d.scans?.length) {
          setScans(d.scans)
          if (!initialResult) setSelectedScan(prev => prev || d.scans[0])
        }
      } catch (e) { console.error('Failed to load scans', e) }
      setLoading(false)
      startedAt.current = Date.now()
      const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000)
      return () => clearInterval(iv)
    })()
  }, [initialResult, initialTaskId])

  // Load full scan data when selecting from history
  const loadFullScan = async (scan) => {
    if (scan === selectedScan) return
    try {
      const r = await fetch(`${API}/rankfix/status/${scan.task_id}`)
      const d = await r.json()
      setSelectedScan(d)
    } catch (e) {
      setSelectedScan(scan)
    }
  }

  const sc = selectedScan?.score || 0

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: '#f5f0e8', color: '#2d1f14' }}>

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
            {isLoggedIn && (
              <div className="flex items-center gap-2 text-xs" style={{ color: '#a69484' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{ background: 'rgba(217, 119, 6, 0.1)', color: '#d97706' }}>
                  {(userName || 'U')[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline">{userEmail}</span>
                <button onClick={onLogout}
                  className="hover:text-[#dc2626] transition-colors ml-1 opacity-60 hover:opacity-100">Logout</button>
              </div>
            )}
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(217, 119, 6, 0.06)',
                border: '1px solid rgba(217, 119, 6, 0.08)',
                color: '#a69484'
              }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Free Plan
            </span>
            <button onClick={() => onNavigate('landing')}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: '#a69484' }}
              onMouseOver={e => e.currentTarget.style.color = '#d97706'}
              onMouseOut={e => e.currentTarget.style.color = '#a69484'}>
              <I n="sparkles" s={12} />
              New Scan
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-16 relative z-10">
        <div className="max-w-5xl mx-auto px-6">

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <I n="spin" s={24} c="text-amber-500" />
            </div>
          ) : scans.length === 0 && !selectedScan ? (
            /* ═══ EMPTY STATE ═══ */
            <div className="text-center py-20 animate-fadeUp">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'rgba(217, 119, 6, 0.06)' }}>
                <I n="search" s={24} c="text-[#a69484]" />
              </div>
              <h2 className="text-lg font-semibold mb-1" style={{ color: '#2d1f14' }}>
                No scans yet
              </h2>
              <p className="text-sm mb-6" style={{ color: '#a69484' }}>
                Run your first AI visibility audit to see how your site performs
              </p>
              <button onClick={() => onNavigate('landing')}
                className="btn-amber px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
                <I n="sparkles" s={14} c="text-white" />
                Scan your site
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ═══ SIDEBAR — Scan History ═══ */}
              <div className="lg:col-span-1">
                <div className="rounded-2xl bg-white p-4" style={{
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(217, 119, 6, 0.05)'
                }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#a69484' }}>
                      <I n="history" s={12} />
                      Scan History
                    </h3>
                    <span className="text-[10px] font-medium" style={{ color: '#d5c8bc' }}>{scans.length}</span>
                  </div>
                  <div className="space-y-2">
                    {scans.map((scan, i) => (
                      <ScanHistoryCard
                        key={scan.task_id || i}
                        scan={scan}
                        isActive={selectedScan?.task_id === scan.task_id}
                        onClick={() => loadFullScan(scan)}
                      />
                    ))}
                  </div>
                  {scans.length === 0 && (
                    <div className="text-center py-6 text-xs" style={{ color: '#d5c8bc' }}>
                      No scans yet. Run one from the home page.
                    </div>
                  )}
                </div>

                {/* ═══ Subscription Card ═══ */}
                <div className="mt-4 rounded-2xl p-4" style={{
                  background: 'rgba(217, 119, 6, 0.04)',
                  border: '1px solid rgba(217, 119, 6, 0.08)'
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <I n="card" s={14} c="text-[#d97706]" />
                    <span className="text-xs font-semibold" style={{ color: '#2d1f14' }}>Plan</span>
                  </div>
                  <p className="text-[10px] mb-3" style={{ color: '#a69484' }}>
                    You're on the <strong style={{ color: '#2d1f14' }}>Free</strong> plan. Upgrade for weekly monitoring & full reports.
                  </p>
                  <button onClick={() => onNavigate('results')}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-all"
                    style={{ background: '#d97706' }}
                    onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                    Upgrade — $19/mo
                  </button>
                </div>
              </div>

              {/* ═══ MAIN — Active Scan Detail ═══ */}
              <div className="lg:col-span-2">
                {selectedScan ? (
                  <div className="space-y-5 animate-fadeUp">
                    {/* Score + Summary */}
                    <div className="rounded-2xl bg-white p-6 sm:p-7" style={{
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)',
                      border: '1px solid rgba(217, 119, 6, 0.05)'
                    }}>
                      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-5">
                        <Gauge v={sc} size={88} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-lg font-bold tracking-tight" style={{ color: '#2d1f14' }}>
                              {selectedScan.domain || 'Website'}
                            </h1>
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{
                              background: sc >= 70 ? 'rgba(5, 150, 105, 0.08)' : sc >= 40 ? 'rgba(217, 119, 6, 0.08)' : 'rgba(220, 38, 38, 0.08)',
                              color: scoreColor(sc)
                            }}>{scoreStatus(sc)}</span>
                            {selectedScan.paid && (
                              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                                style={{ background: 'rgba(5, 150, 105, 0.08)', color: '#059669' }}>
                                Paid Report
                              </span>
                            )}
                          </div>
                          <div className="text-xs leading-relaxed" style={{ color: '#6b5a4e' }}>
                            {selectedScan.estimated_impact?.visibility || 'AI visibility audit completed.'}
                          </div>
                          {selectedScan.timestamp && (
                            <div className="text-[10px] mt-2" style={{ color: '#d5c8bc' }}>
                              Scanned {new Date(selectedScan.timestamp).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mini breakdown bars */}
                      {selectedScan.pillars && (
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#a69484' }}>Breakdown</span>
                            <span className="h-px flex-1" style={{ background: 'rgba(217, 119, 6, 0.05)' }} />
                          </div>
                          {Object.entries(selectedScan.pillars).slice(0, 4).map(([k, v], i) => {
                            const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                            const val = v.score || 0
                            return (
                              <div key={k}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[11px] font-medium" style={{ color: '#6b5a4e' }}>{label}</span>
                                  <span className="text-[11px] font-semibold tabular-nums" style={{ color: scoreColor(val) }}>{val}</span>
                                </div>
                                <div className="h-[3px] rounded-full overflow-hidden" style={{ background: '#efe6da' }}>
                                  <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{
                                    width: `${val}%`,
                                    backgroundColor: scoreColor(val),
                                    transitionDelay: `${i * 100}ms`
                                  }} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Issues + Actions grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedScan.top_issues?.length > 0 && (
                        <div className="rounded-2xl bg-white p-5" style={{
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)',
                          border: '1px solid rgba(217, 119, 6, 0.04)'
                        }}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#dc2626' }}>Issues</span>
                            <span className="h-px flex-1" style={{ background: 'rgba(220, 38, 38, 0.06)' }} />
                          </div>
                          <div className="space-y-1.5">
                            {selectedScan.top_issues.map((x, i) => (
                              <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{
                                background: i === 0 ? 'rgba(220, 38, 38, 0.03)' : 'transparent'
                              }}>
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{
                                  background: i === 0 ? '#dc2626' : i === 1 ? '#d97706' : '#ca8a04'
                                }} />
                                <span className="text-[11px] leading-relaxed" style={{ color: '#6b5a4e' }}>{x}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedScan.action_plan?.length > 0 && (
                        <div className="rounded-2xl bg-white p-5" style={{
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)',
                          border: '1px solid rgba(217, 119, 6, 0.04)'
                        }}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#d97706' }}>Actions</span>
                            <span className="h-px flex-1" style={{ background: 'rgba(217, 119, 6, 0.06)' }} />
                          </div>
                          <div className="space-y-1.5">
                            {selectedScan.action_plan.slice(0, 4).map((a, i) => (
                              <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{
                                borderLeft: `2px solid ${a.impact === 'high' ? '#dc2626' : a.impact === 'medium' ? '#d97706' : '#059669'}`
                              }}>
                                <span className="text-[11px] leading-relaxed" style={{ color: '#6b5a4e' }}>{a.action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CTA — Full Report / Upgrade */}
                    {!selectedScan.paid && selectedScan.score !== undefined && (
                      <div className="rounded-2xl p-5 text-center" style={{
                        background: 'rgba(217, 119, 6, 0.04)',
                        border: '1px solid rgba(217, 119, 6, 0.08)'
                      }}>
                        <h3 className="text-sm font-semibold mb-1" style={{ color: '#2d1f14' }}>
                          Unlock the full report
                        </h3>
                        <p className="text-xs mb-4" style={{ color: '#a69484' }}>
                          Get step-by-step instructions, priority scoring + weekly monitoring
                        </p>
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => {
                            try {
                              fetch(`${API}/rankfix/checkout`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                body: `task_id=${selectedScan.task_id || ''}`
                              }).then(r => r.json()).then(d => {
                                if (d?.checkout?.url_checkout && d.checkout.url_checkout.includes('stripe.com')) {
                                  window.open(d.checkout.url_checkout, '_blank')
                                } else {
                                  window.open('https://checkout.stripe.com/c/pay/cs_test_a1LOHO9uKRTkeb7JRLDJxOG5NnwjqQ9Fc7PEMNNIX0A6RIrl48pV15dTbM#fidkdWxOYHwnPyd1blpxYHZxWjA0VFZxX0VfSUpVV2twNlRTY2dQa2xDY0ZxVExTaVNVVU5IZEdCbTxnZ2xNUGNBUVxLYGpxdXxUYm1GYTVkVTVXYExyRzJPVkJSNE88dVRMT2RuMExmUj1Od1FmdGtyMlxCcEVxaEBLdFZMNSUyNVFWTU9KPXNXSjU0UXwydFVNTycpJ2N3amhWYHdzYHcnP3F3cGApJ2lkfGpwcVF8dWAnPyd2bGtiaWBabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl', '_blank')
                                }
                              })
                            } catch (e) { console.error(e) }
                          }}
                            className="btn-amber px-6 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2">
                            <I n="card" s={12} c="text-white" />
                            Full Report — $19
                          </button>
                          <button onClick={() => {
                            try {
                              fetch(`${API}/rankfix/checkout`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                body: `task_id=${selectedScan.task_id || ''}`
                              }).then(r => r.json()).then(d => {
                                if (d?.checkout?.url_checkout && d.checkout.url_checkout.includes('stripe.com')) {
                                  window.open(d.checkout.url_checkout, '_blank')
                                } else {
                                  window.open('https://checkout.stripe.com/c/pay/cs_test_a1LOHO9uKRTkeb7JRLDJxOG5NnwjqQ9Fc7PEMNNIX0A6RIrl48pV15dTbM#fidkdWxOYHwnPyd1blpxYHZxWjA0VFZxX0VfSUpVV2twNlRTY2dQa2xDY0ZxVExTaVNVVU5IZEdCbTxnZ2xNUGNBUVxLYGpxdXxUYm1GYTVkVTVXYExyRzJPVkJSNE88dVRMT2RuMExmUj1Od1FmdGtyMlxCcEVxaEBLdFZMNSUyNVFWTU9KPXNXSjU0UXwydFVNTycpJ2N3amhWYHdzYHcnP3F3cGApJ2lkfGpwcVF8dWAnPyd2bGtiaWBabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl', '_blank')
                                }
                              })
                            } catch (e) { console.error(e) }
                          }}
                            className="px-6 py-2.5 rounded-xl text-xs font-semibold transition-all border"
                            style={{ borderColor: 'rgba(217, 119, 6, 0.12)', color: '#2d1f14' }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(217, 119, 6, 0.04)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                            Weekly Monitor — $19/mo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-sm" style={{ color: '#a69484' }}>
                    Select a scan from the history
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="pb-8 text-center">
        <p className="text-[9px]" style={{ color: '#d5c8bc' }}>RankFix Agent · Powered by Hermes Agent · NVIDIA Nemotron 3 · Stripe</p>
      </footer>
    </div>
  )
}
