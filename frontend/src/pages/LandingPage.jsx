import { useState, useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════════════════════ */
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
)
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
)
const Logo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" /></svg>
)
const QuoteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" opacity="0.2"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
)

/* ═══════════════════════════════════════════════════════════
   ANIMATED MESH BACKGROUND
   ═══════════════════════════════════════════════════════════ */
function MeshBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const orbs = [
      { x: 0.2, y: 0.3, r: 0.35, color: '99,102,241', vx: 0.0003, vy: 0.0002 },
      { x: 0.8, y: 0.4, r: 0.3, color: '139,92,246', vx: -0.0002, vy: 0.0004 },
      { x: 0.5, y: 0.8, r: 0.4, color: '6,182,212', vx: 0.0004, vy: -0.0003 },
      { x: 0.3, y: 0.7, r: 0.25, color: '236,72,153', vx: -0.0003, vy: -0.0002 },
      { x: 0.7, y: 0.2, r: 0.2, color: '16,185,129', vx: 0.0002, vy: 0.0003 },
    ]

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      orbs.forEach(o => {
        o.x += o.vx
        o.y += o.vy
        if (o.x < -0.2 || o.x > 1.2) o.vx *= -1
        if (o.y < -0.2 || o.y > 1.2) o.vy *= -1

        const cx = o.x * canvas.width
        const cy = o.y * canvas.height
        const r = o.r * canvas.width * 0.35

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        gradient.addColorStop(0, `rgba(${o.color},0.12)`)
        gradient.addColorStop(0.5, `rgba(${o.color},0.06)`)
        gradient.addColorStop(1, `rgba(${o.color},0)`)

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      })

      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
}

/* ═══════════════════════════════════════════════════════════
   SCROLL REVEAL
   ═══════════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0, className = '' }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PROJECT CARDS (Portfolio)
   ═══════════════════════════════════════════════════════════ */
const projects = [
  { title: 'Boulangerie Martin', tag: 'Restaurant', gradient: 'from-amber-600 to-orange-700', emoji: '🥖', stats: '$999 • 47s delivery', image: '/images/portfolio/boulangerie.jpg' },
  { title: 'Fitness Pulse', tag: 'Wellness', gradient: 'from-emerald-600 to-teal-700', emoji: '💪', stats: '$1,499 • 52s delivery', image: '/images/portfolio/fitness.jpg' },
  { title: 'Le Petit Bistro', tag: 'Restaurant', gradient: 'from-red-600 to-rose-700', emoji: '🍷', stats: '$899 • 41s delivery', image: '/images/portfolio/bistro.jpg' },
  { title: 'TechFlow Studio', tag: 'Tech', gradient: 'from-blue-600 to-indigo-700', emoji: '⚡', stats: '$1,999 • 38s delivery', image: '/images/portfolio/tech.jpg' },
  { title: 'Zen Wellness', tag: 'Wellness', gradient: 'from-cyan-600 to-blue-700', emoji: '🧘', stats: '$899 • 45s delivery', image: '/images/portfolio/wellness.jpg' },
  { title: 'Craft Coffee Co.', tag: 'Retail', gradient: 'from-stone-600 to-amber-700', emoji: '☕', stats: '$499 • 35s delivery', image: '/images/portfolio/coffee.jpg' },
]

/* ═══════════════════════════════════════════════════════════
   SERVICES
   ═══════════════════════════════════════════════════════════ */
const services = [
  {
    title: 'Brand Identity',
    desc: 'Logos, color systems, typography, and complete visual languages that make your brand unforgettable.',
    icon: '✨',
    features: ['Logo (3 variations)', 'Color palette', 'Typography', 'Brand guidelines'],
  },
  {
    title: 'Web Design',
    desc: 'Mobile-first, conversion-optimized websites built from templates that adapt to your content.',
    icon: '🌐',
    features: ['Responsive design', 'SEO optimized', 'Fast loading', 'Analytics ready'],
  },
  {
    title: 'Social Media',
    desc: 'Ready-to-post templates, content calendars, and campaigns for every major platform.',
    icon: '📱',
    features: ['Instagram posts', 'Facebook covers', 'Twitter headers', 'Content calendar'],
  },
  {
    title: 'Content Writing',
    desc: 'AI-crafted copy that captures your brand voice — from hero sections to product descriptions.',
    icon: '✍️',
    features: ['Hero copy', 'About pages', 'Product desc.', 'SEO keywords'],
  },
]

