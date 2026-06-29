import React, { useState, useEffect } from 'react'

const API = '/api'

/* ═══════════════════════════════════════════════════════════
   SHARED DESIGN SYSTEM
   ═══════════════════════════════════════════════════════════ */

const scoreColor = (v) => v >= 70 ? '#059669' : v >= 40 ? '#0d9488' : '#dc2626'
const scoreStatus = (v) => v >= 70 ? 'Strong' : v >= 40 ? 'Needs Attention' : 'Critical'
const scoreBg = (v) => v >= 70 ? 'rgba(5, 150, 105, 0.08)' : v >= 40 ? 'rgba(13, 148, 136, 0.08)' : 'rgba(220, 38, 38, 0.08)'

/* ── Gauge ── */
function Gauge({ v = 72, size = 96 }) {
  const sw = 6, r = (size - sw * 2) / 2, c = 2 * Math.PI * r, cx = size / 2, cy = size / 2
  const pct = Math.min(v, 100), col = scoreColor(v)
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={sw} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={sw}
          strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c}
          strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-bold tracking-tight"
        style={{ fontSize: size * 0.3, color: '#1e293b', marginTop: 2 }}>{v}</span>
    </div>
  )
}

/* ── Modern Ring Gauge (replaces RadarChart) ── */
function RingGauge({ pillars }) {
  const entries = Object.entries(pillars || {}).slice(0, 4)
  if (entries.length < 4) return null

  const items = [
    { label: 'Visibility',   key: 'visibility',   color: '#6366f1', icon: '👁' },
    { label: 'Trust',        key: 'trust',        color: '#059669', icon: '🛡' },
    { label: 'Performance',  key: 'performance',  color: '#0d9488', icon: '⚡' },
    { label: 'Conversion',   key: 'conversion',   color: '#dc2626', icon: '🎯' },
  ]

  const scoreMap = {}
  entries.forEach(([k, v]) => { scoreMap[k] = v.score || 0 })

  const Ring = ({ label, score, color, icon, delay = 0 }) => {
    const r = 36, cx = 50, cy = 50, sw = 8, circ = 2 * Math.PI * r
    const pct = Math.min(score, 100) / 100
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div className="relative" style={{ width: 100, height: 100 }}>
          <svg width="100" height="100" viewBox="0 0 100 100" className="transform -rotate-90">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw}
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{ transitionDelay: `${delay}ms` }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-bold" style={{ color, marginTop: 2 }}>{score}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-medium" style={{ color: '#64748b' }}>{icon}</span>
          <span className="text-[10px] font-semibold tracking-tight" style={{ color: '#1e293b' }}>{label}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl"
      style={{ background: 'rgba(248, 250, 252, 0.6)', border: '1px solid rgba(0,0,0,0.03)' }}>
      {items.map((item, i) => (
        <Ring key={item.key} {...item} score={scoreMap[item.key] || 0} delay={i * 100} />
      ))}
    </div>
  )
}

/* ── Issue card ── */
function IssueCard({ severity = 'high', title, impact }) {
  const colors = {
    high: { dot: '#dc2626', bg: 'rgba(220, 38, 38, 0.04)', border: 'rgba(220, 38, 38, 0.08)' },
    medium: { dot: '#0d9488', bg: 'rgba(13, 148, 136, 0.04)', border: 'rgba(13, 148, 136, 0.08)' },
    low: { dot: '#ca8a04', bg: 'rgba(202, 138, 4, 0.04)', border: 'rgba(202, 138, 4, 0.08)' },
  }
  const c = colors[severity] || colors.high
  return (
    <div className="rounded-lg p-3" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <div className="flex items-start gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: c.dot }} />
        <div className="min-w-0">
          <div className="text-sm font-medium" style={{ color: '#1e293b' }}>{title}</div>
          {impact && <div className="text-xs mt-1 leading-relaxed" style={{ color: '#64748b' }}>{impact}</div>}
        </div>
      </div>
    </div>
  )
}

/* ── Logo ── */
const Logo = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className="flex-shrink-0">
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
)

const I = ({ n, s = 18, c = '' }) => {
  const m = {
    search: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10.5" cy="10.5" r="7.5"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>,
    check: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    alert: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    chart: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    card: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="5" width="22" height="14" rx="2" ry="2"/><line x1="1" y1="11" x2="23" y2="11"/></svg>,
    spin: <svg className="animate-spin" width={s} height={s} viewBox="0 0 24 24" fill="none"><circle opacity=".25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/><path opacity=".75" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z"/></svg>,
    arrow: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    sparkles: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>,
    x: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    lock: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  }
  return <span className={`inline-flex items-center justify-center ${c}`}>{m[n] || null}</span>
}

