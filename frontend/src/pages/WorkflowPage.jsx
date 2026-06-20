import { useState, useEffect, useRef, useMemo } from 'react'

const API = '/api'

const workflowSteps = [
  { id: 'intake', label: 'Client Intake', color: '#6366f1', icon: '📋', agent: 'Intake Agent', action: 'Analyzing brief...', detail: '🧠 Nemotron 3 Ultra processing requirements...' },
  { id: 'template', label: 'Template Selection', color: '#3b82f6', icon: '🎨', agent: 'Template Agent', action: 'Matching template...', detail: 'Finding best template match for your business...' },
  { id: 'pricing', label: 'Pricing', color: '#10b981', icon: '💰', agent: 'Pricing Agent', action: 'Calculating price...', detail: 'Computing optimal package and pricing...' },
  { id: 'payment', label: 'Stripe Payment', color: '#8b5cf6', icon: '💳', agent: 'Stripe Agent', action: 'Creating checkout...', detail: 'Initializing secure payment session...' },
  { id: 'invoice', label: 'Invoice Generation', color: '#eab308', icon: '🧾', agent: 'Invoice Agent', action: 'Generating invoice...', detail: 'Creating professional invoice...' },
  { id: 'spend', label: 'Spend & Provisioning', color: '#f97316', icon: '📊', agent: 'Spend Agent', action: 'Purchasing resources...', detail: 'Domain, hosting, SSL, email, CDN...' },
  { id: 'brand', label: 'Brand Direction', color: '#ec4899', icon: '✨', agent: 'Brand Agent (Nemotron 3)', action: 'Generating brand...', detail: 'Colors, typography, voice, positioning via NVIDIA Nemotron...' },
  { id: 'content', label: 'Content Generation', color: '#06b6d4', icon: '📝', agent: 'Content Agent', action: 'Writing content...', detail: 'Hero, about, menu, contact sections...' },
  { id: 'compose', label: 'Template Composition', color: '#14b8a6', icon: '🖼️', agent: 'Composer Agent', action: 'Building website...', detail: 'Assembling HTML from template + content...' },
  { id: 'social', label: 'Social Assets', color: '#f43f5e', icon: '📱', agent: 'Social Agent', action: 'Creating posts...', detail: 'Instagram, Facebook, Twitter posts...' },
  { id: 'delivery', label: 'Delivery', color: '#f59e0b', icon: '📦', agent: 'Delivery Agent', action: 'Packaging files...', detail: 'Bundling all deliverables...' },
  { id: 'finance', label: 'Finance Summary', color: '#22c55e', icon: '📈', agent: 'Finance Agent', action: 'Calculating profit...', detail: 'Revenue, costs, margin analysis...' },
]

const backendToFrontendId = {
  intake: 'intake', template_selection: 'template', pricing: 'pricing',
  checkout: 'payment', invoice: 'invoice', procurement: 'spend',
  brand: 'brand', content: 'content', composition: 'compose',
  social: 'social', delivery: 'delivery', finance: 'finance',
}

/* ═══════════════════════════════════════════════════════════
   PARTICLES BACKGROUND — Enhanced with color shifts
   ═══════════════════════════════════════════════════════════ */
function ParticleBackground({ currentStep }) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const animationRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Create particles with current step color influence
    const baseColor = workflowSteps[Math.min(currentStep, 11)]?.color || '#6366f1'
    const particles = []
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: [baseColor, '#6366f1', '#8b5cf6', '#06b6d4', '#10b981'][Math.floor(Math.random() * 5)],
        pulse: Math.random() * Math.PI * 2,
      })
    }
    particlesRef.current = particles

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.pulse += 0.02
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        // Pulsing opacity
        const pulseOpacity = p.opacity + Math.sin(p.pulse) * 0.15

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0, Math.min(1, pulseOpacity))
        ctx.fill()

        // Glow effect
        ctx.shadowBlur = 15
        ctx.shadowColor = p.color
      })

      // Draw connections with animated dashes
      ctx.globalAlpha = 0.08
      ctx.strokeStyle = '#6366f1'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.lineDashOffset = -Date.now() / 50

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      ctx.setLineDash([])

      animationRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [currentStep])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
}

