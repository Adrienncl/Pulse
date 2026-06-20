import { useState, useEffect } from 'react'

const API = '/api'

export default function DeliveryPage({ onNavigate }) {
  const [workflowData, setWorkflowData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    // Try to load from localStorage first
    try {
      const stored = JSON.parse(localStorage.getItem('__WORKFLOW_RESULTS__'))
      if (stored && (stored.summary || stored.workflow_steps || stored.workflow)) {
        setWorkflowData(stored)
        setLoading(false)
        return
      }
    } catch {}

    // If no stored data, fetch from API
    fetch(`${API}/demo/run-complete`)
      .then(res => {
        if (!res.ok) throw new Error('API returned ' + res.status)
        return res.json()
      })
      .then(data => {
        setWorkflowData(data)
        setLoading(false)
      })
      .catch(() => {
        setFetchError(true)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading delivery...</p>
        </div>
      </div>
    )
  }

  // ---------- No project found state ----------
  const hasAnyData =
    workflowData &&
    (workflowData.summary ||
      workflowData.workflow_steps ||
      workflowData.workflow ||
      workflowData.session_id)

  if (!hasAnyData) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-6">📦</div>
          <h2 className="text-2xl font-bold mb-2">No Project Found</h2>
          <p className="text-gray-400 mb-8">
            We couldn't find any project delivery data. Start a new project to see your
            deliverables here.
          </p>
          <button
            onClick={() => onNavigate('products')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-medium transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Start a New Project
          </button>
        </div>
      </div>
    )
  }

  // ---------- Determine data format ----------
  const hasWorkflowSteps = workflowData?.workflow_steps && Array.isArray(workflowData.workflow_steps)
  const hasWorkflowObject = workflowData?.workflow && typeof workflowData.workflow === 'object'

  const wf = workflowData?.workflow || {}
  const steps = workflowData?.workflow_steps || []

  // ---------- Build a robust summary ----------
  const summary = hasWorkflowObject
    ? {
        // Client / business name
        client:
          workflowData.client_name ||
          wf.intake?.business_name ||
          wf.intake?.company_name ||
          wf.intake?.project_name ||
          '',

        // Project name (from intake or top-level)
        project_name:
          wf.intake?.project_name ||
          wf.intake?.business_name ||
          workflowData.project_name ||
          workflowData.client_name ||
          '',

        // Template name
        template:
          wf.template_selection?.template_name ||
          wf.template_selection?.name ||
          wf.template_selection?.selected_template ||
          '',

        // Price
        price: wf.pricing?.price || wf.pricing?.total || 0,

        // Deliverables count
        deliverables:
          wf.delivery?.files_count ||
          wf.delivery?.deliverables_count ||
          wf.delivery?.total_files ||
          0,

        // Human employees
        human_employees: wf.finance?.human_employees || wf.pricing?.human_employees || 0,

        // Website preview URL
        website_url:
          wf.composition?.preview_url ||
          wf.composition?.website_url ||
          wf.composition?.url ||
          '',

        // Status
        status: wf.status || wf.delivery?.status || 'Complete',

        // Invoice info
        invoice_number: wf.invoice?.invoice_number || '',
        invoice_file_path: wf.invoice?.file_path || wf.invoice?.invoice_path || '',
        invoice_amount: wf.invoice?.amount || wf.invoice?.payment?.gross_amount || wf.pricing?.price || 0,
      }
    : workflowData?.summary || {}

  // If the summary came from Format B (workflow_steps), fill in any gaps from the raw data
  if (!hasWorkflowObject && summary) {
    summary.invoice_file_path = summary.invoice_file_path || ''
    summary.invoice_amount = summary.invoice_amount || summary.price || 0
    summary.status = summary.status || 'Complete'
    summary.project_name = summary.project_name || summary.client || ''
  }

  // ---------- Extract agent data ----------
  const finance = hasWorkflowObject ? wf.finance || {} : steps.find(s => s.step === 12)?.result || {}
  const delivery = hasWorkflowObject
    ? wf.delivery || {}
    : steps.find(s => s.step === 11)?.result || {}
  const brand = hasWorkflowObject ? wf.brand || {} : steps.find(s => s.step === 7)?.result || {}
  const social = hasWorkflowObject
    ? wf.social || {}
    : steps.find(s => s.step === 10)?.result || {}
  const invoice = hasWorkflowObject
    ? wf.invoice || {}
    : steps.find(s => s.step === 5)?.result || {}
  const composition = hasWorkflowObject
    ? wf.composition || {}
    : steps.find(s => s.step === 8)?.result || {}
  const intake = hasWorkflowObject ? wf.intake || {} : {}

  // ---------- Website URL (robust resolution) ----------
  const websiteUrl =
    summary.website_url && summary.website_url.startsWith('http')
      ? summary.website_url
      : summary.website_url && summary.website_url.startsWith('/')
        ? summary.website_url
        : composition.preview_url && composition.preview_url.startsWith('http')
          ? composition.preview_url
          : composition.url && composition.url.startsWith('http')
            ? composition.url
            : workflowData?.session_id
              ? `/projects/${workflowData.session_id}/preview.html`
              : null

  // ---------- Invoice download URL ----------
  const invoiceUrl =
    summary.invoice_file_path && summary.invoice_file_path.startsWith('http')
      ? summary.invoice_file_path
      : summary.invoice_file_path && summary.invoice_file_path.startsWith('/')
        ? summary.invoice_file_path
        : invoice.file_path && invoice.file_path.startsWith('http')
          ? invoice.file_path
          : invoice.file_path && invoice.file_path.startsWith('/')
            ? invoice.file_path
            : invoice.invoice_path && invoice.invoice_path.startsWith('http')
              ? invoice.invoice_path
              : invoice.invoice_path && invoice.invoice_path.startsWith('/')
                ? invoice.invoice_path
                : workflowData?.session_id
                  ? `/projects/${workflowData.session_id}/invoice.html`
                  : null

  // ---------- Social posts (handle multiple shapes) ----------
  const socialPosts = social.posts || social.social_posts || social.content || []
  const socialTotal =
    social.total_posts || social.posts?.length || social.social_posts?.length || socialPosts.length || 0

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">📦 Project Delivery</h1>
              <p className="text-gray-400 text-sm mt-1">
                {summary.project_name || summary.client || 'Your Project'} — Complete deliverables
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onNavigate('products')}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
              >
                New Project
              </button>
              <button
                onClick={() => onNavigate('workflow')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm transition"
              >
                View Workflow
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* -------- Project Delivery Banner -------- */}
        <div className="bg-gradient-to-br from-indigo-500/10 via-emerald-500/5 to-transparent border border-indigo-500/20 rounded-2xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">✨ Delivery Complete</h2>
            <p className="text-gray-400 mb-6">
              All assets have been generated and are ready for download.
            </p>
            <div className="flex justify-center gap-8 text-center flex-wrap">
              <div>
                <p className="text-2xl font-bold text-white">
                  {summary.project_name || summary.client || 'Your Project'}
                </p>
                <p className="text-xs text-gray-500">Project Name</p>
              </div>
              <div className="hidden sm:block w-px bg-gray-700" />
              <div>
                <p className="text-2xl font-bold text-emerald-400">
                  {summary.status || 'Complete'}
                </p>
                <p className="text-xs text-gray-500">Status</p>
              </div>
              <div className="hidden sm:block w-px bg-gray-700" />
              <div>
                <p className="text-2xl font-bold text-indigo-400">
                  ${summary.price}
                </p>
                <p className="text-xs text-gray-500">Price Paid</p>
              </div>
            </div>
          </div>
        </div>

        {/* -------- Download All Button -------- */}
        {workflowData?.session_id && (
          <div className="flex justify-center">
            <a
              href={`/projects/${workflowData.session_id}/download-all.zip`}
              className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-base font-semibold transition shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download All Deliverables
              <span className="text-indigo-300 text-sm font-normal">
                ({delivery.files_count || summary.deliverables || 0} files)
              </span>
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* -------- Left Column -------- */}
          <div className="space-y-6">
            {/* Website Preview */}
            <h3 className="text-lg font-semibold">🌐 Generated Website</h3>
            {websiteUrl ? (
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {summary.client?.toLowerCase().replace(/\s+/g, '') || 'preview'}.com
                  </span>
                </div>
                <iframe
                  src={websiteUrl}
                  className="w-full h-96 bg-white"
                  title="Generated Website"
                  sandbox="allow-scripts allow-same-origin"
                />
                <div className="p-4 border-t border-gray-800">
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Open Full Preview
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center">
                <p className="text-gray-500">Website preview not available</p>
              </div>
            )}

            {/* Social Posts */}
            {socialPosts.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">📱 Social Media Posts</h3>
                  <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-full">
                    {socialTotal} posts
                  </span>
                </div>
                <div className="space-y-3">
                  {socialPosts.slice(0, 5).map((post, i) => (
                    <div key={i} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        {post.platform && (
                          <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">
                            {post.platform}
                          </span>
                        )}
                        {post.type && (
                          <span className="text-xs text-gray-500">· {post.type}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-200 leading-relaxed">
                        {post.caption || post.text || post.content}
                      </p>
                      {post.hashtags && post.hashtags.length > 0 && (
                        <p className="text-xs text-indigo-400/70 mt-2">
                          {post.hashtags
                            .map(h => (h.startsWith('#') ? h : `#${h}`))
                            .join('  ')}
                        </p>
                      )}
                      {post.image_url && (
                        <div className="mt-2">
                          <img
                            src={post.image_url}
                            alt="Post visual"
                            className="rounded-lg max-h-48 object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {socialPosts.length > 5 && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    +{socialPosts.length - 5} more posts
                  </p>
                )}
              </div>
            )}
          </div>

          {/* -------- Right Column -------- */}
          <div className="space-y-6">
            {/* Brand Kit */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">🎨 Brand Kit</h3>
              <div className="space-y-3">
                {brand.brand_name && (
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="font-medium">{brand.brand_name}</p>
                      <p className="text-xs text-gray-500">{brand.brand_voice}</p>
                    </div>
                    <div className="flex gap-2">
                      {brand.color_palette &&
                        Object.entries(brand.color_palette).map(([name, color]) => (
                          <div
                            key={name}
                            className="w-6 h-6 rounded-full border border-gray-700"
                            style={{ backgroundColor: color }}
                            title={`${name}: ${color}`}
                          />
                        ))}
                    </div>
                  </div>
                )}
                <a
                  href={
                    workflowData?.session_id
                      ? `/projects/${workflowData.session_id}/logo.svg`
                      : '#'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition"
                >
                  <div>
                    <p className="font-medium">Logo (SVG)</p>
                    <p className="text-xs text-gray-500">Vector logo file</p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </a>
                <a
                  href={
                    workflowData?.session_id
                      ? `/projects/${workflowData.session_id}/brand-guidelines.html`
                      : '#'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition"
                >
                  <div>
                    <p className="font-medium">Brand Guidelines</p>
                    <p className="text-xs text-gray-500">Colors, typography, voice</p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Project Stats */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">📊 Project Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                  <p className="text-xl font-bold text-indigo-400">
                    {summary.price ? `$${summary.price}` : '—'}
                  </p>
                  <p className="text-xs text-gray-500">Package Price</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                  <p className="text-xl font-bold text-emerald-400">
                    {delivery.files_count || summary.deliverables || 0}
                  </p>
                  <p className="text-xs text-gray-500">Files Delivered</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                  <p className="text-xl font-bold text-purple-400">{'< 5 min'}</p>
                  <p className="text-xs text-gray-500">Delivery Time</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                  <p className="text-xl font-bold text-cyan-400">100%</p>
                  <p className="text-xs text-gray-500">AI Generated</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                <p className="text-sm text-emerald-400 font-medium">
                  ✅ Delivery Complete • 0 Human Employees Required
                </p>
              </div>
            </div>

            {/* Invoice */}
            {invoice && (invoice.invoice_number || summary.invoice_number) && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">🧾 Invoice</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {invoice.invoice_number || summary.invoice_number}
                      </p>
                      <p className="text-xs text-gray-500">Invoice Number</p>
                    </div>
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">
                      Paid
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                      <p className="text-lg font-bold text-yellow-400">
                        ${invoice.payment?.gross_amount || summary.invoice_amount || summary.price}
                      </p>
                      <p className="text-xs text-gray-500">Amount Paid</p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                      <p className="text-lg font-bold text-gray-400">
                        {invoice.issue_date || invoice.date || '—'}
                      </p>
                      <p className="text-xs text-gray-500">Issue Date</p>
                    </div>
                  </div>
                  {invoiceUrl && (
                    <a
                      href={invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition"
                    >
                      <div>
                        <p className="font-medium">Download Invoice</p>
                        <p className="text-xs text-gray-500">PDF invoice document</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