/* ── Pillar detail card (premium) ── */
function PillarDetailCard({ label, score, weight, details, color }) {
  const items = details ? Object.entries(details).filter(([k]) => !['score', 'weight'].includes(k)) : []
  if (items.length === 0) return null

  const passed = (v) => v === true || v === 1 || (typeof v === 'string' && v.length > 0 && v !== '0')
  const pct = items.length > 0 ? Math.round((items.filter(([, v]) => passed(v)).length / items.length) * 100) : 0

  return (
    <div className="rounded-2xl bg-white p-5 sm:p-6" style={{
      border: '1px solid rgba(13, 148, 136, 0.05)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)'
    }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: color }} />
          <span className="text-sm font-semibold tracking-tight" style={{ color: '#1e293b' }}>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tabular-nums" style={{ color: scoreColor(score) }}>{score}</span>
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{ background: scoreBg(score), color: scoreColor(score) }}>
            {scoreStatus(score)}
          </span>
          <span className="text-[9px]" style={{ color: '#cbd5e1' }}>W: {Math.round(weight * 100)}%</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: '#f1f5f9' }}>
        <div className="h-full rounded-full transition-all" style={{
          width: `${pct}%`, background: color, opacity: 0.6
        }} />
      </div>
      <div className="space-y-1.5">
        {items.map(([k, v]) => {
          const ok = passed(v)
          const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          return (
            <div key={k} className="flex items-center gap-2 text-xs" style={{ color: ok ? '#059669' : '#dc2626' }}>
              {ok
                ? <I n="check" s={10} c="text-emerald-500" />
                : <I n="x" s={10} c="text-red-500" />}
              <span style={{ color: ok ? '#475569' : '#1e293b' }}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Action item with checkbox + expandable details ── */
function ActionItem({ action, index, checked, onToggle }) {
  const [expanded, setExpanded] = useState(false)
  const ic = action.impact === 'high' ? '#dc2626' : action.impact === 'medium' ? '#0d9488' : '#059669'
  const categoryLabels = { visibility: 'SEO', trust: 'Security', performance: 'Speed', conversion: 'UX' }
  const cat = categoryLabels[action.category] || action.category || 'General'
  const catColors = { SEO: '#6366f1', Security: '#059669', Speed: '#0d9488', UX: '#dc2626', General: '#64748b' }

  const getDetails = () => {
    const txt = (action.action || '').toLowerCase()
    const details = {
      what: '',
      why: '',
      how: [],
      tip: ''
    }

    // Visibility / SEO
    if (txt.includes('h1') || txt.includes('heading')) {
      details.what = 'Add a clear, descriptive H1 heading to your page.'
      details.why = 'H1 headings tell search engines (and AI) what your page is about. Without one, Google struggles to understand your content hierarchy.'
      details.how = ['Review your page content and identify the main topic.', 'Add a single <h1> tag containing your primary keyword.', 'Ensure only one H1 per page — multiple H1s dilute SEO value.']
      details.tip = 'Your H1 should match the user intent for the page. E.g., "Handmade Leather Bags | Free Shipping" rather than just "Products".'
    } else if (txt.includes('title') || txt.includes('meta description')) {
      details.what = 'Optimize your title tag and meta description for search intent.'
      details.why = 'Titles and descriptions are the first thing users see on Google. Well-crafted ones improve click-through rates by up to 30%.'
      details.how = ['Keep titles between 30-60 characters with primary keyword at the start.', 'Write meta descriptions between 120-160 characters as a compelling ad.', 'Include a call-to-action (Learn More, Shop Now, Get Started).', 'Make each page unique — avoid duplicate titles across your site.']
      details.tip = 'Think of your title as a headline and the meta description as a subtitle. Would you click on it?'
    } else if (txt.includes('og:') || txt.includes('open graph') || txt.includes('twitter')) {
      details.what = 'Add Open Graph and Twitter Card meta tags to your pages.'
      details.why = 'Without OG tags, social platforms (Facebook, LinkedIn, X/Twitter) show generic previews — killing engagement when your content is shared.'
      details.how = ['Add og:title, og:description, and og:image meta tags to your <head>.', 'Add twitter:card, twitter:title, twitter:description for X/Twitter.', 'Ensure og:image is at least 1200x630px for optimal preview.']
      details.tip = 'Use a tool like opengraph.xyz to preview how your page will look when shared on social media.'
    } else if (txt.includes('schema') || txt.includes('structured data') || txt.includes('json-ld')) {
      details.what = 'Implement JSON-LD structured data on your pages.'
      details.why = 'AI search engines (ChatGPT, Gemini, Perplexity) rely on structured data to cite your content. Without it, you\'re invisible to AI-powered search.'
      details.how = ['Identify the most relevant schema type (Article, Product, FAQPage, LocalBusiness, etc.).', 'Generate JSON-LD markup using Google\'s Structured Data Markup Helper.', 'Add the <script type="application/ld+json"> block to your page <head>.', 'Test with Google\'s Rich Results Test tool.']
      details.tip = 'FAQPage and HowTo schemas are particularly effective for AI search visibility — they\'re often featured in Google\'s "People also ask" and AI overviews.'
    } else if (txt.includes('sitemap')) {
      details.what = 'Create and submit an XML sitemap to search engines.'
      details.why = 'Sitemaps help crawlers discover all your pages, especially new or deeply linked content that might otherwise be missed.'
      details.how = ['Generate a sitemap.xml listing all important pages with priority and lastmod.', 'Submit to Google Search Console and Bing Webmaster Tools.', 'Reference the sitemap in your robots.txt file.']
      details.tip = 'Most CMS platforms (WordPress, Shopify, Webflow) have plugins that auto-generate sitemaps.'
    } else if (txt.includes('robots')) {
      details.what = 'Create a robots.txt file with proper crawl directives.'
      details.why = 'Without robots.txt, crawlers may waste budget on admin pages, duplicate content, or infinite crawl loops.'
      details.how = ['Create robots.txt at the root of your domain (/robots.txt).', 'Allow crawling of public content, disallow admin/private areas.', 'Reference your sitemap URL in the file.', 'Test with Google\'s robots.txt Tester.']
      details.tip = 'A basic robots.txt: User-agent: * + Allow: / + Sitemap: https://yoursite.com/sitemap.xml'
    } else if (txt.includes('canonical')) {
      details.what = 'Fix canonical URL tags to prevent duplicate content issues.'
      details.why = 'Canonical tags tell Google which version of a page is the "official" one. Without them, duplicate pages compete against each other in rankings.'
      details.how = ['Ensure each page has a <link rel="canonical"> tag pointing to itself.', 'For pages with URL parameters (sort, filter, ref), set canonical to the clean version.', 'Avoid self-referencing canonicals on paginated pages.']
    // Trust & Security
    } else if (txt.includes('ssl') || txt.includes('certif') || txt.includes('https')) {
      details.what = 'Renew and properly configure your SSL certificate.'
      details.why = 'SSL is a ranking factor and trust signal. Expired or misconfigured SSL triggers browser warnings that scare away visitors.'
      details.how = ['Check your SSL expiry date using an SSL checker tool.', 'Renew via your hosting provider or Let\'s Encrypt (free).', 'Enable HSTS header to force HTTPS connections.', 'Set up auto-renewal to prevent future expirations.']
      details.tip = 'Let\'s Encrypt offers free SSL certificates with auto-renewal via Certbot. Set it and forget it.'
    } else if (txt.includes('hsts') || txt.includes('security header') || txt.includes('csp') || txt.includes('x-frame')) {
      details.what = 'Add missing security headers to your server configuration.'
      details.why = 'Security headers protect your visitors from common attacks (XSS, clickjacking, data injection) and improve your site\'s trust rating.'
      details.how = ['Add Strict-Transport-Security (HSTS) header.', 'Add Content-Security-Policy (CSP) to prevent XSS attacks.', 'Add X-Frame-Options (DENY or SAMEORIGIN) to prevent clickjacking.', 'Add X-Content-Type-Options: nosniff to prevent MIME sniffing.']
      details.tip = 'Start with a permissive CSP (Content-Security-Policy: frame-ancestors \'self\') and tighten gradually. Use report-uri to catch violations without breaking your site.'
    } else if (txt.includes('privacy')) {
      details.what = 'Add a clear privacy policy page to your website.'
      details.why = 'Privacy policies are legally required in many jurisdictions (GDPR, CCPA, LGPD). Missing one exposes you to fines and erodes visitor trust.'
      details.how = ['Create a privacy policy covering: data collected, how it\'s used, cookies, third-party services.', 'Add a link in the footer and in cookie consent banners.', 'Use a privacy policy generator (like PrivacyPolicies.com) as a starting point.']
      details.tip = 'Include the date of last update and make sure the policy matches your actual data practices.'
    } else if (txt.includes('cookie') || txt.includes('consent')) {
      details.what = 'Implement a cookie consent banner on your site.'
      details.why = 'GDPR and ePrivacy directives require explicit consent before setting non-essential cookies. Non-compliance can result in significant fines.'
      details.how = ['Choose a consent management platform (Osano, Cookiebot, Finsweet Cookie Consent).', 'Configure cookie categories (Essential, Analytics, Marketing).', 'Implement the banner with accept/decline options.', 'Block third-party scripts until consent is given.']
    } else if (txt.includes('contact')) {
      details.what = 'Make your contact information easy to find.'
      details.why = 'Visitors who can\'t find contact info are less likely to trust your business and more likely to bounce. Google also uses contact info as a trust signal.'
      details.how = ['Add a Contact page with email, phone, and physical address.', 'Display contact info in the header or footer of every page.', 'Add schema markup (LocalBusiness or Organization) with contact details.']
    // Performance
    } else if (txt.includes('image') || txt.includes('alt') || txt.includes('img')) {
      details.what = 'Optimize your images and add descriptive alt text.'
      details.why = 'Missing alt text hurts accessibility (screen readers) and SEO. Unoptimized images slow down page load and waste bandwidth.'
      details.how = ['Add descriptive alt text to every <img> tag (what does the image show?).', 'Compress images using tools like TinyPNG, Squoosh, or ImageOptim.', 'Convert to modern formats (WebP, AVIF) for smaller file sizes.', 'Add loading="lazy" to below-the-fold images.']
      details.tip = 'Alt text should describe the image content naturally, not just stuff keywords. E.g., "Fresh croissants on a wooden counter" not "bakery bread pastry".'
    } else if (txt.includes('css') || txt.includes('js') || txt.includes('minif')) {
      details.what = 'Minify and bundle your CSS and JavaScript files.'
      details.why = 'Excessive or unminified CSS/JS files increase page load time. Every extra HTTP request and kilobyte adds latency.'
      details.how = ['Use a build tool (Webpack, Vite, esbuild) to bundle assets.', 'Enable minification to remove whitespace and comments.', 'Remove unused CSS rules.', 'Defer non-critical JavaScript with async/defer attributes.']
    } else if (txt.includes('mobile') || txt.includes('viewport')) {
      details.what = 'Improve your mobile experience with proper viewport and responsive design.'
      details.why = 'Over 60% of web traffic is mobile. Google uses mobile-first indexing. A poor mobile experience directly costs you rankings and conversions.'
      details.how = ['Add <meta name="viewport" content="width=device-width, initial-scale=1">', 'Test your site on Google\'s Mobile-Friendly Test.', 'Ensure buttons/taps are at least 48px for touch targets.', 'Use responsive CSS with media queries for different screen sizes.']
    } else if (txt.includes('lcp') || txt.includes('speed') || txt.includes('load') || txt.includes('performance')) {
      details.what = 'Improve page load speed, especially Largest Contentful Paint (LCP).'
      details.why = 'Google considers page speed a ranking factor. Every 1-second delay drops customer satisfaction by 16%. 53% of mobile users leave if a page takes over 3 seconds.'
      details.how = ['Optimize server response time (TTFB < 200ms).', 'Implement lazy loading for images and iframes.', 'Use a CDN for static assets.', 'Preload key resources (hero image, fonts, critical CSS).', 'Reduce render-blocking resources.']
    // Conversion
    } else if (txt.includes('cta') || txt.includes('button') || txt.includes('call to action')) {
      details.what = 'Improve your primary Call-to-Action (CTA).'
      details.why = 'A weak or hidden CTA is the #1 conversion killer. If visitors can\'t figure out what to do next, they\'ll leave.'
      details.how = ['Place your primary CTA above the fold (visible without scrolling).', 'Use actionable text: "Get Started Free", "Book a Demo", "Shop Now".', 'Make it visually distinct — contrasting color, clear button shape.', 'Test one CTA per page — too many choices paralyze users.']
      details.tip = 'The best CTAs are specific about what happens next. "Get Your Free Audit" converts better than "Submit".'
    } else if (txt.includes('form') || txt.includes('field')) {
      details.what = 'Simplify your forms to reduce friction.'
      details.why = 'Every additional form field reduces conversion rate by 10-15%. Long forms intimidate users and increase abandonment.'
      details.how = ['Reduce fields to the absolute minimum (name + email is often enough).', 'Use inline validation to show errors immediately.', 'Add a progress bar for multi-step forms.', 'Enable autofill with proper name/email/tel attributes.']
    } else if (txt.includes('checkout')) {
      details.what = 'Simplify your checkout process.'
      details.why = 'Nearly 70% of online shopping carts are abandoned. A complicated checkout process is the #1 reason.'
      details.how = ['Enable guest checkout — don\'t force account creation.', 'Show a progress indicator (steps 1/3, 2/3, 3/3).', 'Display trust badges (SSL, payment icons) near the payment button.', 'Offer multiple payment methods (card, PayPal, Apple Pay).']
    } else if (txt.includes('navigation') || txt.includes('nav') || txt.includes('menu')) {
      details.what = 'Simplify your navigation structure.'
      details.why = 'Too many navigation options create choice paralysis. Users should find what they need in 3 clicks or less.'
      details.how = ['Limit primary navigation to 5-7 items.', 'Add a search bar for content-heavy sites.', 'Use clear, descriptive labels (avoid jargon).', 'Include breadcrumb navigation for deeper pages.']
    } else if (txt.includes('trust') || txt.includes('testimonial') || txt.includes('review') || txt.includes('badge')) {
      details.what = 'Add social proof elements near your conversion points.'
      details.why = 'Trust signals (testimonials, reviews, security badges) increase conversion rates by up to 30%. Visitors need reassurance before taking action.'
      details.how = ['Add customer testimonials near CTAs and checkout.', 'Display trust badges (SSL, payment security, money-back guarantee).', 'Show real-time social proof ("27 people are viewing this").', 'Include review ratings and count.']
    } else {
      // Generic fallback
      details.what = 'Review and address this improvement point.'
      details.why = 'Each identified issue represents a real or potential revenue leakage point. Addressing it systematically improves your overall Pulse Score.'
      details.how = ['Identify which pages or sections are affected.', 'Research best practices for this specific issue.', 'Implement the fix and monitor the impact on your score.', 'Run a follow-up audit to confirm improvement.']
      details.tip = 'Even small improvements compound over time. Focus on high-impact, low-effort items first.'
    }
    return details
  }

  const details = getDetails()

  return (
    <div>
      <div className="p-3 rounded-lg text-sm transition-all cursor-pointer" style={{
        background: checked ? 'rgba(5, 150, 105, 0.03)' : 'rgba(30, 41, 59, 0.02)',
        borderLeft: `3px solid ${checked ? '#059669' : ic}`,
        opacity: checked ? 0.6 : 1,
      }} onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-2.5">
          <button onClick={(e) => { e.stopPropagation(); onToggle(index) }}
            className="mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              borderColor: checked ? '#059669' : '#cbd5e1',
              background: checked ? '#059669' : 'transparent',
            }}>
            {checked && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className="font-medium mb-1" style={{ color: checked ? '#64748b' : '#1e293b' }}>
              <span style={{ color: '#64748b' }} className="mr-1.5">{action.priority}.</span>
              {action.action}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{
                background: `${catColors[cat]}15`,
                color: catColors[cat],
              }}>{cat}</span>
              <span className="text-[10px]" style={{ color: ic, fontWeight: 600 }}>
                P{action.priority}
              </span>
              <span className="text-[10px]" style={{ color: '#64748b' }}>
                Effort: {action.effort === 'low' ? '⚡ Quick' : action.effort === 'medium' ? '📐 Moderate' : '🏗️ Major'}
              </span>
              <span className="text-[9px] ml-auto transition-transform" style={{ color: '#cbd5e1', transform: expanded ? 'rotate(180deg)' : '' }}>
                ▼
              </span>
            </div>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="mx-3 mb-2 p-4 rounded-xl text-xs leading-relaxed animate-fadeUp" style={{
          background: '#f8fafc',
          border: '1px solid rgba(13, 148, 136, 0.06)',
          marginTop: '-2px',
        }}>
          <div className="mb-3">
            <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#0d9488' }}>What to do</span>
            <p className="mt-1" style={{ color: '#1e293b' }}>{details.what}</p>
          </div>
          <div className="mb-3">
            <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#dc2626' }}>Why it matters</span>
            <p className="mt-1" style={{ color: '#64748b' }}>{details.why}</p>
          </div>
          <div className="mb-2">
            <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#059669' }}>How to fix</span>
            <ol className="mt-1 space-y-1.5" style={{ color: '#1e293b' }}>
              {details.how.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0" style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          {details.tip && (
            <div className="mt-2 p-2.5 rounded-lg text-[11px]" style={{ background: 'rgba(13, 148, 136, 0.05)', color: '#64748b', border: '1px solid rgba(13, 148, 136, 0.06)' }}>
              💡 <span className="font-medium" style={{ color: '#0d9488' }}>Tip:</span> {details.tip}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Score history mini chart ── */
function ScoreHistoryChart({ history }) {
  if (!history || history.length < 2) return null
  const maxV = Math.max(...history.map(h => h.score), 100)
  const minV = Math.min(...history.map(h => h.score), 0)
  const range = maxV - minV || 1
  const w = history.length * 40, h = 120, pad = 20
  const cw = w - pad * 2, ch = h - pad * 2

  const points = history.map((entry, i) => {
    const x = pad + (i / (history.length - 1)) * cw
    const y = pad + ch - ((entry.score - minV) / range) * ch
    return { x, y, ...entry }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaD = pathD + ` L${points[points.length - 1].x.toFixed(1)},${(pad + ch).toFixed(1)} L${points[0].x.toFixed(1)},${(pad + ch).toFixed(1)} Z`

  return (
    <div className="rounded-2xl bg-white p-5 sm:p-6" style={{
      border: '1px solid rgba(13, 148, 136, 0.05)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)'
    }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>Score History</span>
        <span className="h-px flex-1" style={{ background: 'rgba(13, 148, 136, 0.05)' }} />
        <span className="text-[9px]" style={{ color: '#cbd5e1' }}>Last {history.length} scans</span>
      </div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        {[0, 0.25, 0.5, 0.75, 1].map(l => {
          const y = pad + ch - l * ch
          return (
            <g key={l}>
              <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="#e2e8f0" strokeWidth="0.5" />
              <text x={pad - 4} y={y + 3} textAnchor="end" fill="#cbd5e1" fontSize="8">
                {Math.round(minV + l * range)}
              </text>
            </g>
          )
        })}
        <path d={areaD} fill="rgba(13, 148, 136, 0.06)" />
        <path d={pathD} fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#0d9488" strokeWidth="2" />
            <text x={p.x} y={pad + ch + 12} textAnchor="middle" fill="#64748b" fontSize="7">
              {new Date(p.timestamp).toLocaleDateString('fr', { month: 'short', day: 'numeric' })}
            </text>
            <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#1e293b" fontSize="9" fontWeight="700">
              {p.score}
            </text>
          </g>
        ))}
      </svg>
      {history.length >= 2 && (
        <div className="flex items-center justify-center gap-4 mt-2 text-[10px]" style={{ color: '#64748b' }}>
          <span>First: <strong style={{ color: '#1e293b' }}>{history[0].score}</strong></span>
          <span>Latest: <strong style={{ color: '#1e293b' }}>{history[history.length - 1].score}</strong></span>
          <span>Change: <strong style={{
            color: history[history.length - 1].score >= history[0].score ? '#059669' : '#dc2626'
          }}>
            {history[history.length - 1].score - history[0].score > 0 ? '+' : ''}
            {history[history.length - 1].score - history[0].score}
          </strong></span>
        </div>
      )}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════
   RESULTSPAGE — Pulse Score Breakdown
   ═══════════════════════════════════════════════════════════ */

export default function ResultsPage({ result, taskId, onNavigate }) {
  const [paid, setPaid] = useState(result?.paid || false)
  const [doneItems, setDoneItems] = useState({})
  const [scoreHistory, setScoreHistory] = useState([])
  const [stripeLoading, setStripeLoading] = useState(null)
  const [stripeError, setStripeError] = useState('')

  // Load score history from localStorage
  useEffect(() => {
    if (result?.domain) {
      try {
        const stored = JSON.parse(localStorage.getItem('rf_history_' + result.domain) || '[]')
        setScoreHistory(stored)
        const last = stored[stored.length - 1]
        if (!last || last.score !== sc || Date.now() - new Date(last.timestamp).getTime() > 60000) {
          const updated = [...stored, { score: sc, timestamp: new Date().toISOString(), taskId }].slice(-10)
          localStorage.setItem('rf_history_' + result.domain, JSON.stringify(updated))
          setScoreHistory(updated)
        }
      } catch (e) { /* ignore */ }
    }
  }, [result?.domain])

  // Load saved checkboxes
  useEffect(() => {
    if (result?.domain) {
      try {
        const saved = JSON.parse(localStorage.getItem('rf_done_' + result.domain + '_' + taskId) || '{}')
        setDoneItems(saved)
      } catch (e) { /* ignore */ }
    }
  }, [result?.domain, taskId])

  // Loading state: show spinner instead of score 0 flash
  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'rgba(13, 148, 136, 0.06)' }}>
          <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#0d9488" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold" style={{ color: '#1e293b' }}>Loading your report…</h2>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>Please wait</p>
      </div>
    )
  }

  const sc = result?.score || 0
  const pillars = result?.pillars || {}
  const pillarEntries = Object.entries(pillars).slice(0, 4)

  const goToStripe = async (type) => {
    setStripeLoading(type)
    setStripeError('')
    try {
      const res = await fetch(`/api/rankfix/checkout?task_id=${taskId}`, { method: 'POST' })
      const data = await res.json()
      if (data.mode === 'live' && data.url) {
        window.location.href = data.url
        return
      }
      // Simulated — just mark paid
      setPaid(true)
      if (result) result.paid = true
    } catch (e) {
      setStripeError('Stripe temporarily unavailable. Please try again.')
    } finally {
      setStripeLoading(null)
    }
  }

  const toggleDone = (idx) => {
    const next = { ...doneItems, [idx]: !doneItems[idx] }
    setDoneItems(next)
    try {
      localStorage.setItem('rf_done_' + result.domain + '_' + taskId, JSON.stringify(next))
    } catch (e) { /* ignore */ }
  }

  const aiSummary = sc >= 80
    ? 'Your website is showing strong revenue performance. Maintaining current optimizations and monitoring for regressions will keep you ahead of competitors.'
    : sc >= 50
      ? 'Your site has a solid foundation but room for improvement. Addressing conversion and trust factors will unlock substantial growth.'
      : 'Several areas need attention — particularly in conversion optimization and performance. Addressing these will have a strong impact on your bottom line.'

  const pillarColors = { visibility: '#6366f1', trust: '#059669', performance: '#0d9488', conversion: '#dc2626' }

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: '#f8fafc', color: '#1e293b' }}>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{
        background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        borderBottom: '1px solid rgba(13, 148, 136, 0.06)'
      }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={20} />
            <span className="text-sm font-semibold tracking-tight" style={{ color: '#1e293b' }}>Pulse</span>
          </div>
          <div className="flex items-center gap-3">
            {paid && (
              <span className="text-[8px] font-semibold uppercase tracking-widest px-2 py-1 rounded-full"
                style={{ background: 'rgba(5, 150, 105, 0.08)', color: '#059669' }}>
                Premium Report
              </span>
            )}
            <button onClick={() => onNavigate('client-dashboard', { result, taskId })}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-[#0d9488]"
              style={{ color: '#64748b' }}>
              <I n="chart" s={12} />
              Dashboard
            </button>
            <button onClick={() => onNavigate('landing')}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-[#0d9488]"
              style={{ color: '#64748b' }}>
              <I n="arrow" s={12} />
              New scan
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-16 relative z-10">

        {/* ═══ SCORE + GAUGE + AI SUMMARY + RADAR (paid) ═══ */}
        <section className="max-w-4xl mx-auto px-6 mb-10 animate-fadeUp">
          <div className="rounded-2xl bg-white p-6 sm:p-8" style={{
            boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(13, 148, 136, 0.06)'
          }}>
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6">
              <Gauge v={sc} size={96} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h1 className="font-display text-[1.6rem] sm:text-[1.8rem] leading-[1.0] tracking-[-0.03em]"
                    style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, color: '#1e293b' }}>
                    Pulse Score
                  </h1>
                  <span className="text-lg font-semibold tracking-tight" style={{ color: scoreColor(sc) }}>{sc}</span>
                  <span className="text-lg" style={{ color: '#64748b' }}>/100</span>
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{
                    background: scoreBg(sc), color: scoreColor(sc)
                  }}>{scoreStatus(sc)}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>
                  {aiSummary}
                </p>
              </div>
            </div>

            {paid ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RingGauge pillars={pillars} />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>Performance Breakdown</span>
                    <span className="h-px flex-1" style={{ background: 'rgba(13, 148, 136, 0.05)' }} />
                  </div>
                  <div className="space-y-3">
                    {pillarEntries.map(([k, v], i) => {
                      const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                      const val = v.score || 0
                      return (
                        <div key={k} className="group">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium tracking-tight" style={{ color: '#475569' }}>{label}</span>
                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                              <span className="text-xs font-semibold tabular-nums" style={{ color: scoreColor(val) }}>{val}</span>
                              <span className="text-[8px] font-medium px-1 py-0.5 rounded" style={{
                                background: scoreBg(val), color: scoreColor(val)
                              }}>{scoreStatus(val)}</span>
                            </div>
                          </div>
                          <div className="h-[3px] rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
                            <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{
                              width: `${val}%`,
                              backgroundColor: scoreColor(val),
                              transitionDelay: `${i * 120}ms`
                            }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>Performance Breakdown</span>
                  <span className="h-px flex-1" style={{ background: 'rgba(13, 148, 136, 0.05)' }} />
                </div>
                <div className="space-y-3">
                  {pillarEntries.map(([k, v], i) => {
                    const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    const val = v.score || 0
                    return (
                      <div key={k} className="group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium tracking-tight" style={{ color: '#475569' }}>{label}</span>
                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                            <span className="text-xs font-semibold tabular-nums" style={{ color: scoreColor(val) }}>{val}</span>
                            <span className="text-[8px] font-medium px-1 py-0.5 rounded" style={{
                              background: scoreBg(val), color: scoreColor(val)
                            }}>{scoreStatus(val)}</span>
                          </div>
                        </div>
                        <div className="h-[3px] rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
                          <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{
                            width: `${val}%`,
                            backgroundColor: scoreColor(val),
                            transitionDelay: `${i * 120}ms`
                          }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {result?.display_url && (
              <div className="mt-6 pt-4 text-[10px] text-center sm:text-left" style={{ borderTop: '1px solid rgba(13, 148, 136, 0.04)', color: '#cbd5e1' }}>
                Scanned: <span style={{ color: '#64748b' }}>{result.display_url}</span>
                {result.scan_duration_s && (
                  <span> · <span style={{ color: '#64748b' }}>{result.scan_duration_s}s</span></span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ═══ PREMIUM: INVOICE ═══ */}
        {paid && taskId && (
          <section className="max-w-4xl mx-auto px-6 mb-6 animate-fadeUp">
            <div className="rounded-2xl p-5 text-center" style={{
              background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.04), rgba(5, 150, 105, 0.02))',
              border: '1px solid rgba(5, 150, 105, 0.12)'
            }}>
              <div className="text-sm font-semibold mb-1" style={{ color: '#059669' }}>Payment Confirmed</div>
              <p className="text-xs mb-3" style={{ color: '#64748b' }}>Your invoice is available for download.</p>
              <a href={`/api/rankfix/invoice/${taskId}`} target="_blank" rel="noopener"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                style={{ background: '#059669' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Invoice
              </a>
            </div>
          </section>
        )}

        {/* ═══ PREMIUM: AGENT DETAILS ═══ */}
        {paid && (
          <section className="max-w-4xl mx-auto px-6 mb-10 animate-fadeUp">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#0d9488' }}>Agent Details</span>
              <span className="h-px flex-1" style={{ background: 'rgba(13, 148, 136, 0.05)' }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pillarEntries.map(([k, v]) => (
                <PillarDetailCard
                  key={k}
                  label={k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  score={v.score || 0}
                  weight={v.weight || 0}
                  details={v.details}
                  color={pillarColors[k] || '#0d9488'}
                />
              ))}
            </div>
          </section>
        )}

        {/* ═══ AMÉLIORATIONS + ACTIONS ═══ */}
        <section className="max-w-4xl mx-auto px-6 mb-10">
          {paid ? (
            <div>
              {result?.action_plan?.length > 0 && (
                <div className="rounded-2xl bg-white p-6" style={{
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(13, 148, 136, 0.05)'
                }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#0d9488' }}>Action Plan</span>
                    <span className="h-px flex-1" style={{ background: 'rgba(13, 148, 136, 0.06)' }} />
                    <span className="text-[9px]" style={{ color: '#64748b' }}>
                      {Object.values(doneItems).filter(Boolean).length}/{result.action_plan.length} done
                    </span>
                  </div>
                  <div className="space-y-2">
                    {result.action_plan.map((a, i) => (
                      <ActionItem key={i} action={a} index={i} checked={!!doneItems[i]} onToggle={toggleDone} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {result?.améliorations?.length > 0 && (
                <div className="rounded-2xl bg-white p-6" style={{
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(13, 148, 136, 0.05)'
                }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#dc2626' }}>Points d'amélioration</span>
                    <span className="h-px flex-1" style={{ background: 'rgba(220, 38, 38, 0.06)' }} />
                  </div>
                  <div className="space-y-2">
                    {result.améliorations.map((x, i) => {
                      const sev = i === 0 ? 'high' : i === 1 ? 'medium' : 'low'
                      let impact
                      const itemLower = (x || '').toLowerCase()
                      if (i === 0) {
                        impact = 'Directly impacts your revenue potential.'
                      } else if (itemLower.includes('ssl') || itemLower.includes('security') || itemLower.includes('https')) {
                        impact = 'Security issues erode visitor trust and increase bounce rates.'
                      } else if (itemLower.includes('meta') || itemLower.includes('title') || itemLower.includes('og:')) {
                        impact = 'Poor metadata reduces click-through rates and organic traffic.'
                      } else if (itemLower.includes('schema') || itemLower.includes('structured') || itemLower.includes('ai search')) {
                        impact = 'Missing structured data limits visibility in AI-powered search results.'
                      } else if (itemLower.includes('mobile') || itemLower.includes('viewport')) {
                        impact = 'Poor mobile experience drives away over 60% of potential visitors.'
                      } else if (itemLower.includes('cta') || itemLower.includes('conversion') || itemLower.includes('form')) {
                        impact = 'Conversion friction directly reduces lead generation and sales.'
                      } else if (itemLower.includes('speed') || itemLower.includes('load') || itemLower.includes('performance')) {
                        impact = 'Slow pages increase abandonment rates and hurt SEO rankings.'
                      } else {
                        impact = 'May limit market share and growth potential.'
                      }
                      return <IssueCard key={i} severity={sev} title={x} impact={impact} />
                    })}
                  </div>
                </div>
              )}
              {result?.action_plan?.length > 0 && (
                <div className="rounded-2xl bg-white p-6 mx-auto" style={{
                  maxWidth: 640,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(13, 148, 136, 0.05)'
                }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#0d9488' }}>Priority Actions</span>
                    <span className="h-px flex-1" style={{ background: 'rgba(13, 148, 136, 0.06)' }} />
                  </div>
                  <div className="space-y-2">
                    {result.action_plan.slice(0, 6).map((a, i) => {
                      const ic = a.impact === 'high' ? '#dc2626' : a.impact === 'medium' ? '#0d9488' : '#059669'
                      return (
                        <div key={i} className="p-3 rounded-lg text-sm" style={{
                          background: 'rgba(30, 41, 59, 0.02)',
                          borderLeft: `3px solid ${ic}`
                        }}>
                          <div className="font-medium mb-1" style={{ color: '#1e293b' }}>
                            <span style={{ color: '#64748b' }} className="mr-1.5">{a.priority}.</span>
                            {a.action}
                          </div>
                          <div className="flex items-center gap-3 text-xs" style={{ color: '#64748b' }}>
                            <span>Impact: <span style={{ color: ic, fontWeight: 600 }}>{a.impact}</span></span>
                            <span>·</span>
                            <span>Effort: {a.effort === 'low' ? 'Quick fix' : a.effort === 'medium' ? 'Moderate' : 'Significant'}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ═══ PREMIUM: SCORE HISTORY + EXPORT ═══ */}
        {paid && (
          <section className="max-w-4xl mx-auto px-6 mb-10 animate-fadeUp">
            {scoreHistory.length >= 2 && <ScoreHistoryChart history={scoreHistory} />}
            <div className="mt-4 text-center">
              <button onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: 'rgba(13, 148, 136, 0.08)',
                  color: '#0d9488',
                  border: '1px solid rgba(13, 148, 136, 0.12)'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(13, 148, 136, 0.15)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(13, 148, 136, 0.08)'}>
                <I n="card" s={12} />
                Export PDF / Print
              </button>
            </div>
          </section>
        )}

        {/* ── RANKING ── */}
        {result?.ranking && (result.ranking.position || result.ranking.percentile) && (
          <section className="max-w-4xl mx-auto px-6 py-8 animate-fadeUp">
            <div className="rounded-2xl p-6" style={{
              background: 'linear-gradient(135deg, rgba(202, 138, 4, 0.06), rgba(13, 148, 136, 0.04))',
              border: '1px solid rgba(202, 138, 4, 0.15)'
            }}>
              <div className="flex items-center gap-2 mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="1.5">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 6 9 6 9z"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 18 9 18 9z"/>
                  <path d="M12 9v8"/><path d="M8 21h8"/><path d="M12 17a4 4 0 0 0 4-4H8a4 4 0 0 0 4 4z"/>
                </svg>
                <h2 className="text-sm font-semibold" style={{ color: '#1e293b' }}>Competitive Ranking</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-xl p-4">
                  <div className="text-xs" style={{ color: '#64748b' }}>Position</div>
                  <div className="text-xl font-bold mt-1" style={{ color: '#ca8a04' }}>{result.ranking.position || result.ranking.overall_percentile + '%' || 'N/A'}</div>
                  {result.ranking.position_label && <div className="text-xs font-medium mt-0.5" style={{ color: '#059669' }}>{result.ranking.position_label}</div>}
                </div>
                {result.ranking.industry && (
                  <div className="bg-white rounded-xl p-4">
                    <div className="text-xs" style={{ color: '#64748b' }}>Industry</div>
                    <div className="text-lg font-bold mt-1" style={{ color: '#1e293b' }}>{result.ranking.industry}</div>
                  </div>
                )}
              </div>
              {(result.ranking.strengths?.length > 0 || result.ranking.weaknesses?.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {result.ranking.strengths?.length > 0 && (
                    <div className="bg-white rounded-xl p-4">
                      <div className="text-xs font-medium mb-2" style={{ color: '#059669' }}>Strengths</div>
                      {result.ranking.strengths.map((s, i) => <div key={i} className="flex items-start gap-2 text-xs py-0.5"><span style={{ color: '#059669' }}>+</span><span style={{ color: '#4a3f35' }}>{s}</span></div>)}
                    </div>
                  )}
                  {result.ranking.weaknesses?.length > 0 && (
                    <div className="bg-white rounded-xl p-4">
                      <div className="text-xs font-medium mb-2" style={{ color: '#dc2626' }}>To Improve</div>
                      {result.ranking.weaknesses.map((s, i) => <div key={i} className="flex items-start gap-2 text-xs py-0.5"><span style={{ color: '#dc2626' }}>-</span><span style={{ color: '#4a3f35' }}>{s}</span></div>)}
                    </div>
                  )}
                </div>
              )}
              {result.ranking.summary && <div className="text-xs leading-relaxed" style={{ color: '#6b5d4e' }}>{result.ranking.summary}</div>}
            </div>
          </section>
        )}

        {/* STRIPE CTA (only when NOT paid) */}
        {!paid && (
          <section className="max-w-3xl mx-auto px-6 mb-10">
            <div className="rounded-2xl bg-white p-6 sm:p-8 text-center" style={{
              boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)',
              border: '1px solid rgba(13, 148, 136, 0.05)'
            }}>
              <h2 className="text-lg font-semibold tracking-tight mb-1" style={{ color: '#1e293b' }}>Get the full report</h2>
              <p className="text-sm mb-6" style={{ color: '#64748b' }}>
                Complete revenue performance report with prioritized fixes and monitoring.
              </p>
              {stripeError && (
                <div className="mb-4 p-3 rounded-xl text-xs font-medium"
                  style={{ background: 'rgba(220, 38, 38, 0.08)', color: '#dc2626' }}>
                  {stripeError}
                </div>
              )}
              <div className="flex justify-center">
                <button onClick={() => goToStripe('report')}
                  className="btn-amber p-4 rounded-xl text-left transition-all inline-flex items-center gap-4" style={{ maxWidth: 480 }}>
                  <div className="flex items-center gap-2 text-sm font-semibold mb-0.5 text-white">
                    {stripeLoading === 'report' ? (
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                      </svg>
                    ) : <I n="card" s={16} c="text-white" />}
                    Full Report — $29
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Detailed report + prioritized recommendations</p>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="max-w-4xl mx-auto px-6 pt-8 text-center" style={{ borderTop: '1px solid rgba(13, 148, 136, 0.04)' }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Logo size={14} />
            <span className="text-[11px] font-medium" style={{ color: '#64748b' }}>Pulse</span>
          </div>
          <p className="text-[9px]" style={{ color: '#cbd5e1' }}>Pulse · Powered by Hermes Agent · Nemotron 3 · Stripe</p>
        </footer>
      </main>
    </div>
  )
}