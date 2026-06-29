import { useState, useEffect, useRef } from 'react'

const API = '/api'

/* ── Icons ── */
const icons = {
  email: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  support: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  accounting: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  overview: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
}

const workflowSteps = [
  { id: 'intake', label: 'Client Intake', icon: '📋', agent: 'Intake Agent', color: '#6366f1' },
  { id: 'template', label: 'Template Selection', icon: '🎨', agent: 'Template Agent', color: '#3b82f6' },
  { id: 'pricing', label: 'Pricing', icon: '💰', agent: 'Pricing Agent', color: '#10b981' },
  { id: 'payment', label: 'Stripe Payment', icon: '💳', agent: 'Stripe Agent', color: '#8b5cf6' },
  { id: 'invoice', label: 'Invoice Generation', icon: '🧾', agent: 'Invoice Agent', color: '#eab308' },
  { id: 'spend', label: 'Spend & Provisioning', icon: '📊', agent: 'Spend Agent', color: '#f97316' },
  { id: 'brand', label: 'Brand Direction', icon: '✨', agent: 'Brand Agent', color: '#ec4899' },
  { id: 'content', label: 'Content Generation', icon: '📝', agent: 'Content Agent', color: '#06b6d4' },
  { id: 'compose', label: 'Template Composition', icon: '🖼️', agent: 'Composer Agent', color: '#14b8a6' },
  { id: 'social', label: 'Social Assets', icon: '📱', agent: 'Social Agent', color: '#f43f5e' },
  { id: 'finance', label: 'Finance Summary', icon: '📈', agent: 'Finance Agent', color: '#22c55e' },
  { id: 'delivery', label: 'Delivery', icon: '📦', agent: 'Delivery Agent', color: '#f59e0b' },
]

