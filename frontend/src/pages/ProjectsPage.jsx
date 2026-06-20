import { useState, useEffect } from 'react'

const ArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
)

const SparkleIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" /></svg>
)

export default function ProjectsPage({ onNavigate }) {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('__PROJECTS__') || '[]')
      setProjects(stored.reverse()) // newest first
    } catch {}
  }, [])

  const viewProject = (project) => {
    localStorage.setItem('__WORKFLOW_RESULTS__', JSON.stringify(project))
    onNavigate('delivery')
  }

  const clearAll = () => {
    if (confirm('Delete all projects?')) {
      localStorage.removeItem('__PROJECTS__')
      setProjects([])
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Header */}
      <nav className="sticky top-0 z-50 glass-strong">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft /> Back
          </button>
          <div className="flex items-center gap-2">
            <SparkleIcon size={16} />
            <span className="font-semibold text-sm text-white">My Projects</span>
          </div>
          {projects.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-gray-600 hover:text-red-400 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Projects</h1>
          <p className="text-gray-500 text-sm">{projects.length} project{projects.length !== 1 ? 's' : ''} completed</p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800/50 mb-6">
              <SparkleIcon size={32} className="text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No projects yet</h3>
            <p className="text-gray-600 text-sm mb-6">Start your first project to see it here.</p>
            <button
              onClick={() => onNavigate('products')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-all"
            >
              Start a Project
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project, i) => (
              <div
                key={project.id || i}
                className="glass-card rounded-2xl p-5 cursor-pointer group hover-lift"
                onClick={() => viewProject(project)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
                        <SparkleIcon size={16} className="text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                          {project.brief?.clientName || 'Untitled Project'}
                        </h3>
                        <p className="text-xs text-gray-500 capitalize">
                          {project.brief?.businessType || 'Unknown type'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 ml-13">
                      {project.brief?.description || 'No description'}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-emerald-400">
                      ${project.pricing?.price || project.pricing?.breakdown?.total || '—'}
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1">
                      {project.timestamp ? new Date(project.timestamp).toLocaleDateString() : '—'}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-3 ml-13">
                  {project.brief?.needs?.map(n => (
                    <span key={n} className="px-2 py-0.5 rounded-full bg-gray-800/50 text-gray-500 text-[10px] capitalize">
                      {n}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px]">
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