/* ═══════════════════════════════════════════════════════════
   ELAPSED TIMER — Enhanced with speed indicator
   ═══════════════════════════════════════════════════════════ */
function ElapsedTimer({ running, completed }) {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())

  useEffect(() => {
    if (!running) return
    startRef.current = Date.now()
    const interval = setInterval(() => {
      setElapsed(((Date.now() - startRef.current) / 1000).toFixed(1))
    }, 100)
    return () => clearInterval(interval)
  }, [running])

  const mins = Math.floor(elapsed / 60)
  const secs = (elapsed % 60).toFixed(1)
  const stepsPerSec = completed ? (12 / elapsed).toFixed(1) : '—'

  return (
    <div className="flex items-center gap-4">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${completed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-gray-800/80 border-gray-700/50'}`}>
        <div className={`w-2 h-2 rounded-full ${running ? 'bg-emerald-400 animate-pulse' : completed ? 'bg-emerald-400' : 'bg-gray-600'}`} />
        <span className="text-sm font-mono text-gray-300">
          {mins > 0 ? `${mins}m ` : ''}{secs}s
        </span>
      </div>
      {completed && (
        <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
          <span className="text-xs font-mono text-indigo-400">{stepsPerSec} steps/s</span>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   ACTIVITY LOG — Terminal-style with colored output
   ═══════════════════════════════════════════════════════════ */
function ActivityLog({ currentStep, completed, results }) {
  const logRef = useRef(null)
  const logs = useMemo(() => {
    const result = []
    for (let i = 0; i < Math.min(currentStep, 12); i++) {
      const step = workflowSteps[i]
      const stepResult = results?.[i]?.result
      let detail = step.action
      if (step.id === 'pricing' && stepResult?.price) detail = `Price: $${stepResult.price}`
      if (step.id === 'spend' && stepResult?.total_estimated_cost) detail = `Cost: $${stepResult.total_estimated_cost}`
      if (step.id === 'finance' && stepResult?.net_profit) detail = `Profit: $${stepResult.net_profit}`
      if (step.id === 'finance' && stepResult?.margin_percent) detail += ` (${stepResult.margin_percent}%)`
      
      result.push({
        time: `${(i * 1.2 + 0.3).toFixed(1)}s`,
        level: 'success',
        agent: step.agent,
        msg: detail,
        color: step.color,
      })
    }
    if (!completed && currentStep < 12) {
      const step = workflowSteps[currentStep]
      result.push({
        time: '...',
        level: 'active',
        agent: step.agent,
        msg: step.action,
        color: step.color,
      })
    }
    return result
  }, [currentStep, completed, results])

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border-b border-gray-800">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="ml-3 text-xs text-gray-500 font-mono">zes-workflow.log</span>
        <div className="ml-auto flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${completed ? 'bg-emerald-400' : 'bg-indigo-400 animate-pulse'}`} />
          <span className="text-[10px] text-gray-600 font-mono">{completed ? 'DONE' : 'RUNNING'}</span>
        </div>
      </div>
      {/* Log content */}
      <div ref={logRef} className="p-4 font-mono text-xs space-y-2 max-h-80 overflow-y-auto">
        {logs.map((log, i) => (
          <div key={i} className={`flex items-start gap-3 ${log.level === 'active' ? 'text-white' : 'text-gray-500'}`}>
            <span className="text-gray-600 w-14 flex-shrink-0">[{log.time}]</span>
            <span style={{ color: log.color }} className="flex-shrink-0 font-bold">
              {log.level === 'active' ? '▶' : '✓'}
            </span>
            <span className="text-gray-400 flex-shrink-0 min-w-[100px]">{log.agent}</span>
            <span className={log.level === 'active' ? 'text-white' : 'text-gray-600'}>— {log.msg}</span>
          </div>
        ))}
        {!completed && currentStep < 12 && (
          <div className="flex items-center gap-3 text-indigo-400 animate-pulse">
            <span className="text-gray-600 w-14 flex-shrink-0">[...]</span>
            <span>▶</span>
            <span>Processing...</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   AGENT PIPELINE — Enhanced with animated connections
   ═══════════════════════════════════════════════════════════ */
function AgentPipeline({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 py-4 overflow-x-auto px-4">
      {workflowSteps.map((step, i) => {
        const status = i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending'
        return (
          <div key={step.id} className="flex items-center">
            {/* Node */}
            <div
              className={`relative flex flex-col items-center transition-all duration-500 ${
                status === 'active' ? 'scale-125 z-10' : status === 'done' ? 'scale-100' : 'scale-90 opacity-40'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-500 ${
                  status === 'active' ? 'shadow-2xl' : ''
                }`}
                style={{
                  backgroundColor: status === 'done' ? `${step.color}30` : status === 'active' ? `${step.color}50` : '#1f2937',
                  boxShadow: status === 'active' ? `0 0 30px ${step.color}80, 0 0 60px ${step.color}40` : 'none',
                  border: status === 'active' ? `3px solid ${step.color}` : status === 'done' ? `2px solid ${step.color}60` : '2px solid transparent',
                }}
              >
                {status === 'done' ? (
                  <svg className="w-6 h-6" fill="none" stroke={step.color} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={status === 'active' ? 'animate-bounce' : ''}>{step.icon}</span>
                )}
              </div>
              {/* Label below */}
              <span className={`text-[10px] mt-2 whitespace-nowrap font-medium transition-all duration-300 ${
                status === 'active' ? 'text-white font-bold' : status === 'done' ? 'text-gray-500' : 'text-gray-700'
              }`}>
                {step.label.split(' ')[0]}
              </span>
              {/* Active indicator dot */}
              {status === 'active' && (
                <div className="absolute -bottom-1 w-2 h-2 rounded-full bg-white animate-ping" />
              )}
            </div>
            {/* Connector line */}
            {i < workflowSteps.length - 1 && (
              <div className="relative w-8 h-1 mx-1">
                <div className="absolute inset-0 rounded-full" style={{
                  backgroundColor: i < currentStep ? `${workflowSteps[i + 1].color}80` : '#1f2937',
                }} />
                {i < currentStep && (
                  <div className="absolute inset-0 rounded-full animate-pulse" style={{
                    backgroundColor: `${workflowSteps[i + 1].color}40`,
                  }} />
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   CURRENT AGENT HERO CARD — Enhanced with glow effects
   ═══════════════════════════════════════════════════════════ */
function CurrentAgentCard({ step, progress }) {
  if (!step) return null
  return (
    <div
      className="relative rounded-2xl p-6 border overflow-hidden transition-all duration-700"
      style={{
        background: `linear-gradient(135deg, ${step.color}20, ${step.color}08)`,
        borderColor: `${step.color}50`,
        boxShadow: `0 0 60px ${step.color}25, inset 0 0 60px ${step.color}08`,
      }}
    >
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${progress}% 50%, ${step.color}50, transparent 70%)`,
          transition: 'all 0.5s ease',
        }}
      />
      {/* Scan line effect */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            ${step.color}10 2px,
            ${step.color}10 4px
          )`,
        }}
      />
      <div className="relative z-10 flex items-center gap-6">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl transition-all duration-500"
          style={{
            backgroundColor: `${step.color}30`,
            boxShadow: `0 0 40px ${step.color}40, inset 0 0 20px ${step.color}20`,
          }}
        >
          {step.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-white">{step.agent}</h2>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold animate-pulse uppercase tracking-wider"
              style={{ backgroundColor: `${step.color}25`, color: step.color }}
            >
              ● Active
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-1">{step.action}</p>
          <p className="text-xs text-gray-500">{step.detail}</p>
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: step.color,
                boxShadow: `0 0 10px ${step.color}80`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-600 font-mono">{step.agent}</span>
            <span className="text-[10px] text-gray-600 font-mono">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP LIST — Enhanced with results preview
   ═══════════════════════════════════════════════════════════ */
function StepList({ currentStep, results }) {
  return (
    <div className="space-y-1.5">
      {workflowSteps.map((step, i) => {
        const status = i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending'
        const result = results?.[i]?.result
        return (
          <div
            key={step.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 ${
              status === 'active'
                ? 'bg-gray-800/60 border border-gray-700/40 shadow-lg'
                : status === 'done'
                ? 'opacity-70 hover:opacity-90 hover:bg-gray-800/30'
                : 'opacity-25'
            }`}
          >
            {/* Icon */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                status === 'active' ? 'scale-110' : ''
              }`}
              style={{
                backgroundColor: status === 'done' ? `${step.color}30` : status === 'active' ? `${step.color}40` : '#1f293780',
                boxShadow: status === 'active' ? `0 0 20px ${step.color}50` : 'none',
              }}
            >
              {status === 'done' ? (
                <svg className="w-5 h-5" fill="none" stroke={step.color} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-lg">{step.icon}</span>
              )}
            </div>
            {/* Label */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${
                status === 'active' ? 'text-white' : status === 'done' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {step.label}
              </p>
              {status === 'active' && (
                <p className="text-xs mt-0.5 animate-pulse" style={{ color: step.color }}>{step.action}</p>
              )}
              {status === 'done' && result && (
                <p className="text-xs text-gray-600 mt-0.5 truncate">
                  {step.id === 'pricing' && result.price && `💰 $${result.price}`}
                  {step.id === 'spend' && result.total_estimated_cost && `📊 $${result.total_estimated_cost} cost`}
                  {step.id === 'finance' && result.net_profit && `📈 $${result.net_profit} profit (${result.margin_percent}%)`}
                  {step.id !== 'pricing' && step.id !== 'spend' && step.id !== 'finance' && '✓ Complete'}
                </p>
              )}
            </div>
            {/* Step number */}
            <span className="text-xs text-gray-700 font-mono w-6 text-right">{i + 1}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   COMPLETION CELEBRATION — Enhanced with confetti effect
   ═══════════════════════════════════════════════════════════ */
function CompletionCelebration({ summary, finance, onNavigate }) {
  const [show, setShow] = useState(false)
  useEffect(() => { setTimeout(() => setShow(true), 100) }, [])

  return (
    <div className={`transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Success banner */}
      <div className="relative bg-gradient-to-r from-emerald-500/15 via-indigo-500/15 to-purple-500/15 border border-emerald-500/30 rounded-2xl p-8 mb-6 overflow-hidden">
        {/* Animated glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-purple-500/5 animate-pulse" />
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/25 flex items-center justify-center text-4xl animate-bounce shadow-lg shadow-emerald-500/20">
            🎉
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Workflow Complete!</h2>
            <p className="text-sm text-gray-400">All 12 agents completed successfully • 0 human employees</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Client', value: summary?.client || 'Client', color: '#fff', icon: '👤' },
            { label: 'Template', value: summary?.template || '—', color: '#6366f1', icon: '🎨' },
            { label: 'Revenue', value: `$${finance?.revenue || summary?.profit || 0}`, color: '#10b981', icon: '💰' },
            { label: 'Margin', value: `${finance?.margin_percent || 94}%`, color: '#22c55e', icon: '📈' },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 bg-gray-900/60 rounded-xl border border-gray-800/50">
              <p className="text-2xl mb-2">{stat.icon}</p>
              <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => onNavigate('delivery')}
          className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold text-sm transition-all hover:shadow-lg hover:shadow-indigo-500/30 transform hover:scale-[1.02]"
        >
          📦 View Delivery
        </button>
        <button
          onClick={() => onNavigate('products')}
          className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-sm transition-all transform hover:scale-[1.02]"
        >
          🚀 New Project
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN WORKFLOW PAGE
   ═══════════════════════════════════════════════════════════ */
export default function WorkflowPage({ onNavigate }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [workflowResult, setWorkflowResult] = useState(null)
  const [error, setError] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [agentProgress, setAgentProgress] = useState(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const runWorkflow = async () => {
      try {
        // Read brief from localStorage
        const briefData = JSON.parse(localStorage.getItem('__BRIEF_DATA__') || '{}')
        const existingResult = JSON.parse(localStorage.getItem('__WORKFLOW_RESULTS__') || 'null')

        if (existingResult && (existingResult.workflow_steps || existingResult.workflow)) {
          setWorkflowResult(existingResult)
          setCurrentStep(12)
          setCompleted(true)
          return
        }

        // --- Start API call FIRST, before any animation ---
        const requestBody = {
          brief: briefData.description || briefData.brief || JSON.stringify(briefData),
          client_name: briefData.clientName || briefData.client_name || 'Client',
          client_email: briefData.client_email || 'client@example.com',
        }

        const response = await fetch(`${API}/workflow/full`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()

        if (!mountedRef.current) return

        const summary = {
          client: briefData.client_name || 'Client',
          template: data.workflow?.template_selection?.template_name || 'Selected Template',
          template_confidence: data.workflow?.template_selection?.confidence || 0,
          profit: data.workflow?.finance?.net_profit || 0,
          human_employees: data.workflow?.finance?.human_employees || 0,
          website_url: data.workflow?.delivery?.website_url || '',
          files_count: data.workflow?.delivery?.files_count || 0,
          deliverables_count: data.workflow?.delivery?.deliverables_count || 0,
        }

        const workflowStepIds = Object.keys(backendToFrontendId)
        const workflow_steps = workflowStepIds.map((backendKey, i) => ({
          step: i + 1,
          id: backendToFrontendId[backendKey],
          result: data.workflow?.[backendKey] || {},
        }))

        const result = { session_id: data.session_id, status: data.status, summary, workflow_steps }
        setWorkflowResult(result)

        // --- Quick cascade animation (200ms each) through all 12 steps with real data ---
        for (let i = 1; i <= 12; i++) {
          if (!mountedRef.current) return
          setCurrentStep(i)
          setAgentProgress(0)
          if (i < 12) {
            await new Promise(r => setTimeout(r, 200))
          }
        }

        // Brief pause on final step so user can see it
        await new Promise(r => setTimeout(r, 400))
        setCompleted(true)

        // Save results to localStorage
        try {
          const existing = JSON.parse(localStorage.getItem('__PROJECTS__') || '[]')
          existing.push({
            id: data.session_id,
            brief: { clientName: briefData.client_name || 'Client' },
            result: summary,
            timestamp: new Date().toISOString(),
          })
          localStorage.setItem('__PROJECTS__', JSON.stringify(existing.slice(-10)))
          localStorage.setItem('__WORKFLOW_RESULTS__', JSON.stringify(result))
        } catch {}

      } catch (e) {
        if (mountedRef.current) setError(e.message)
      }
    }

    runWorkflow()
    return () => { mountedRef.current = false }
  }, [])

  const progress = Math.min((currentStep / 12) * 100, 100)
  const summary = workflowResult?.summary
  const finance = workflowResult?.workflow_steps?.find(s => s.step === 12)?.result
  const currentAgent = workflowSteps[Math.min(currentStep, 11)]

  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      <ParticleBackground currentStep={currentStep} />

      <div className="relative z-10">
        {/* ── HEADER ── */}
        <div className="border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">Zero Employee Studio OS</h1>
                  <p className="text-xs text-gray-500">12-Step Autonomous Workflow</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ElapsedTimer running={!completed} completed={completed} />
                {/* Nemotron 3 Ultra badge */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-green-400 tracking-wide uppercase">Nemotron 3</span>
                </div>
                {completed && (
                  <button
                    onClick={() => onNavigate('delivery')}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-full text-sm font-bold transition-all hover:shadow-lg hover:shadow-indigo-500/30 transform hover:scale-105"
                  >
                    View Delivery →
                  </button>
                )}
              </div>
            </div>

            {/* Global Progress Bar */}
            <div className="mt-5 flex items-center gap-4">
              <div className="flex-1 h-4 bg-gray-800/80 rounded-full overflow-hidden border border-gray-700/50">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4, #10b981)`,
                    boxShadow: '0 0 30px rgba(99,102,241,0.5)',
                  }}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
              </div>
              <span className="text-lg font-bold font-mono text-white w-16 text-right">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* ── AGENT PIPELINE (Horizontal) ── */}
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <AgentPipeline currentStep={currentStep} />
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="max-w-7xl mx-auto px-6 pb-12">
          {error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center mt-8">
              <p className="text-red-400 text-lg mb-4">⚠️ {error}</p>
              <button onClick={() => onNavigate('products')} className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">
                Try Again
              </button>
            </div>
          ) : !completed ? (
            currentStep === 0 && !workflowResult ? (
              /* ── LOADING STATE (waiting for API response) ── */
              <div className="flex flex-col items-center justify-center mt-24">
                <div className="relative mb-8">
                  <div
                    className="w-24 h-24 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-5xl animate-bounce"
                    style={{ boxShadow: '0 0 60px rgba(99,102,241,0.3), inset 0 0 30px rgba(99,102,241,0.1)' }}
                  >
                    🔄
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Initializing Agents...</h2>
                <p className="text-sm text-gray-500 mb-8 text-center max-w-md">
                  Nemotron 3 Ultra is processing your brief and orchestrating 12 autonomous agents.
                  This typically takes 30–60 seconds.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-sm text-indigo-400 font-mono">Waiting for API response...</span>
                </div>
                {/* Mini progress bar pulse */}
                <div className="mt-8 w-64 h-2 bg-gray-800/80 rounded-full overflow-hidden border border-gray-700/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"
                    style={{ width: '30%', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                {/* Left: Step List */}
                <div className="lg:col-span-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Workflow Steps</h3>
                  <StepList currentStep={currentStep} results={workflowResult?.workflow_steps} />
                </div>

                {/* Right: Active Agent + Logs */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Current Agent Hero */}
                  <CurrentAgentCard step={currentAgent} progress={agentProgress} />

                  {/* Activity Log */}
                  <ActivityLog currentStep={currentStep} completed={completed} results={workflowResult?.workflow_steps} />
                </div>
              </div>
            )
          ) : (
            /* ── COMPLETION ── */
            <div className="mt-8">
              <CompletionCelebration summary={summary} finance={finance} onNavigate={onNavigate} />

              {/* Finance Card */}
              {finance && (
                <div className="mt-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/30 rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">📈 Finance Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-900/60 rounded-xl">
                      <p className="text-2xl font-bold text-emerald-400">${finance.revenue}</p>
                      <p className="text-[10px] text-gray-500 mt-1">Revenue</p>
                    </div>
                    <div className="text-center p-4 bg-gray-900/60 rounded-xl">
                      <p className="text-2xl font-bold text-red-400">${finance.total_costs}</p>
                      <p className="text-[10px] text-gray-500 mt-1">Costs</p>
                    </div>
                    <div className="text-center p-4 bg-gray-900/60 rounded-xl">
                      <p className="text-2xl font-bold text-emerald-400">${finance.net_profit}</p>
                      <p className="text-[10px] text-gray-500 mt-1">Net Profit</p>
                    </div>
                    <div className="text-center p-4 bg-gray-900/60 rounded-xl">
                      <p className="text-2xl font-bold text-indigo-400">{finance.margin_percent}%</p>
                      <p className="text-[10px] text-gray-500 mt-1">Margin</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                    <p className="text-xs text-emerald-400 font-medium">
                      🤖 0 Human Employees • Status: {finance.status || 'Autonomous'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
