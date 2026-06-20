import React, { useState } from 'react'

/* ═══════════════════════════════════════════════════════════
   DEMO ACCOUNT
   ═══════════════════════════════════════════════════════════ */
const DEMO_ACCOUNT = {
  email: 'rankfix@agent.com',
  password: 'demo1234',
  name: 'Landy',
}

const I = ({ n, s = 18, c = '' }) => {
  const m = {
    x: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    spin: <svg className="animate-spin" width={s} height={s} viewBox="0 0 24 24" fill="none"><circle opacity=".25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/><path opacity=".75" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z"/></svg>,
    user: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    lock: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    check: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    arrow: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  }
  return <span className={`inline-flex items-center justify-center ${c}`}>{m[n] || null}</span>
}

export default function LoginModal({ onClose, onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password')
      return
    }

    setLoading(true)

    // Simulate network delay
    await new Promise(r => setTimeout(r, 800))

    if (email.trim().toLowerCase() === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) {
      onLogin({ email: DEMO_ACCOUNT.email, name: DEMO_ACCOUNT.name })
    } else {
      setError('Invalid email or password. Try rankfix@agent.com / demo1234')
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(45, 31, 20, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>

      <div className="w-full max-w-sm rounded-2xl bg-white overflow-hidden animate-fadeUp"
        style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.15)' }}
        onClick={e => e.stopPropagation()}>

        <div className="p-6 sm:p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(217, 119, 6, 0.08)' }}>
                <I n="user" s={15} c="text-[#d97706]" />
              </div>
              <span className="text-sm font-semibold tracking-tight" style={{ color: '#2d1f14' }}>Client Login</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg transition-colors"
              style={{ color: '#d5c8bc' }}
              onMouseOver={e => e.currentTarget.style.color = '#2d1f14'}
              onMouseOut={e => e.currentTarget.style.color = '#d5c8bc'}>
              <I n="x" s={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#8a7a6c' }}>Email</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#d5c8bc' }}>
                  <I n="user" s={14} />
                </span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm bg-white border outline-none transition-all"
                  style={{ borderColor: 'rgba(217, 119, 6, 0.12)', color: '#2d1f14' }}
                  onFocus={e => e.target.style.borderColor = '#d97706'}
                  onBlur={e => e.target.style.borderColor = 'rgba(217, 119, 6, 0.12)'}
                  placeholder="rankfix@agent.com" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#8a7a6c' }}>Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#d5c8bc' }}>
                  <I n="lock" s={14} />
                </span>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm bg-white border outline-none transition-all"
                  style={{ borderColor: 'rgba(217, 119, 6, 0.12)', color: '#2d1f14' }}
                  onFocus={e => e.target.style.borderColor = '#d97706'}
                  onBlur={e => e.target.style.borderColor = 'rgba(217, 119, 6, 0.12)'}
                  placeholder="••••••••" />
              </div>
            </div>

            {error && (
              <div className="rounded-xl p-3 text-xs" style={{
                background: 'rgba(220, 38, 38, 0.04)',
                border: '1px solid rgba(220, 38, 38, 0.1)',
                color: '#dc2626'
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
              style={{ background: '#d97706' }}
              onMouseOver={e => { if (!loading) e.currentTarget.style.opacity = '0.9' }}
              onMouseOut={e => { if (!loading) e.currentTarget.style.opacity = '1' }}>
              {loading ? <I n="spin" s={16} c="text-white" /> : <I n="arrow" s={14} c="text-white" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Hint */}
          <div className="mt-5 p-3 rounded-xl text-[10px] text-center leading-relaxed"
            style={{ background: 'rgba(217, 119, 6, 0.04)', color: '#a69484' }}>
            Demo account: <span style={{ color: '#2d1f14', fontWeight: 500 }}>rankfix@agent.com</span>
            {' / '}
            <span style={{ color: '#2d1f14', fontWeight: 500 }}>demo1234</span>
          </div>

        </div>
      </div>
    </div>
  )
}
