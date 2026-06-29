import React, { useState, useEffect } from 'react'

/* ═══════════════════════════════════════════════════════════
   PULSE — Admin Dashboard
   ═══════════════════════════════════════════════════════════ */

/* ── Score helpers ── */
const scoreColor = (v) => v >= 80 ? '#059669' : v >= 60 ? '#0d9488' : v >= 40 ? '#ca8a04' : v >= 20 ? '#ea580c' : '#dc2626'
const scoreLabel = (v) => v >= 80 ? 'Excellent' : v >= 60 ? 'Good' : v >= 40 ? 'Average' : v >= 20 ? 'Poor' : 'Critical'
const distColors = { excellent: '#059669', good: '#0d9488', average: '#ca8a04', poor: '#ea580c', critical: '#dc2626' }
const pillarColors = { visibility: '#0d9488', trust: '#059669', performance: '#dc2626', conversion: '#7c3aed' }
const pillarLabels = { visibility: 'Visibility', trust: 'Trust', performance: 'Performance', conversion: 'Conversion' }

/* ── SVG Icon set (matches RankFixHome I component) ── */
const I = ({ n, s = 18, c = '' }) => {
  const m = {
    search: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10.5" cy="10.5" r="7.5"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>,
    check: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    dollar: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    activity: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    chart: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    shield: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    bot: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>,
    globe: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    spin: <svg className="animate-spin" width={s} height={s} viewBox="0 0 24 24" fill="none"><circle opacity=".25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/><path opacity=".75" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z"/></svg>,
    arrow: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  }
  return <span className={`inline-flex items-center justify-center ${c}`}>{m[n] || null}</span>
}

/* ── Deco Blob ── */
function DecoBlob({ className = '', size = 200, style = {} }) {
  return (
    <div className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size, height: size,
        background: 'radial-gradient(circle, rgba(13, 148, 136, 0.04) 0%, transparent 70%)',
        ...style
      }} />
  )
}