/* ═══════════════════════════════════════════════════════════
   PROCESS STEPS
   ═══════════════════════════════════════════════════════════ */
const processSteps = [
  { step: 1, title: 'Brief', desc: 'Client submits a project brief. Our Intake Agent analyzes requirements in real time.', color: '#6366f1' },
  { step: 2, title: 'Design', desc: 'AI generates brand assets, content, and website from your brief — no human designers.', color: '#8b5cf6' },
  { step: 3, title: 'Deliver', desc: 'Complete package delivered with invoice, brand guidelines, and live preview.', color: '#06b6d4' },
]

/* ═══════════════════════════════════════════════════════════
   PACKAGES
   ═══════════════════════════════════════════════════════════ */
const packages = [
  {
    name: 'Starter',
    price: 499,
    desc: 'Everything you need to launch a professional online presence.',
    features: ['Professional logo (3 variations)', 'One-page responsive website', 'Brand color palette', 'Typography system', 'Social profile templates'],
    highlight: false,
    cta: 'Get Started',
  },
  {
    name: 'Growth',
    price: 899,
    desc: 'The complete brand package for businesses ready to scale.',
    features: ['Everything in Starter', 'Full brand guidelines', '10 social media posts', 'Content calendar', 'Email signature & business cards', 'Brand strategy document'],
    highlight: true,
    cta: 'Start Building',
  },
  {
    name: 'Enterprise',
    price: 1499,
    desc: 'Full-service brand transformation for ambitious companies.',
    features: ['Everything in Growth', 'Multi-page website', 'Competitor analysis', 'Custom illustrations', '2 revision rounds', 'Priority support', 'Brand asset library'],
    highlight: false,
    cta: 'Contact Us',
  },
]

/* ═══════════════════════════════════════════════════════════
   SECTION HEADER
   ═══════════════════════════════════════════════════════════ */