/* ── Card wrapper ── */
function Card({ title, icon, children, className = '' }) {
  return (
    <div className={`bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
        {icon}<span>{title}</span>
      </h3>
      {children}
    </div>
  )
}

/* ── Tab button ── */
function Tab({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════
   LIVE DEMO SECTION — Real-time agent activity
   ═══════════════════════════════════════════════════════════ */
function LiveDemoSection({ stats }) {
  const [running, setRunning] = useState(false)
  const [taskId, setTaskId] = useState(null)
  const [status, setStatus] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [hermesTriggered, setHermesTriggered] = useState(false)
  const timerRef = useRef(null)
  const pollRef = useRef(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      clearInterval(pollRef.current)
    }
  }, [])

  const startDemo = async () => {
    try {
      // 1. Start the local workflow (for Dashboard tool calls display)
      const res = await fetch(`${API}/demo/start`, { method: 'POST' })
      const data = await res.json()
      setTaskId(data.task_id)
      setRunning(true)
      setStatus({ status: 'starting', current_step: 0, total_steps: 12, steps: [] })
      setElapsed(0)
      setHermesTriggered(false)

      // 2. Trigger Hermes via Dashboard API (creates a session on the Hermes Dashboard)
      fetch(`${API}/demo/trigger-hermes`, { method: 'POST' })
        .then(r => r.json())
        .then(d => {
          if (d.status === 'triggered') {
            setHermesTriggered(true)
          }
        })
        .catch(() => {})

      // Start elapsed timer
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 0.1)
      }, 100)

      // Poll status
      pollRef.current = setInterval(async () => {
        try {
          const sr = await fetch(`${API}/demo/status/${data.task_id}`)
          const sd = await sr.json()
          setStatus(sd)
          if (sd.status === 'completed' || sd.status === 'error') {
            clearInterval(pollRef.current)
            clearInterval(timerRef.current)
            setRunning(false)
          }
        } catch (e) {
          // ignore poll errors
        }
      }, 1200)
    } catch (e) {
      console.error('Failed to start demo:', e)
    }
  }

  const completedSteps = status?.steps || []
  const currentStep = status?.current_step || 0
  const isRunning = running || status?.status === 'running'
  const isDone = status?.status === 'completed'
  const isError = status?.status === 'error'
  const show = isRunning || isDone || isError

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = (secs % 60).toFixed(1)
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  return (
    <div className="bg-gray-900/40 border border-gray-800/60 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 flex items-center justify-center text-lg">
            🚀
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Live Agent Demo</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Zero Employee Studio OS</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {show && (
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
              <span>⏱ {formatTime(elapsed)}</span>
              {isRunning && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            </div>
          )}
          {!isRunning && !isDone && (
            <button
              onClick={startDemo}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold text-xs transition-all hover:shadow-lg hover:shadow-indigo-500/25"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Launch Full Demo
            </button>
          )}
          {isDone && (
            <button
              onClick={startDemo}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl font-bold text-xs text-emerald-400 transition-all"
            >
              ↻ Run Again
            </button>
          )}
        </div>
      </div>

      {!show && (
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-gray-500">
            Click <span className="text-indigo-400 font-medium">Launch Full Demo</span> to watch all 12 AI agents execute the complete client workflow live.
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-600">
            <span>🤖 16 AI Agents</span>
            <span>⚡ ~20s execution</span>
            <span>🧠 Nemotron 3 Ultra</span>
          </div>
          <div className="mt-6 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
            <p className="text-xs text-indigo-400 font-medium mb-2">📋 For the demo video — Split Screen :</p>
            <div className="flex items-center justify-center gap-6 text-[10px] text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs">1</div>
                <span>Ce Dashboard</span>
              </div>
              <div className="text-gray-700">+</div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xs">2</div>
                <span>Hermes Dashboard <code className="text-emerald-400">:9119</code></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {show && (
        <div className="p-6">
          {/* Pipeline progress bar */}
          <div className="flex items-center gap-1 mb-6">
            {workflowSteps.map((step, i) => {
              const stepIndex = i + 1
              const isStepDone = completedSteps.find(s => s.step === stepIndex)
              const isStepActive = currentStep === stepIndex
              return (
                <div key={step.id} className="flex-1 relative">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isStepDone ? 'opacity-100' : isStepActive ? 'opacity-90' : 'opacity-20'
                    }`}
                    style={{ backgroundColor: isStepDone || isStepActive ? step.color : '#374151' }}
                  />
                  {isStepActive && (
                    <div
                      className="absolute -top-1 left-0 h-4 rounded-full animate-pulse"
                      style={{ width: '100%', backgroundColor: step.color, opacity: 0.3 }}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Current agent banner */}
          {isRunning && currentStep > 0 && currentStep <= 12 && (
            <div
              className="relative rounded-xl p-4 mb-4 border overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${workflowSteps[currentStep - 1]?.color || '#6366f1'}18, transparent)`,
                borderColor: `${workflowSteps[currentStep - 1]?.color || '#6366f1'}40`,
              }}
            >
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl animate-bounce"
                  style={{ backgroundColor: `${workflowSteps[currentStep - 1]?.color || '#6366f1'}25` }}>
                  {workflowSteps[currentStep - 1]?.icon || '⚡'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{workflowSteps[currentStep - 1]?.agent || 'Agent'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 animate-pulse">
                      ● Active
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Executing step {currentStep}/12 — {workflowSteps[currentStep - 1]?.label || ''}</p>
                  {/* Progress shimmer */}
                  <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full animate-pulse"
                      style={{
                        width: `${(currentStep / 12) * 100}%`,
                        backgroundColor: workflowSteps[currentStep - 1]?.color || '#6366f1',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results summary when done */}
          {isDone && status?.result && (
            <div className="relative bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-purple-500/10 border border-emerald-500/20 rounded-xl p-5 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="text-sm font-bold text-white">Workflow Complete!</p>
                  <p className="text-xs text-gray-400">{status.result.client} — {formatTime(elapsed)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-900/60 rounded-xl border border-gray-800/50">
                  <p className="text-lg font-bold text-emerald-400">${status.result.revenue}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Revenue</p>
                </div>
                <div className="text-center p-3 bg-gray-900/60 rounded-xl border border-gray-800/50">
                  <p className="text-lg font-bold text-emerald-400">${status.result.profit}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Profit</p>
                </div>
                <div className="text-center p-3 bg-gray-900/60 rounded-xl border border-gray-800/50">
                  <p className="text-lg font-bold text-indigo-400">{status.result.margin}%</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Margin</p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4 text-sm text-red-400">
              ❌ Workflow failed: {status?.error || 'Unknown error'}
            </div>
          )}

          {/* Agent activity feed — shows tool calls in real-time */}
          <div className="bg-gray-950/80 border border-gray-800/50 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/80 border-b border-gray-800/50">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>
              <span className="ml-3 text-[10px] text-gray-500 font-mono">zes-agent-tool-calls.log</span>
              <div className="ml-auto flex items-center gap-2">
                <span className={`text-[10px] font-mono ${isDone ? 'text-emerald-400' : isRunning ? 'text-indigo-400' : 'text-gray-600'}`}>
                  {isDone ? 'DONE' : isRunning ? 'RUNNING...' : 'IDLE'}
                </span>
                {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
              </div>
            </div>
            <div className="p-3 font-mono text-[11px] max-h-[28rem] overflow-y-auto space-y-0.5">
              {/* Build log entries from steps + tool_calls */}
              {(() => {
                const toolCalls = status?.tool_calls || []
                const lines = []

                // For each completed step, show it as header then its tool calls
                completedSteps.forEach((s) => {
                  const meta = workflowSteps[s.step - 1] || {}
                  const extra = []
                  if (s.price) extra.push(`$${s.price}`)
                  if (s.amount) extra.push(`$${s.amount}`)
                  if (s.cost) extra.push(`cost $${s.cost}`)
                  if (s.profit) extra.push(`$${s.profit} profit`)
                  if (s.margin) extra.push(`${s.margin}% margin`)
                  if (s.invoice) extra.push(`#${s.invoice}`)
                  if (s.file_size) extra.push(`${s.file_size} KB`)

                  lines.push({ type: 'step', step: s.step, agent: s.agent, label: s.label, meta, extra })

                  // Show tool calls for this step
                  const stepTools = toolCalls.filter(t => t.step === s.step)
                  stepTools.forEach((t, ti) => {
                    lines.push({ type: 'tool', step: s.step, tool: t.tool, input: t.input, output: t.output, meta, nesting: 1 })
                  })
                })

                // For the current active step, show tools that aren't in a completed step
                if (isRunning && currentStep > 0) {
                  const pendingTools = toolCalls.filter(t => t.step === currentStep)
                  const currentToolsShown = pendingTools.slice(completedSteps.length > 0
                    ? toolCalls.filter(t => t.step < currentStep).length
                    : 0)
                  if (currentToolsShown.length > 0) {
                    currentToolsShown.forEach((t, ti) => {
                      const meta = workflowSteps[currentStep - 1] || {}
                      lines.push({ type: 'tool-active', step: currentStep, tool: t.tool, input: t.input, output: t.output, meta, nesting: 1 })
                    })
                  } else {
                    // No tool calls received yet for current step, show placeholder
                    const meta = workflowSteps[currentStep - 1] || {}
                    lines.push({ type: 'running', step: currentStep, label: workflowSteps[currentStep - 1]?.agent || 'Agent', meta })
                  }
                }

                return lines.map((line, i) => {
                  if (line.type === 'step') {
                    return (
                      <div key={i} className="flex items-start gap-2 pt-2 pb-0.5">
                        <span className="text-gray-700 w-12 flex-shrink-0 text-[10px]">[{((line.step - 1) * 1.8 + 0.5).toFixed(1)}s]</span>
                        <span style={{ color: line.meta.color }} className="flex-shrink-0 font-bold">✓</span>
                        <span className="text-gray-300 flex-shrink-0 min-w-[95px] text-[11px] font-semibold">{line.agent}</span>
                        <span className="text-gray-500 text-[11px] truncate">{line.label}</span>
                        {line.extra.length > 0 && <span className="text-emerald-500/80 text-[10px] ml-auto flex-shrink-0">{line.extra.join(' · ')}</span>}
                      </div>
                    )
                  }
                  if (line.type === 'tool') {
                    return (
                      <div key={i} className="flex items-start gap-2 pl-14 text-[10px] opacity-80 hover:opacity-100 transition-opacity">
                        <span className="text-gray-600 flex-shrink-0 w-4">└</span>
                        <span className="text-gray-500 flex-shrink-0 truncate max-w-[170px]" title={line.tool}>{line.tool}</span>
                        <span className="text-gray-700/60 flex-shrink-0">→</span>
                        <span className="text-gray-600 truncate" title={line.output}>{line.output}</span>
                      </div>
                    )
                  }
                  if (line.type === 'tool-active') {
                    return (
                      <div key={i} className="flex items-start gap-2 pl-14 text-[10px]">
                        <span className="text-emerald-500 flex-shrink-0 w-4">▶</span>
                        <span className="text-indigo-300 flex-shrink-0 truncate max-w-[170px]" title={line.tool}>{line.tool}</span>
                        <span className="text-gray-700/60 flex-shrink-0">→</span>
                        <span className="text-gray-600 animate-pulse">{line.output}</span>
                      </div>
                    )
                  }
                  if (line.type === 'running') {
                    return (
                      <div key={i} className="flex items-start gap-2 pt-2 text-indigo-400 animate-pulse">
                        <span className="text-gray-700 w-12 flex-shrink-0 text-[10px]">[...]</span>
                        <span>▶</span>
                        <span className="text-gray-500">Executing — {line.label}</span>
                      </div>
                    )
                  }
                  return null
                })
              })()}
              {!show && (
                <div className="text-center py-4 text-gray-700 text-[10px]">
                  Press "Launch Full Demo" to watch agents execute tools in real-time
                </div>
              )}
            </div>
          </div>

          {/* Completed step count */}
          {isRunning && (
            <div className="mt-3 flex items-center justify-between text-[10px] text-gray-600">
              <span>{completedSteps.length} / {status?.total_steps || 12} steps completed</span>
              <span className="text-indigo-400/70">🧠 Powered by Nemotron 3 Ultra</span>
            </div>
          )}
          {/* Hermes Dashboard indicator */}
          {hermesTriggered && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] text-emerald-400/80 font-mono">
                🤖 Hermes Agent triggered → open <code className="text-emerald-300">http://&lt;IP&gt;:9119/</code> to watch live
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════════════════════ */
function OverviewTab({ stats }) {
  const revenue = stats?.total_revenue || 0
  const costs = stats?.estimated_costs || 0
  const profit = stats?.estimated_profit || 0
  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0

  return (
    <div className="space-y-6">
      {/* Live Agent Demo Section — TOP for video */}
      <LiveDemoSection stats={stats} />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${revenue.toLocaleString()}`, change: '+12%', color: 'text-emerald-400' },
          { label: 'Net Profit', value: `$${profit.toLocaleString()}`, change: `${margin}%`, color: 'text-emerald-400' },
          { label: 'Projects', value: stats?.total_projects || stats?.total_clients || 0, change: `${stats?.completed_projects || 0} done`, color: 'text-blue-400' },
          { label: 'Avg Price', value: `$${(stats?.avg_project_value || 0).toFixed(0)}`, color: 'text-teal-400' },
        ].map((s, i) => (
          <div key={i} className="bg-gray-800/30 rounded-xl p-5 border border-gray-800/50">
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            {s.change && <p className={`text-xs mt-1 ${s.color}`}>{s.change}</p>}
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Finance */}
        <Card title="Finance Breakdown" icon={icons.accounting}>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-400">Revenue</span><span className="text-emerald-400 font-semibold">${revenue.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Operating Costs</span><span className="text-red-400 font-semibold">-${costs.toLocaleString()}</span></div>
            <div className="border-t border-gray-800 pt-3 flex justify-between"><span className="text-white font-medium">Net Profit</span><span className="text-emerald-400 font-bold text-lg">${profit.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Profit Margin</span><span className="text-indigo-400 font-semibold">{margin}%</span></div>
          </div>
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
            <p className="text-xs text-emerald-400 font-medium">🤖 0 Human Employees • Fully Autonomous</p>
          </div>
        </Card>

        {/* Agent Status */}
        <Card title="Agent Status" icon={<span className="text-lg">🤖</span>}>
          <div className="space-y-2">
            {[
              'Intake Agent', 'Template Agent', 'Pricing Agent', 'Stripe Agent',
              'Invoice Agent', 'Spend Agent', 'Brand Agent', 'Content Agent',
              'Composer Agent', 'Social Agent', 'Delivery Agent', 'Finance Agent',
            ].map((name, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/30">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">{icons.check}</span>
                <span className="text-gray-300 flex-1 text-sm">{name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">active</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Business Metrics */}
      <Card title="Business Metrics" icon={<span className="text-lg">📊</span>}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Clients', value: stats?.total_clients || 0 },
            { label: 'Completed', value: stats?.completed_projects || 0 },
            { label: 'Conversion', value: `${stats?.conversion_rate || 0}%` },
            { label: 'AI Agents', value: '16' },
          ].map((m, i) => (
            <div key={i} className="text-center p-4 bg-gray-800/30 rounded-xl">
              <p className="text-2xl font-bold text-white">{m.value}</p>
              <p className="text-xs text-gray-500 mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   EMAIL TAB
   ═══════════════════════════════════════════════════════════ */
function EmailTab() {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/email/history`)
      .then(r => r.json())
      .then(d => setEmails(d.emails || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-500">Loading emails...</div>

  return (
    <div className="space-y-6">
      <Card title="📧 Email Inbox" icon={icons.email}>
        <div className="space-y-3">
          {emails.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No emails yet</p>}
          {emails.map((e, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/30 border border-gray-800/50 hover:border-gray-700/50 transition">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold flex-shrink-0">
                {e.from?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-white truncate">{e.subject}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    e.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                    e.priority === 'normal' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-green-500/10 text-green-400'
                  }`}>{e.priority}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{e.from}</p>
                <p className="text-sm text-gray-400 mt-2 line-clamp-2">{e.body}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[10px] text-gray-600">{e.created_at?.split('T')[0]}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    e.status === 'processed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-teal-500/10 text-teal-400'
                  }`}>{e.status}</span>
                  {e.intent && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">{e.intent.replace('_', ' ')}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   ACCOUNTING TAB
   ═══════════════════════════════════════════════════════════ */
function AccountingTab() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/accounting/dashboard`)
      .then(r => r.json())
      .then(d => setReport(d.stats || d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-500">Loading reports...</div>

  const s = report || {}

  return (
    <div className="space-y-6">
      {/* Revenue & Profit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Revenue', value: `$${s.revenue?.current_month || 0}`, change: `+${s.revenue?.growth_percent || 0}%`, color: 'text-emerald-400' },
          { label: 'Monthly Expenses', value: `$${s.expenses?.current_month || 0}`, change: `${s.expenses?.growth_percent || 0}%`, color: 'text-red-400' },
          { label: 'Net Profit', value: `$${s.profit?.current_month || 0}`, change: `${s.profit?.margin_percent || 0}% margin`, color: 'text-emerald-400' },
          { label: 'Active Clients', value: `${s.clients?.active || 0}/${s.clients?.total || 0}`, change: `${s.clients?.new_this_month || 0} new`, color: 'text-blue-400' },
        ].map((m, i) => (
          <div key={i} className="bg-gray-800/30 rounded-xl p-5 border border-gray-800/50">
            <p className="text-2xl font-bold text-white">{m.value}</p>
            <p className="text-xs text-gray-500 mt-1">{m.label}</p>
            {m.change && <p className={`text-xs mt-1 ${m.color}`}>{m.change}</p>}
          </div>
        ))}
      </div>

      {/* Financial details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue Growth" icon={<span className="text-lg">📈</span>}>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-400">This Month</span><span className="text-emerald-400 font-semibold">$${s.revenue?.current_month || 0}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Previous Month</span><span className="text-gray-300">$${s.revenue?.previous_month || 0}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Growth</span><span className="text-emerald-400">+{s.revenue?.growth_percent || 0}%</span></div>
            <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${Math.min(s.revenue?.growth_percent || 0, 100)}%` }} />
            </div>
          </div>
        </Card>

        <Card title="Project Stats" icon={<span className="text-lg">📦</span>}>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-400">Total Projects</span><span className="text-white font-semibold">{s.projects?.completed || 0}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">In Progress</span><span className="text-teal-400">{s.projects?.in_progress || 0}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Avg Project Value</span><span className="text-indigo-400">$${s.projects?.avg_value || 0}</span></div>
            <div className="flex justify-between text-sm border-t border-gray-800 pt-3"><span className="text-gray-400">New Clients (Month)</span><span className="text-emerald-400 font-semibold">+{s.clients?.new_this_month || 0}</span></div>
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   SUPPORT TAB
   ═══════════════════════════════════════════════════════════ */
function SupportTab() {
  const [requests, setRequests] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/support/pending`).then(r => r.json()),
      fetch(`${API}/support/stats`).then(r => r.json()),
    ]).then(([reqData, statsData]) => {
      setRequests(reqData.requests || reqData.pending || [])
      setStats(statsData.stats || statsData)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-500">Loading support data...</div>

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: stats?.pending_count || requests.length, color: 'text-teal-400' },
          { label: 'Completed (Week)', value: stats?.completed_week || 0, color: 'text-emerald-400' },
          { label: 'Avg Response', value: stats?.avg_response_time || '<5 min', color: 'text-blue-400' },
          { label: 'Satisfaction', value: `${stats?.satisfaction_rate || 98}%`, color: 'text-emerald-400' },
        ].map((s, i) => (
          <div key={i} className="bg-gray-800/30 rounded-xl p-5 border border-gray-800/50">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending requests */}
      <Card title="🔄 Pending Modification Requests" icon={icons.support}>
        <div className="space-y-3">
          {requests.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No pending requests</p>}
          {requests.map((r, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/30 border border-gray-800/50">
              <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-lg">📝</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{r.type || r.request_type || 'Modification'} — {r.client_name || r.client_id || 'Client'}</p>
                <p className="text-xs text-gray-500 mt-1">{r.description || r.details || ''}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400">{r.status || 'pending'}</span>
                  <span className="text-[10px] text-gray-600">{r.created_at?.split('T')[0] || ''}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Request Types */}
      {stats?.by_type && (
        <Card title="Request Types Distribution" icon={<span className="text-lg">📊</span>}>
          <div className="space-y-3">
            {Object.entries(stats.by_type).map(([type, count], i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-20 capitalize">{type}</span>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${Math.min((count / Math.max(...Object.values(stats.by_type))) * 100, 100)}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD PAGE
   ═══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/dashboard/stats`)
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: icons.overview },
    { id: 'email', label: `Email (${3})`, icon: icons.email },
    { id: 'accounting', label: 'Accounting', icon: icons.accounting },
    { id: 'support', label: 'Support', icon: icons.support },
  ]

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Zero Employee Studio — Fully Autonomous Operations</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-sm text-emerald-400 font-medium">All Systems Operational</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <Tab key={t.id} active={tab === t.id} onClick={() => setTab(t.id)} icon={t.icon} label={t.label} />
        ))}
      </div>

      {/* Content */}
      {tab === 'overview' && <OverviewTab stats={stats} />}
      {tab === 'email' && <EmailTab />}
      {tab === 'accounting' && <AccountingTab />}
      {tab === 'support' && <SupportTab />}
    </div>
  )
}