/* ── Stat Card ── */
function StatCard({ icon, label, value, sub, color = '#0d9488', delay = 0 }) {
  return (
    <div className="bg-white rounded-2xl p-5 animate-fadeUp flex items-start gap-3.5 transition-all duration-300 hover:shadow-md"
      style={{
        animationDelay: `${delay}ms`,
        border: '1px solid rgba(13, 148, 136, 0.06)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)'
      }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}10`, color }}>
        <I n={icon} s={17} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium mb-0.5" style={{ color: '#64748b' }}>{label}</div>
        <div className="text-xl font-bold tracking-tight" style={{ color: '#1e293b' }}>{value}</div>
        {sub && <div className="text-[10px] mt-0.5" style={{ color: '#cbd5e1' }}>{sub}</div>}
      </div>
    </div>
  )
}

/* ── Section Header ── */
function SectionTitle({ icon, title, subtitle }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        {icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(13, 148, 136, 0.06)', color: '#0d9488' }}>
            {icon}
          </div>
        )}
        <div>
          <h2 className="font-display text-xl font-normal tracking-tight" style={{ color: '#1e293b' }}>{title}</h2>
          {subtitle && <p className="text-[10px] mt-0.5 tracking-wide" style={{ color: '#64748b' }}>{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

/* ── Score Distribution Chart ── */
function DistributionChart({ dist }) {
  const keys = ['excellent', 'good', 'average', 'poor', 'critical']
  const total = keys.reduce((s, k) => s + (dist?.[k] || 0), 0) || 1
  const maxVal = Math.max(...keys.map(k => dist?.[k] || 0), 1)

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 animate-fadeUp"
      style={{
        border: '1px solid rgba(13, 148, 136, 0.06)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)'
      }}>
      <SectionTitle icon={<I n="chart" s={16} />} title="Score Distribution" subtitle={`${total} total scans`} />
      <div className="flex items-end gap-3 sm:gap-4 pt-2"
        style={{ height: 140 }}>
        {keys.map((k) => {
          const val = dist?.[k] || 0
          const pct = (val / total) * 100
          const barH = (val / maxVal) * 100
          return (
            <div key={k} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[10px] font-semibold tabular-nums" style={{ color: distColors[k] }}>{val}</span>
              <div className="w-full rounded-lg relative overflow-hidden transition-all duration-700 ease-out"
                style={{
                  height: `${Math.max(barH, 4)}%`,
                  background: `${distColors[k]}15`,
                  border: `1px solid ${distColors[k]}25`,
                  borderRadius: '6px 6px 2px 2px',
                }}>
                <div className="absolute inset-0 rounded-lg transition-all duration-700"
                  style={{
                    background: `linear-gradient(180deg, ${distColors[k]} 0%, ${distColors[k]}bb 100%)`,
                    opacity: 0.7,
                  }} />
              </div>
              <span className="text-[9px] font-medium uppercase tracking-wider text-center leading-tight"
                style={{ color: '#64748b' }}>{k}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Pillar Average Cards ── */
function PillarAverages({ pillars }) {
  const keys = ['visibility', 'trust', 'performance', 'conversion']
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 animate-fadeUp"
      style={{
        border: '1px solid rgba(13, 148, 136, 0.06)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)'
      }}>
      <SectionTitle icon={<I n="globe" s={16} />} title="Pillar Averages" subtitle="4-dimension breakdown" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {keys.map((k) => {
          const v = pillars?.[k] ?? 0
          const col = pillarColors[k]
          return (
            <div key={k} className="rounded-xl p-4 transition-all duration-200 hover:shadow-sm"
              style={{ background: `${col}04`, border: `1px solid ${col}10` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold tracking-tight" style={{ color: '#1e293b' }}>{pillarLabels[k]}</span>
                <span className="text-sm font-bold tabular-nums" style={{ color: col }}>{v}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: `${col}12` }}>
                <div className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.min(v, 100)}%`,
                    background: `linear-gradient(90deg, ${col} 0%, ${col}dd 100%)`,
                    boxShadow: `0 0 6px ${col}40`
                  }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Latest Scans Table ── */
function LatestScans({ scans = [] }) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 animate-fadeUp"
      style={{
        border: '1px solid rgba(13, 148, 136, 0.06)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)'
      }}>
      <SectionTitle icon={<I n="search" s={16} />} title="Latest Scans" subtitle={`${scans.length} recent`} />

      {scans.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm" style={{ color: '#cbd5e1' }}>No scans yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 sm:-mx-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(13, 148, 136, 0.06)' }}>
                <th className="px-5 sm:px-6 py-3 font-semibold uppercase tracking-wider text-[9px]" style={{ color: '#64748b' }}>Domain</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wider text-[9px]" style={{ color: '#64748b' }}>Score</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wider text-[9px] hidden sm:table-cell" style={{ color: '#64748b' }}>Pillars</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wider text-[9px]" style={{ color: '#64748b' }}>Paid</th>
                <th className="px-3 py-3 font-semibold uppercase tracking-wider text-[9px] hidden md:table-cell" style={{ color: '#64748b' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {scans.slice(0, 10).map((s, i) => {
                const p = s.pillars || {}
                return (
                  <tr key={s.task_id || i}
                    className="transition-colors duration-150"
                    style={{ borderBottom: '1px solid rgba(13, 148, 136, 0.04)' }}>
                    <td className="px-5 sm:px-6 py-3">
                      <span className="font-medium text-xs" style={{ color: '#1e293b' }}>{s.domain}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums"
                        style={{ color: scoreColor(s.score) }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: scoreColor(s.score) }} />
                        {s.score}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        {['visibility', 'trust', 'performance', 'conversion'].map((pk) => (
                          <span key={pk}
                            className="w-5 h-1.5 rounded-full"
                            style={{ background: p[pk] != null ? `${pillarColors[pk]}${p[pk] >= 50 ? 'bb' : '44'}` : '#f1f5f9' }}
                            title={`${pk}: ${p[pk] ?? '-'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {s.paid ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(5, 150, 105, 0.08)', color: '#059669' }}>
                          <I n="check" s={10} />
                          Paid
                        </span>
                      ) : (
                        <span className="text-[10px]" style={{ color: '#cbd5e1' }}>Free</span>
                      )}
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className="text-[10px]" style={{ color: '#64748b' }}>
                        {s.timestamp ? new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ── Score History SVG Line Chart ── */
function ScoreHistory({ history = [] }) {
  if (!history || history.length < 2) {
    return (
      <div className="bg-white rounded-2xl p-5 sm:p-6 animate-fadeUp"
        style={{
          border: '1px solid rgba(13, 148, 136, 0.06)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)'
        }}>
        <SectionTitle icon={<I n="activity" s={16} />} title="Score History" subtitle="Evolution over time" />
        <div className="flex items-center justify-center py-10">
          <p className="text-sm" style={{ color: '#cbd5e1' }}>Not enough data points yet</p>
        </div>
      </div>
    )
  }

  // Sort by timestamp
  const sorted = [...history].sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0))
  const values = sorted.map(h => h.score).filter(v => v != null)
  if (values.length < 2) {
    return (
      <div className="bg-white rounded-2xl p-5 sm:p-6 animate-fadeUp"
        style={{
          border: '1px solid rgba(13, 148, 136, 0.06)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)'
        }}>
        <SectionTitle icon={<I n="activity" s={16} />} title="Score History" subtitle="Evolution over time" />
        <div className="flex items-center justify-center py-10">
          <p className="text-sm" style={{ color: '#cbd5e1' }}>Not enough data points yet</p>
        </div>
      </div>
    )
  }

  const width = 600, height = 200
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const range = maxVal - minVal || 1

  const toX = (i) => padding.left + (i / (values.length - 1)) * chartW
  const toY = (v) => padding.top + chartH - ((v - minVal) / range) * chartH

  const dots = values.map((v, i) => ({ x: toX(i), y: toY(v), v, i }))

  // Build path
  const linePath = dots.map((d, i) => `${i === 0 ? 'M' : 'L'}${d.x.toFixed(1)},${d.y.toFixed(1)}`).join(' ')
  // Gradient fill area
  const areaPath = `${linePath} L${toX(values.length - 1)},${padding.top + chartH} L${toX(0)},${padding.top + chartH} Z`

  // Timestamps for x-axis labels (show first, middle, last)
  const labels = sorted.map(h => h.timestamp ? new Date(h.timestamp) : null)
  const labelPoints = []
  if (labels.length > 0) {
    const indices = [0]
    if (labels.length > 2) indices.push(Math.floor(labels.length / 2))
    if (labels.length > 1) indices.push(labels.length - 1)
    indices.forEach(i => {
      labelPoints.push({
        x: toX(i),
        label: labels[i] ? labels[i].toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
      })
    })
  }

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 animate-fadeUp"
      style={{
        border: '1px solid rgba(13, 148, 136, 0.06)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)'
      }}>
      <SectionTitle icon={<I n="activity" s={16} />} title="Score History" subtitle={`${values.length} data points`} />

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: 220 }}>
          <defs>
            <linearGradient id="scoreArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = padding.top + chartH - pct * chartH
            const val = (minVal + pct * range).toFixed(0)
            return (
              <g key={pct}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y}
                  stroke="rgba(13, 148, 136, 0.06)" strokeWidth="1" />
                <text x={padding.left - 6} y={y + 3} textAnchor="end" fontSize="9"
                  fill="#64748b" fontWeight="500">{val}</text>
              </g>
            )
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#scoreArea)" />

          {/* Line */}
          <path d={linePath} fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="animate-draw-line" style={{ strokeDasharray: 300, strokeDashoffset: 0 }} />

          {/* Dots */}
          {dots.map((d, i) => (
            <g key={i}>
              <circle cx={d.x} cy={d.y} r="3" fill="#0d9488" stroke="white" strokeWidth="1.5"
                className="transition-all duration-200 hover:r-5" />
              <text x={d.x} y={d.y - 8} textAnchor="middle" fontSize="8"
                fill="#64748b" fontWeight="600">{d.v}</text>
            </g>
          ))}

          {/* X-axis labels */}
          {labelPoints.map((lp, i) => (
            <text key={i} x={lp.x} y={height - 6} textAnchor="middle" fontSize="8"
              fill="#64748b">{lp.label}</text>
          ))}
        </svg>
      </div>
    </div>
  )
}

/* ── System Health Cards ── */
function SystemHealth({ system }) {
  if (!system) {
    return (
      <div className="bg-white rounded-2xl p-5 sm:p-6 animate-fadeUp"
        style={{
          border: '1px solid rgba(13, 148, 136, 0.06)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)'
        }}>
        <SectionTitle icon={<I n="shield" s={16} />} title="System Health" subtitle="Backend status" />
        <div className="text-center py-6">
          <p className="text-sm" style={{ color: '#cbd5e1' }}>System info unavailable</p>
        </div>
      </div>
    )
  }

  const items = [
    {
      icon: 'bot',
      label: 'Backend',
      value: 'Operational',
      status: 'ok',
      col: '#059669',
      detail: 'API responding'
    },
    {
      icon: 'shield',
      label: 'Stripe Mode',
      value: system.stripe_mode === 'live' ? 'Live' : 'Simulated',
      status: system.stripe_mode === 'live' ? 'ok' : 'warn',
      col: system.stripe_mode === 'live' ? '#059669' : '#0d9488',
      detail: system.stripe_mode === 'live' ? 'Production' : 'Test mode'
    },
    {
      icon: 'globe',
      label: 'Agents Active',
      value: `${system.agents_active ?? 0}`,
      status: 'ok',
      col: '#7c3aed',
      detail: 'Nemotron 3'
    },
    {
      icon: 'activity',
      label: 'Uptime',
      value: system.uptime_hours != null ? `${system.uptime_hours}h` : '-',
      status: 'ok',
      col: '#0d9488',
      detail: system.uptime_hours != null ? `~${(system.uptime_hours / 24).toFixed(1)}d` : '-'
    },
  ]

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 animate-fadeUp"
      style={{
        border: '1px solid rgba(13, 148, 136, 0.06)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)'
      }}>
      <SectionTitle icon={<I n="shield" s={16} />} title="System Health" subtitle="Backend status" />
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl p-3.5 transition-all duration-200"
            style={{ background: `${item.col}04`, border: `1px solid ${item.col}10` }}>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${item.col}10`, color: item.col }}>
                <I n={item.icon} s={14} />
              </div>
              <span className="text-[10px] font-medium tracking-wide" style={{ color: '#64748b' }}>{item.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'ok' ? 'animate-pulse-soft' : ''}`}
                style={{ background: item.col }} />
              <span className="text-sm font-bold tracking-tight" style={{ color: '#1e293b' }}>{item.value}</span>
            </div>
            <div className="text-[9px] mt-0.5" style={{ color: '#cbd5e1' }}>{item.detail}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN — Admin Dashboard Page
   ═══════════════════════════════════════════════════════════════ */
export default function AdminDashboardPage({ onNavigate }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/rankfix/admin-stats')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const scans = data?.scans
  const revenue = data?.revenue
  const system = data?.system

  return (
    <div className="min-h-screen antialiased relative" style={{ backgroundColor: '#f8fafc', color: '#1e293b' }}>
      {/* ─── Ambient decorative blobs ─── */}
      <DecoBlob className="hidden lg:block" size={280}
        style={{ top: '3%', right: '1%', opacity: 0.6 }} />
      <DecoBlob className="hidden lg:block" size={180}
        style={{ bottom: '15%', left: '3%', opacity: 0.4 }} />
      <DecoBlob className="hidden lg:block" size={140}
        style={{ top: '40%', left: '70%', opacity: 0.25 }} />

      {/* ═══ NAV ─ Glass navbar ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
          borderBottom: '1px solid rgba(13, 148, 136, 0.06)'
        }}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 no-underline select-none group">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none" className="flex-shrink-0">
              <circle cx="14" cy="14" r="2.5" fill="#0d9488">
                <animate attributeName="r" values="2.5;3.2;2.5" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <path d="M14 4.5A9.5 9.5 0 0 1 23.5 14" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" opacity="0.5">
                <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3.5s" repeatCount="indefinite" />
              </path>
              <path d="M14 2A12 12 0 0 1 26 14" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" opacity="0.25">
                <animate attributeName="opacity" values="0.25;0.1;0.25" dur="4.5s" repeatCount="indefinite" />
              </path>
              <line x1="14" y1="14" x2="27" y2="14" stroke="#0d9488" strokeWidth="0.7" opacity="0.3">
                <animateTransform attributeName="transform" type="rotate" from="0 14 14" to="360 14 14" dur="7s" repeatCount="indefinite" />
              </line>
            </svg>
          </a>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate?.('home')}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: '#64748b' }}
              onMouseEnter={e => e.currentTarget.style.color = '#0d9488'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
              <I n="arrow" s={13} />
              Back to site
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="pt-14 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8 sm:py-10">

          {/* ─── Header ─── */}
          <div className="flex items-center justify-between mb-8 animate-fadeUp">
            <div>
              <h1 className="font-display text-[2.6rem] sm:text-[3.2rem] leading-[1.0] tracking-[-0.035em]"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, color: '#1e293b' }}>
                Admin Dashboard
              </h1>
              <p className="text-xs mt-2" style={{ color: '#64748b' }}>Overview of all RankFix scans and system metrics</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-medium"
              style={{ background: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.12)', color: '#059669' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
              {system?.stripe_mode === 'live' ? 'Live' : 'System Online'}
            </div>
          </div>

          {/* ─── Loading State ─── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 animate-fadeIn">
              <I n="spin" s={28} c="text-[#0d9488] mb-4" />
              <p className="text-sm font-medium" style={{ color: '#64748b' }}>Loading dashboard data…</p>
            </div>
          )}

          {/* ─── Error State ─── */}
          {error && !loading && (
            <div className="max-w-md mx-auto mt-12 text-center animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(220, 38, 38, 0.06)', color: '#dc2626' }}>
                <I n="shield" s={22} />
              </div>
              <h2 className="font-display text-2xl mb-2" style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: '#1e293b' }}>
                Could not load dashboard
              </h2>
              <p className="text-xs mb-6" style={{ color: '#64748b' }}>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-amber px-5 py-2.5 text-sm rounded-xl font-semibold">
                Retry
              </button>
            </div>
          )}

          {/* ─── Dashboard Content ─── */}
          {!loading && !error && (
            <div className="space-y-6">

              {/* ── Row 1: Stats Cards ── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <StatCard icon="search" label="Total Scans" value={scans?.total ?? 0} color="#0d9488" delay={0} />
                <StatCard icon="globe" label="Unique Domains" value={scans?.unique_domains ?? 0} color="#059669" delay={50} />
                <StatCard icon="chart" label="Avg Score" value={scans?.avg_score != null ? scans.avg_score.toFixed(1) : '-'} color="#7c3aed" delay={100} />
                <StatCard icon="check" label="Paid Reports" value={scans?.paid ?? 0} color="#ca8a04" delay={150} />
                <StatCard icon="dollar" label="Est. Revenue" value={revenue?.total != null ? `$${revenue.total.toLocaleString()}` : '-'}
                  sub={revenue?.mrr != null ? `$${revenue.mrr}/mo MRR` : undefined} color="#059669" delay={200} />
              </div>

              {/* ── Row 2: Distribution + Pillars (2-col layout) ── */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  <DistributionChart dist={scans?.distribution} />
                </div>
                <div className="lg:col-span-2">
                  <PillarAverages pillars={scans?.pillar_averages} />
                </div>
              </div>

              {/* ── Row 3: Latest Scans + Score History ── */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  <LatestScans scans={scans?.latest || []} />
                </div>
                <div className="lg:col-span-2">
                  <ScoreHistory history={scans?.history || []} />
                </div>
              </div>

              {/* ── Row 4: System Health ── */}
              <SystemHealth system={system} />

              {/* ── Row 5: Budget & Ads Dashboard ── */}
              <BudgetAdsSection />

            </div>
          )}

          {/* ─── Footer ─── */}
          <footer className="pt-10 pb-4 text-center"
            style={{ borderTop: '1px solid rgba(13, 148, 136, 0.04)' }}>
            <p className="text-[9px] tracking-wide" style={{ color: '#cbd5e1' }}>
              RankFix Admin · Powered by Hermes Agent · Nemotron 3 · Stripe
            </p>
          </footer>

        </div>
      </main>
    </div>
  )

}

/* ── Budget & Ads Section ── */
function BudgetAdsSection() {
  const [budget, setBudget] = React.useState(null)
  const [campaigns, setCampaigns] = React.useState([])
  const [revenueEvents, setRevenueEvents] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [config, setConfig] = React.useState(null)
  const [showConfig, setShowConfig] = React.useState(false)
  const [redList, setRedList] = React.useState([])

  React.useEffect(() => {
    Promise.all([
      fetch('/api/rankfix/ad-budget').then(r => r.json()),
      fetch('/api/rankfix/ad-campaigns').then(r => r.json()),
      fetch('/api/rankfix/revenue-history').then(r => r.json()),
      fetch('/api/rankfix/ad-config').then(r => r.json()),
      fetch('/api/rankfix/red-list').then(r => r.json()),
    ]).then(([b, c, r, cfg, rl]) => {
      setBudget(b); setCampaigns(c.campaigns || [])
      setRevenueEvents(r.events || []); setConfig(cfg.config || {})
      setRedList(rl.red_list || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const fmt = (n) => typeof n === 'number' ? n.toFixed(2) : '0.00'
  if (loading) return React.createElement('div', {className:"p-8 text-center text-sm",style:{color:"#64748b"}}, 'Loading budget...')

  return React.createElement('div', {className:"space-y-4 pt-6",style:{borderTop:"1px solid rgba(13,148,136,0.04)"}},
    React.createElement('div', {className:"flex items-center justify-between"},
      React.createElement('h2', {className:"text-base font-semibold",style:{color:"#1e293b"}}, 'Budget & Ads'),
      React.createElement('button', {onClick:()=>setShowConfig(!showConfig),className:"text-[10px] px-2 py-1 rounded-lg",style:{background:"#f8fafc",color:"#1e293b",border:"1px solid rgba(13,148,136,0.12)"}}, showConfig ? 'Hide Config' : 'Config')
    ),
    showConfig && config && React.createElement('div', {className:"bg-white rounded-2xl p-4 text-xs grid grid-cols-4 gap-3",style:{border:"1px solid rgba(13,148,136,0.06)"}},
      [{l:"Revenue Share",v:`${(config.revenue_share*100).toFixed(0)}%`},{l:"Min Budget",v:`${config.min_budget}$`},{l:"Max/Campaign",v:`${(config.max_per_campaign*100).toFixed(0)}%`},{l:"Cooldown",v:`${config.cooldown_hours}h`}].map((x,i)=>
        React.createElement('div',{key:i},React.createElement('div',{style:{color:"#64748b"}},x.l),React.createElement('div',{className:"font-semibold mt-0.5",style:{color:"#1e293b"}},x.v))
      )
    ),
    React.createElement('div', {className:"grid grid-cols-4 gap-3"},
      [{l:"Revenue",v:`${fmt(budget?.total_revenue)}$`,c:"#059669"},{l:"Ad Pool",v:`${fmt(budget?.ad_pool)}$`,c:"#0d9488"},{l:"Spent",v:`${fmt(budget?.ad_spent)}$`,c:"#dc2626"},{l:"Available",v:`${fmt(budget?.ad_available)}$`,c:budget?.ad_available>=(config?.min_budget||50)?"#059669":"#ca8a04"}].map((x,i)=>
        React.createElement('div',{key:i,className:"bg-white rounded-2xl p-3",style:{border:"1px solid rgba(13,148,136,0.06)"}},
          React.createElement('div',{className:"text-[10px]",style:{color:"#64748b"}},x.l),
          React.createElement('div',{className:"text-base font-bold mt-0.5",style:{color:x.c}},x.v)
        )
      )
    ),
    React.createElement('div', {className:"rounded-2xl p-3 flex items-center gap-2 text-xs",style:{background:budget?.can_launch_campaign?"#f0fdf4":"#fef2f2",border:`1px solid ${budget?.can_launch_campaign?"rgba(5,150,105,0.15)":"rgba(220,38,38,0.1)"}`}},
      React.createElement('span',null,budget?.can_launch_campaign?"Ready":"Blocked",": ",budget?.reason)
    ),
    // Business Overview
    React.createElement('div', {className:"rounded-2xl p-4",style:{background:"rgba(5,150,105,0.03)",border:"1px solid rgba(5,150,105,0.1)"}},
      React.createElement('div',{className:"flex items-center gap-2 mb-3"},
        React.createElement('span',{className:"text-[10px] font-semibold uppercase tracking-wider",style:{color:"#059669"}},"Business Overview"),
        React.createElement('span',{className:"h-px flex-1",style:{background:"rgba(5,150,105,0.08)"}})
      ),
      React.createElement('div',{className:"grid grid-cols-2 sm:grid-cols-4 gap-3"},
        [{l:"Revenue",v:`${fmt(budget?.total_revenue)}$`,c:"#059669"},{l:"Ad Spend",v:`${fmt(budget?.ad_spent)}$`,c:"#dc2626"},{l:"Monthly Costs",v:"20$/mo",c:"#0d9488"},{l:"Profit",v:`${fmt(Math.max(0,(budget?.total_revenue||0)-(budget?.ad_spent||0)-17))}$`,c:"#059669"}].map((x,i)=>
          React.createElement('div',{key:i,className:"bg-white rounded-xl p-2.5"},
            React.createElement('div',{className:"text-[9px]",style:{color:"#64748b"}},x.l),
            React.createElement('div',{className:"text-sm font-bold mt-0.5",style:{color:x.c}},x.v)
          )
        )
      ),
      React.createElement('div',{className:"mt-2 text-xs text-center font-medium",style:{color:"#1e293b"}},
        "VPS 7$/mo + API cost 13$ · Profit = Revenue - Ad Spend - Costs"
      )
    ),
    React.createElement('div', {className:"bg-white rounded-2xl p-4",style:{border:"1px solid rgba(13,148,136,0.06)"}},
      React.createElement('h3',{className:"text-xs font-semibold mb-2",style:{color:"#1e293b"}},"Revenue History"),
      revenueEvents.length===0 ? React.createElement('p',{className:"text-[10px]",style:{color:"#64748b"}},"No revenue yet") :
        React.createElement('div',{className:"space-y-1 max-h-32 overflow-y-auto"},
          revenueEvents.map((e,i)=>React.createElement('div',{key:i,className:"flex justify-between text-[10px] py-1 px-2 rounded",style:{background:i%2===0?"#f8fafc":"transparent",color:"#64748b"}},
            React.createElement('span',{style:{color:"#059669"}},"+",e.amount,"$ (",e.source,")"),
            React.createElement('span',null,e.timestamp?.slice(0,16).replace("T"," "))
          ))
        )
    ),
    React.createElement('div', {className:"bg-white rounded-2xl p-4",style:{border:"1px solid rgba(13,148,136,0.06)"}},
      React.createElement('h3',{className:"text-xs font-semibold mb-2",style:{color:"#1e293b"}},"Campaigns (",campaigns.length,")"),
      campaigns.length===0 ? React.createElement('p',{className:"text-[10px]",style:{color:"#64748b"}},"No campaigns launched.") :
        React.createElement('div',{className:"space-y-2 max-h-48 overflow-y-auto"},
          campaigns.map((c,i)=>React.createElement('div',{key:i,className:"p-2.5 rounded-xl text-[10px]",style:{background:"#f8fafc"}},
            React.createElement('div',{className:"flex justify-between mb-1"},
              React.createElement('span',{style:{color:"#64748b"}},c.id),
              React.createElement('span',{className:"font-semibold",style:{color:"#1e293b"}},c.budget,"$")
            ),
            React.createElement('div',{style:{color:"#64748b"}},c.platform," | ",c.campaign_type," | ROI: ",c.estimated_roi||"?","$"),
            React.createElement('div',{className:"mt-1",style:{color:"#94a3b8"}},"Imp: ",(c.estimated_impressions||0).toLocaleString()," | Clicks: ",(c.estimated_clicks||0).toLocaleString()," | Conv: ",c.estimated_conversions||0)
          ))
        )
    )
  )
}