function SectionHeader({ label, title, desc }) {
  return (
    <div className="text-center mb-20">
      <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-5">
        {label}
      </span>
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight">{title}</h2>
      {desc && <p className="text-gray-500 max-w-2xl mx-auto text-lg">{desc}</p>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════════════ */
export default function LandingPage({ onNavigate }) {
  const [scrolled, setScrolled] = useState(false)
  const [hoveredPkg, setHoveredPkg] = useState(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      <MeshBackground />

      {/* ══════════════════════════════════════════════════════
         NAV
         ══════════════════════════════════════════════════════ */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#030712]/85 backdrop-blur-2xl border-b border-white/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Logo size={16} />
            </div>
            <span className="font-bold text-white tracking-tight">ZES</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#work" className="text-gray-400 hover:text-white transition-colors">Portfolio</a>
            <a href="#services" className="text-gray-400 hover:text-white transition-colors">Services</a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
            <a href="#process" className="text-gray-400 hover:text-white transition-colors">Process</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('products')}
              className="px-6 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all hover:shadow-lg hover:shadow-white/10"
            >
              Start a Project
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════
         HERO
         ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center px-6 pt-20 overflow-hidden">
        {/* Hero background image */}
        <div className="absolute inset-0">
          <img src="/images/hero-bg.jpg" alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-[#030712]/80 to-transparent" />
        </div>
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div className="max-w-xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/8 bg-white/[0.03] backdrop-blur-sm text-gray-400 text-xs font-medium mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Autonomous Creative Agency OS</span>
              </div>

              {/* Massive headline */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[-0.04em] leading-[0.95] mb-8">
                <span className="text-white">Most agents</span>
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">create assets.</span>
                <br />
                <span className="text-white">Few operate a</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">business.</span>
              </h1>

              <p className="text-lg text-gray-500 max-w-lg mb-10 leading-relaxed">
                Zero Employee Studio OS transforms a client brief into a delivered creative project — 
                paid, produced, and deployed by autonomous agents. No sales, no designers, no developers.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
                <button
                  onClick={() => onNavigate('products')}
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-base hover:bg-gray-100 transition-all shadow-2xl shadow-white/10 transform hover:scale-[1.02]"
                >
                  Start Your Project
                  <span className="group-hover:translate-x-1 transition-transform"><ArrowRight /></span>
                </button>
                <button
                  onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 px-8 py-4 border border-white/10 text-gray-400 rounded-xl font-medium text-base hover:border-white/20 hover:text-white transition-all"
                >
                  See Our Portfolio
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckIcon /> From $499
                </span>
                <span className="text-gray-800">/</span>
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <CheckIcon /> Delivered in minutes
                </span>
                <span className="text-gray-800">/</span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <CheckIcon /> 0 humans
                </span>
              </div>
            </div>

            {/* Right: Empty / clean space — keeping layout balanced */}
            <div className="hidden lg:block" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
         PORTFOLIO / WORK
         ══════════════════════════════════════════════════════ */}
      <section id="work" className="relative py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <SectionHeader
              label="Examples"
              title="Demo Projects"
              desc="Six concrete examples of what the studio can produce — from bakeries to tech startups, each delivered in under a minute."
            />
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="group relative rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-500 cursor-pointer">
                  {/* Background image */}
                  <div className="absolute inset-0">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient} opacity-60 group-hover:opacity-40 transition-all duration-500`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </div>
                  {/* Content */}
                  <div className="relative p-6 min-h-[240px] flex flex-col justify-end">
                    {/* Emoji */}
                    <div className="absolute top-5 right-5 text-4xl opacity-30 group-hover:opacity-60 transition-all duration-500 group-hover:scale-110 transform">{p.emoji}</div>
                    {/* Tag */}
                    <span className="inline-block px-2.5 py-1 rounded-full bg-white/10 text-white text-[10px] font-semibold uppercase tracking-wider mb-3 w-fit">
                      {p.tag}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{p.title}</h3>
                    <p className="text-xs text-gray-500 font-mono">{p.stats}</p>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <span className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-xl text-sm font-semibold text-white border border-white/10">
                        View Case Study →
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
         SERVICES
         ══════════════════════════════════════════════════════ */}
      <section id="services" className="relative py-28 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <SectionHeader
              label="Services"
              title="What We Build"
              desc="Every deliverable is generated, versioned, and packaged by specialized AI agents."
            />
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="group relative rounded-2xl p-6 bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all duration-500 hover:bg-indigo-500/[0.03] hover:shadow-lg hover:shadow-indigo-500/5 h-full">
                  <div className="text-3xl mb-5 group-hover:scale-110 transition-transform duration-500">{s.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-3">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">{s.desc}</p>
                  <ul className="space-y-2">
                    {s.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="text-emerald-500"><CheckIcon /></span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
         HOW IT WORKS (Process)
         ══════════════════════════════════════════════════════ */}
      <section id="process" className="relative py-28 px-6 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <SectionHeader
              label="Process"
              title="Brief → Design → Deliver"
              desc="Three steps. Zero humans. Fully autonomous."
            />
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-24 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-cyan-500/40" />

            {processSteps.map((p, i) => (
              <Reveal key={i} delay={i * 200}>
                <div className="relative text-center md:text-left">
                  {/* Step number */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black mb-6 mx-auto md:mx-0 relative z-10"
                    style={{
                      backgroundColor: `${p.color}20`,
                      border: `2px solid ${p.color}40`,
                      boxShadow: `0 0 30px ${p.color}20`,
                    }}
                  >
                    {p.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{p.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto md:mx-0">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
         PRICING
         ══════════════════════════════════════════════════════ */}
      <section id="pricing" className="relative py-28 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <SectionHeader
              label="Pricing"
              title="Simple. Transparent."
              desc="One project, one price, delivered in minutes. No subscriptions, no hidden fees."
            />
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start max-w-5xl mx-auto">
            {packages.map((pkg, i) => (
              <Reveal key={i} delay={i * 150}>
                <div
                  onMouseEnter={() => setHoveredPkg(i)}
                  onMouseLeave={() => setHoveredPkg(null)}
                  className={`relative rounded-2xl p-px transition-all duration-500 ${
                    pkg.highlight
                      ? 'bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 shadow-2xl shadow-indigo-500/20 scale-[1.03] z-10'
                      : hoveredPkg === i
                      ? 'bg-gradient-to-b from-gray-500 to-gray-600 shadow-lg'
                      : 'bg-white/5'
                  }`}
                >
                  {pkg.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-[11px] font-bold text-white tracking-wider uppercase shadow-xl shadow-indigo-500/30">
                      Most Popular
                    </div>
                  )}
                  <div className="bg-[#0a0f1e] rounded-2xl p-8 h-full">
                    <h3 className="text-lg font-bold text-white mb-2">{pkg.name}</h3>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">{pkg.desc}</p>
                    <div className="flex items-baseline gap-1.5 mb-8">
                      <span className="text-5xl font-black text-white tracking-tight">${pkg.price.toLocaleString()}</span>
                      <span className="text-sm text-gray-500">one-time</span>
                    </div>
                    <button
                      onClick={() => onNavigate('products')}
                      className={`w-full py-4 rounded-xl font-bold text-sm transition-all mb-8 ${
                        pkg.highlight
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-indigo-500/25 transform hover:scale-[1.02]'
                          : 'bg-white/[0.06] text-gray-300 hover:bg-white/[0.1] border border-white/[0.08]'
                      }`}
                    >
                      {pkg.cta}
                    </button>
                    <ul className="space-y-3.5">
                      {pkg.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="text-emerald-400 flex-shrink-0"><CheckIcon /></span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
         TESTIMONIAL
         ══════════════════════════════════════════════════════ */}
      <section className="relative py-28 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium tracking-wider uppercase">
                  🧪 Live Demo
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                See It In Action
              </h3>
              <p className="text-gray-400 max-w-2xl mx-auto mb-6 text-base leading-relaxed">
                Submit a real brief and watch 12 AI agents execute the complete workflow — 
                intake, pricing, payment, brand direction, content generation, template composition, 
                social assets, and delivery — all in under 60 seconds.
              </p>
              <button
                onClick={() => onNavigate('products')}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold text-sm hover:from-indigo-400 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.97]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" strokeWidth="2"/>
                </svg>
                Try the Live Demo
              </button>
              <div className="mt-8 flex items-center justify-center gap-8 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" strokeWidth="2"/></svg>
                  12 agents
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" strokeWidth="2"/></svg>
                  &lt; 60 seconds
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" strokeWidth="2"/></svg>
                  0 humans
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
         FINAL CTA
         ══════════════════════════════════════════════════════ */}
      <section className="relative py-32 px-6 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/8 via-transparent to-purple-600/8 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none" />

        <Reveal>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
              Ready to build
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                your brand?
              </span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto mb-12 text-lg">
              No sales calls. No design briefs. No waiting. Start your project and get a complete brand package delivered in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('products')}
                className="group inline-flex items-center gap-2 px-10 py-5 bg-white text-gray-900 rounded-xl font-bold text-base hover:bg-gray-100 transition-all shadow-2xl shadow-white/10 transform hover:scale-[1.02]"
              >
                Start Your Project
                <span className="group-hover:translate-x-1 transition-transform"><ArrowRight /></span>
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="inline-flex items-center gap-2 px-8 py-5 border border-white/10 text-gray-400 rounded-xl font-medium text-base hover:border-white/20 hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" strokeWidth="2"/>
                </svg>
                Watch Live Demo
              </button>
            </div>
            <p className="text-xs text-gray-700 mt-6">No credit card required • Delivered in minutes • Powered by 12 autonomous agents</p>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════════════
         FOOTER
         ══════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Logo size={14} />
                </div>
                <span className="font-bold text-white tracking-tight text-sm">ZES</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mb-6">
                An autonomous business operating system for creative agencies. Build, deploy, and deliver — with zero human employees.
              </p>
              <div className="flex items-center gap-3">
                {['TW', 'LI', 'GH'].map((s, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all text-[10px] font-bold">
                    {s}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><a href="#work" className="hover:text-white transition-colors">Portfolio</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#process" className="hover:text-white transition-colors">Process</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-600">© 2026 Zero Employee Studio</span>
            <div className="flex items-center gap-4">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate('dashboard') }}
                className="text-xs text-gray-700 hover:text-gray-400 transition-colors"
              >
                Admin Dashboard
              </a>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                All systems autonomous
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
