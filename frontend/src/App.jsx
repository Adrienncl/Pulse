import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import RankFixHome from './pages/RankFixHome.jsx'
import LandingPage from './pages/LandingPage.jsx'
import ProductSelectionPage from './pages/ProductSelectionPage.jsx'
import BriefPage from './pages/BriefPage.jsx'
import WorkflowPage from './pages/WorkflowPage.jsx'
import DeliveryPage from './pages/DeliveryPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import ScanPage from './pages/ScanPage.jsx'
import ClientDashboardPage from './pages/ClientDashboardPage.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'
import LoginModal from './pages/LoginModal.jsx'

const API = '/api'

/* ═══════════════════════════════════════════════════════════
   ICONS — All inline SVG
   ═══════════════════════════════════════════════════════════ */

const Icon = ({ name, size = 20, className = '' }) => {
  const icons = {
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
    clients: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    generate: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    dollar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    rocket: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>,
    activity: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    package: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    arrowLeft: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    arrowRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    menu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    creditCard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    sparkles: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    alertCircle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    spinner: <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>,
  }
  return <span className={`inline-flex items-center justify-center ${className}`}>{icons[name] || null}</span>
}

/* ═══════════════════════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════════════════════ */

function StatCard({ icon, label, value, change, color = 'indigo', trend }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-5 hover:border-gray-700/50 transition-all duration-200 group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon name={icon} size={18} className={`text-${color}-400`} />
        </div>
        {change && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend === 'up' ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR (Admin Dashboard)
   ═══════════════════════════════════════════════════════════ */

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'clients', label: 'Clients', icon: 'clients' },
  { id: 'generate', label: 'Generate', icon: 'generate' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

function Sidebar({ currentPage, setCurrentPage, collapsed, setCollapsed }) {
  return (
    <div className={`${collapsed ? 'w-[72px]' : 'w-64'} h-screen bg-gray-950/80 border-r border-gray-800/50 flex flex-col transition-all duration-300 backdrop-blur-xl`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Icon name="sparkles" size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="font-bold text-white text-sm tracking-tight">Zero Employee</div>
              <div className="text-[10px] text-gray-500 tracking-wider uppercase">Studio OS</div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              currentPage === item.id
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
            title={collapsed ? item.label : undefined}
          >
            <Icon name={item.icon} size={18} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-gray-800/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:text-white hover:bg-gray-800/50 transition-all text-sm"
        >
          <Icon name={collapsed ? 'arrowRight' : 'arrowLeft'} size={16} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════════════════════ */

// DashboardPage is imported from ./pages/DashboardPage.jsx — it handles
// Overview, Email, Accounting, and Support tabs.

/* ═══════════════════════════════════════════════════════════
   CLIENTS PAGE
   ═══════════════════════════════════════════════════════════ */

function ClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API}/clients`)
      .then(res => setClients(res.data.clients || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-white">Clients</h1>
        <p className="text-gray-500 text-sm mt-1">{clients.length} total clients</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Icon name="spinner" size={24} className="text-indigo-400" />
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 gap-2">
          <Icon name="clients" size={32} className="text-gray-600" />
          <p className="text-gray-500">No clients yet</p>
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {clients.map((client, i) => (
                  <tr key={i} className="hover:bg-gray-800/20 transition-all">
                    <td className="px-5 py-3 text-sm text-white">{client.name}</td>
                    <td className="px-5 py-3 text-sm text-gray-400">{client.business_type}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                        client.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        client.status === 'paid' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {client.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   GENERATE PAGE (Admin)
   ═══════════════════════════════════════════════════════════ */

function GeneratePage() {
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(0)

  const steps = [
    { label: 'Submit', icon: 'edit' },
    { label: 'Analyze', icon: 'search' },
    { label: 'Price', icon: 'dollar' },
    { label: 'Checkout', icon: 'creditCard' },
    { label: 'Generate', icon: 'sparkles' },
  ]

  const runWorkflow = async () => {
    if (!brief.trim()) return
    try {
      setLoading(true)
      setResult(null)
      setStep(1)

      const analysis = await axios.post(`${API}/analyze-brief`, { brief })
      setStep(2)

      const pricing = await axios.post(`${API}/calculate-pricing`, { analysis: analysis.data })
      setStep(3)

      const checkout = await axios.post(`${API}/create-checkout`, {
        client_name: brief.split('—')[0]?.trim() || 'New Client',
        package: pricing.data
      })
      setStep(4)

      const creative = await axios.post(`${API}/generate-creative`, {
        brief,
        analysis: analysis.data,
        pricing: pricing.data
      })

      setResult({
        analysis: analysis.data,
        pricing: pricing.data,
        checkout: checkout.data,
        creative: creative.data
      })
      setStep(5)
    } catch (e) {
      console.error(e)
      setResult({ error: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-white">Generate</h1>
        <p className="text-gray-500 text-sm mt-1">Create a new project from a client brief</p>
      </div>

      <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-5">
        <label className="block text-sm font-medium text-gray-300 mb-2">Client Brief</label>
        <textarea
          value={brief}
          onChange={e => setBrief(e.target.value)}
          placeholder="Describe the client's needs..."
          className="w-full h-32 bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 resize-none transition-all"
        />
        <button
          onClick={runWorkflow}
          disabled={loading || !brief.trim()}
          className="mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Icon name="spinner" size={16} /> : <Icon name="rocket" size={16} />}
          {loading ? 'Processing...' : 'Run Workflow'}
        </button>
      </div>

      {loading && (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  step > i ? 'bg-emerald-500/20 text-emerald-400' :
                  step === i ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' :
                  'bg-gray-800 text-gray-600'
                }`}>
                  {step > i ? <Icon name="check" size={16} /> : <Icon name={s.icon} size={16} />}
                </div>
                <span className="text-[10px] text-gray-500">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && !result.error && (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Result</h3>
          <pre className="text-xs text-gray-400 overflow-auto max-h-64">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {result?.error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-red-400 text-sm">
          Error: {result.error}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   SETTINGS PAGE
   ═══════════════════════════════════════════════════════════ */

function SettingsPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure your studio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">System Info</h3>
          <div className="space-y-3">
            {[
              { label: 'Version', value: '0.3.0' },
              { label: 'Backend', value: 'FastAPI' },
              { label: 'Frontend', value: 'React + Vite' },
              { label: 'Agents', value: '4 active' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-500">{item.label}</span>
                <span className="text-gray-300">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Packages</h3>
          <div className="space-y-3">
            {[
              { name: 'Web Only', price: '$499' },
              { name: 'Social Pack', price: '$699' },
              { name: 'Full Brand', price: '$999' },
            ].map((pkg, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-400">{pkg.name}</span>
                <span className="text-emerald-400 font-medium">{pkg.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   APP — Top-level routing
   ═══════════════════════════════════════════════════════════ */

function App() {
  // ── Read initial page from URL hash ──
  const initialHash = window.location.hash.slice(1) || 'landing'
  const [pageFromHash, ...hashParams] = initialHash.split('?')
  // Check if returning from Stripe checkout
  const stripeParams = new URLSearchParams(window.location.search)
  const isStripeReturn = stripeParams.get('checkout') === 'success'
  const stripeTaskId = isStripeReturn ? stripeParams.get('task_id') || stripeParams.get('session_id') : null
  const [currentPage, setCurrentPage] = useState(isStripeReturn ? 'stripe-loading' : pageFromHash)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [scanTaskId, setScanTaskId] = useState(stripeTaskId)
  const [scanUrl, setScanUrl] = useState(
    pageFromHash === 'scan' && hashParams.length
      ? new URLSearchParams(hashParams.join('?')).get('url') || ''
      : ''
  )
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [pendingNav, setPendingNav] = useState(null)
  const [cookieConsent, setCookieConsent] = useState(() => {
    return localStorage.getItem('pulse_cookie_consent') === 'accepted'
  })

  // ── URL-based routing ──
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'landing'
      const [page, ...params] = hash.split('?')
      if (page && page !== '') {
        setCurrentPage(page)
        if (params.length) {
          const search = new URLSearchParams(params.join('?'))
          if (search.get('url')) setScanUrl(search.get('url'))
        }
      }
    }
    // On mount: if hash points to results, fetch the data
    const initialHash = window.location.hash.slice(1)
    if (initialHash.startsWith('results?task=')) {
      const task = new URLSearchParams(initialHash.split('?')[1]).get('task')
      if (task) {
        setScanTaskId(task)
        setCurrentPage('results')
        fetch(`/api/rankfix/status/${task}`)
          .then(r => r.json())
          .then(data => {
            const result = data.result || data
            if (result.score !== undefined) setScanResult(result)
          })
          .catch(() => {})
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Update URL hash when page changes (but not for results — handled by navigate)
  useEffect(() => {
    if (currentPage === 'results') return  // results hash is set by navigate
    const page = currentPage || 'landing'
    let hash = page
    if (page === 'scan' && scanUrl) hash = `scan?url=${encodeURIComponent(scanUrl)}`
    const current = window.location.hash.slice(1)
    if (current !== hash) {
      window.location.hash = hash
    }
  }, [currentPage, scanUrl, scanTaskId])

  // Handle Stripe return with checkout=success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') === 'success') {
      const tid = params.get('task_id')
      const sid = params.get('session_id')
      // Clean URL params without reload
      window.history.replaceState({}, document.title, window.location.pathname)
      if (tid || sid) {
        fetch(`/api/rankfix/status/${tid || sid}`)
          .then(r => r.json())
          .then(data => {
            const result = data.result || data
            if (result.score !== undefined) {
              result.paid = true
              setScanResult(result)
              setScanTaskId(tid)
              setCurrentPage('results')
            } else {
              // Result not ready yet, poll
              const pollIv = setInterval(() => {
                fetch(`/api/rankfix/status/${tid || sid}`)
                  .then(r2 => r2.json())
                  .then(d2 => {
                    const r2data = d2.result || d2
                    if (r2data.score !== undefined) {
                      clearInterval(pollIv)
                      r2data.paid = true
                      setScanResult(r2data)
                      setScanTaskId(tid)
                      setCurrentPage('results')
                    }
                  })
                  .catch(() => {})
              }, 2000)
              setTimeout(() => clearInterval(pollIv), 120000)
            }
          })
          .catch(() => {
            // Stay on loading screen and retry — don't go to landing
            setTimeout(() => {
              // Retry the fetch
              if (tid || sid) {
                fetch(`/api/rankfix/status/${tid || sid}`)
                  .then(r2 => r2.json())
                  .then(d2 => {
                    const r2data = d2.result || d2
                    if (r2data.score !== undefined) {
                      r2data.paid = true
                      setScanResult(r2data)
                      setScanTaskId(tid)
                      setCurrentPage('results')
                    }
                  })
                  .catch(() => {})
              }
            }, 5000)
          })
      }
    }
  }, [])

  const handleLogin = useCallback(({ email, name }) => {
    setIsLoggedIn(true)
    setUserEmail(email)
    setUserName(name || email.split('@')[0])
    setShowLogin(false)
    // If there was a pending navigation, execute it now
    if (pendingNav) {
      setCurrentPage(pendingNav.page)
      if (pendingNav.data?.result) setScanResult(pendingNav.data.result)
      if (pendingNav.data?.taskId) setScanTaskId(pendingNav.data.taskId)
      if (pendingNav.data?.url) setScanUrl(pendingNav.data.url)
      setPendingNav(null)
    } else {
      setCurrentPage('client-dashboard')
    }
  }, [pendingNav])

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false)
    setUserEmail('')
    setUserName('')
    setCurrentPage('landing')
  }, [])

  const navigate = useCallback((page, data) => {
    // Redirect to login if trying to access client dashboard without being logged in
    if (page === 'client-dashboard' && !isLoggedIn) {
      setPendingNav({ page, data })
      setShowLogin(true)
      return
    }
    setCurrentPage(page)
    if (data?.result) setScanResult(data.result)
    if (data?.taskId) setScanTaskId(data.taskId)
    if (data?.url) setScanUrl(data.url)
    setMobileMenuOpen(false)
    window.scrollTo(0, 0)
    // Set hash for results so page refresh works
    if (page === 'results' && (data?.taskId || data?.scanSessionId)) {
      const tid = data.taskId || data.scanSessionId
      const hash = `results?task=${tid}`
      // Only update if different to avoid hashchange loop
      if (window.location.hash !== `#${hash}`) {
        window.location.hash = hash
      }
    }
  }, [isLoggedIn])

  // Public pages (no sidebar)
  const publicPages = ['landing', 'products', 'brief', 'workflow', 'delivery', 'projects', 'dashboard', 'results', 'scan', 'client-dashboard', 'admin']
  const isPublic = publicPages.includes(currentPage)

  // Stripe loading screen (separate from dark-themed public pages)
  if (currentPage === 'stripe-loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'rgba(13, 148, 136, 0.06)' }}>
          <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#0d9488" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold" style={{ color: '#1e293b' }}>Loading your report…</h2>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>Please wait while we fetch your results</p>
      </div>
    )
  }

  // ── Public site (Landing, Brief, Workflow, Delivery) ──
  const renderAdminPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />
      case 'clients': return <ClientsPage />
      case 'generate': return <GeneratePage />
      case 'settings': return <SettingsPage />
      default: return <DashboardPage />
    }
  }

  // ── Public site (Landing, Brief, Workflow, Delivery) ──
  if (isPublic) {
    return (
      <div className="min-h-screen bg-[#030712] text-white">
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />}
        {!cookieConsent && (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4" style={{ background: 'rgba(30, 41, 59, 0.95)', backdropFilter: 'blur(12px)' }}>
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <p className="text-xs text-white/70">This site uses minimal cookies for scan functionality. No tracking or third-party cookies.</p>
              <button onClick={() => { localStorage.setItem('pulse_cookie_consent', 'accepted'); setCookieConsent(true) }}
                className="px-5 py-2 text-xs rounded-xl font-semibold whitespace-nowrap text-white"
                style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)' }}>Accept</button>
            </div>
          </div>
        )}
        {currentPage === 'landing' && <RankFixHome onNavigate={navigate} isLoggedIn={isLoggedIn} userEmail={userEmail} userName={userName} onOpenLogin={() => setShowLogin(true)} onLogout={handleLogout} />}
        {currentPage === 'products' && <ProductSelectionPage onNavigate={navigate} />}
        {currentPage === 'brief' && <BriefPage onNavigate={navigate} />}
        {currentPage === 'workflow' && <WorkflowPage onNavigate={navigate} />}
        {currentPage === 'delivery' && <DeliveryPage onNavigate={navigate} />}
        {currentPage === 'projects' && <ProjectsPage onNavigate={navigate} />}
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'results' && <ResultsPage result={scanResult} taskId={scanTaskId} onNavigate={navigate} />}
        {currentPage === 'scan' && <ScanPage url={scanUrl} onNavigate={navigate} />}
        {currentPage === 'client-dashboard' && <ClientDashboardPage onNavigate={navigate} initialResult={scanResult} initialTaskId={scanTaskId} isLoggedIn={isLoggedIn} userEmail={userEmail} userName={userName} onLogout={handleLogout} />}
        {currentPage === 'admin' && <AdminDashboardPage onNavigate={navigate} />}
      </div>
    )
  }

  // ── Admin Dashboard ──
  return (
    <div className="min-h-screen bg-[#030712] text-white flex">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-gray-900/90 border border-gray-800 backdrop-blur-xl"
      >
        <Icon name={mobileMenuOpen ? 'x' : 'menu'} size={20} />
      </button>

      {/* Sidebar */}
      <div className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-0 left-0 z-40 transition-transform duration-300`}>
        <Sidebar currentPage={currentPage} setCurrentPage={(p) => { navigate(p); setSidebarCollapsed(sidebarCollapsed) }} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10 min-h-screen">
        <div className="p-6 pl-14 lg:p-8 lg:pl-8 max-w-7xl mx-auto">
          {/* Top bar: link back to site */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('landing')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back to Site
            </button>
          </div>
          {renderAdminPage()}
        </div>
      </main>
    </div>
  )
}

export default App
