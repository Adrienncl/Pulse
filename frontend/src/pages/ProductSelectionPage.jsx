import { useState } from 'react'

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
)

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
)

const products = [
  {
    id: 'logo',
    name: 'Logo Design',
    price: 199,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
    desc: 'Professional vector logo for your brand',
    features: ['SVG format', 'Multiple versions', 'Brand colors'],
  },
  {
    id: 'website',
    name: 'Landing Page',
    price: 349,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    desc: 'Responsive HTML landing page',
    features: ['Mobile-first', 'Modern design', 'SEO ready'],
  },
  {
    id: 'social',
    name: 'Social Media Kit',
    price: 199,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    desc: 'Posts, stories, and banners',
    features: ['Instagram', 'Twitter/X', 'LinkedIn'],
  },
  {
    id: 'branding',
    name: 'Full Brand Identity',
    price: 399,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
      </svg>
    ),
    desc: 'Complete brand package',
    features: ['Logo + Guidelines', 'Color palette', 'Typography'],
  },
  {
    id: 'business-cards',
    name: 'Business Cards',
    price: 99,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    desc: 'Professional business card design',
    features: ['Print-ready', 'Front & back', 'PDF export'],
  },
  {
    id: 'email',
    name: 'Email Templates',
    price: 99,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    desc: 'Responsive email templates',
    features: ['Newsletter', 'Welcome email', 'Promotional'],
  },
]

export default function ProductSelectionPage({ onNavigate }) {
  const [selected, setSelected] = useState([])

  const toggleProduct = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const total = selected.reduce((sum, id) => {
    const product = products.find(p => p.id === id)
    return sum + (product?.price || 0)
  }, 0)

  const handleContinue = () => {
    if (selected.length === 0) return
    localStorage.setItem('__SELECTED_PRODUCTS__', JSON.stringify(selected))
    onNavigate('brief')
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-indigo-500/30">

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#030712]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft /> Back
          </button>
          <div className="text-sm text-gray-600">
            {selected.length > 0 ? `${selected.length} service${selected.length > 1 ? 's' : ''} selected` : 'Step 1 of 3'}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-16 pb-32">
        {/* Hero */}
        <div className="text-center mb-16">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-indigo-400 mb-4">Services</p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
            Choose what you need
          </h1>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
            Select one or more services. Our AI agents build everything for you in minutes.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const isSelected = selected.includes(product.id)
            return (
              <button
                key={product.id}
                onClick={() => toggleProduct(product.id)}
                className={`
                  group relative text-left rounded-2xl border p-6
                  transition-all duration-200 ease-out
                  ${isSelected
                    ? 'bg-white/[0.04] border-indigo-500/50 ring-1 ring-indigo-500/20'
                    : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]'
                  }
                `}
              >
                {/* Selection indicator */}
                <div className={`
                  absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center
                  transition-all duration-200
                  ${isSelected
                    ? 'bg-indigo-500 border-indigo-500 scale-100'
                    : 'border-white/10 scale-100 group-hover:border-white/20'
                  }
                `}>
                  {isSelected && <CheckIcon />}
                </div>

                {/* Icon */}
                <div className={`
                  w-11 h-11 rounded-xl flex items-center justify-center mb-5
                  transition-colors duration-200
                  ${isSelected ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/[0.04] text-gray-500 group-hover:text-gray-400'}
                `}>
                  {product.icon}
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className={`
                    text-sm font-medium mb-1 transition-colors duration-200
                    ${isSelected ? 'text-white' : 'text-gray-300'}
                  `}>
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{product.desc}</p>
                </div>

                {/* Price */}
                <div className={`
                  text-2xl font-semibold tracking-tight mb-4 transition-colors duration-200
                  ${isSelected ? 'text-white' : 'text-gray-400'}
                `}>
                  ${product.price}
                </div>

                {/* Features */}
                <div className="space-y-1.5">
                  {product.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`
                        w-1 h-1 rounded-full flex-shrink-0 transition-colors duration-200
                        ${isSelected ? 'bg-indigo-400' : 'bg-gray-700'}
                      `} />
                      <span className={`
                        text-xs transition-colors duration-200
                        ${isSelected ? 'text-gray-300' : 'text-gray-500'}
                      `}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t
        transition-all duration-300 ease-out
        ${selected.length > 0
          ? 'bg-[#030712]/90 border-white/[0.06] translate-y-0'
          : 'bg-[#030712]/90 border-transparent translate-y-full pointer-events-none'
        }
      `}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Selected pills */}
          <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
            {selected.slice(0, 3).map(id => {
              const product = products.find(p => p.id === id)
              return (
                <span
                  key={id}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.06] text-gray-300 text-xs font-medium whitespace-nowrap"
                >
                  {product?.name}
                </span>
              )
            })}
            {selected.length > 3 && (
              <span className="text-xs text-gray-600 whitespace-nowrap">
                +{selected.length - 3} more
              </span>
            )}
          </div>

          {/* Total + CTA */}
          <div className="flex items-center gap-5 flex-shrink-0">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-gray-600 mb-0.5">Total</div>
              <div className="text-xl font-semibold tracking-tight text-white">${total}</div>
            </div>
            <button
              onClick={handleContinue}
              className="h-11 px-6 rounded-xl bg-white text-[#030712] text-sm font-medium
                hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200
                shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
