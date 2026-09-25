import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('GlobalErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.removeItem('jira_kanban_store_v1');
      localStorage.removeItem('jira_active_workspace_user');
    } catch (e) {}
    window.location.href = window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#091E42] text-white flex flex-col items-center justify-center p-6 select-none font-sans">
          <div className="max-w-xl w-full bg-[#172B4D] border border-blue-400/40 rounded-xl p-8 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl font-bold">
                !
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Application Render Notice</h2>
                <p className="text-xs text-blue-200">A component state recovery is required</p>
              </div>
            </div>

            <div className="p-3 bg-[#091E42] text-rose-300 text-xs rounded border border-rose-500/30 font-mono overflow-x-auto whitespace-pre-wrap max-h-48">
              {this.state.error?.toString() || 'Unknown runtime error'}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-[#0052CC] hover:bg-[#0065FF] text-white text-xs font-bold rounded shadow transition-all cursor-pointer"
              >
                Reset Store & Continue to Workspace
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded transition-all cursor-pointer"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <GlobalErrorBoundary>
    <App />
  </GlobalErrorBoundary>
);
