import React from 'react'
import ReactDOM from 'react-dom/client'
import './App.css'
import App from './App.jsx'

// Error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{background:'#030712',color:'white',padding:20,fontFamily:'sans-serif'}}>
          <h1>❌ React Error</h1>
          <pre style={{color:'#ef4444',whiteSpace:'pre-wrap'}}>{this.state.error?.message}</pre>
          <pre style={{color:'#9ca3af',whiteSpace:'pre-wrap',fontSize:12}}>{this.state.error?.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
