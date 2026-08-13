import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const toastStyle = {
  style: {
    background: '#1a1a1a',
    color: '#fff',
    borderRadius: '12px',
    fontWeight: '600'
  }
};

export default function ServerHealth() {
  const outletContext = useOutletContext() || {};
  const isDarkMode = outletContext.isDarkMode !== undefined 
    ? outletContext.isDarkMode 
    : document.documentElement.classList.contains('dark');

  const [grafanaUrl, setGrafanaUrl] = useState(() => {
    return localStorage.getItem('grafana_dashboard_url') || '';
  });
  const [tempUrl, setTempUrl] = useState(grafanaUrl);
  const [isEditing, setIsEditing] = useState(!grafanaUrl);
  const [serverStatus, setServerStatus] = useState('checking'); // 'up', 'down', 'checking'
  const [checkingStatus, setCheckingStatus] = useState(false);

  const checkServerStatus = async () => {
    setCheckingStatus(true);
    try {
      // Ping a public REST endpoint on the main port to test server connection
      const res = await axiosInstance.get('/subscriptions/plans');
      if (res.status === 200) {
        setServerStatus('up');
      } else {
        setServerStatus('down');
      }
    } catch (err) {
      console.error("Failed to fetch backend health status:", err);
      setServerStatus('down');
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkServerStatus();
  }, []);

  const handleSaveUrl = (e) => {
    e.preventDefault();
    if (!tempUrl.trim()) {
      toast.error('Please enter a valid URL', toastStyle);
      return;
    }
    // Automatically sanitize and append kiosk mode parameter if not present
    let finalUrl = tempUrl.trim();
    if (!finalUrl.includes('kiosk')) {
      finalUrl += finalUrl.includes('?') ? '&kiosk=true' : '?kiosk=true';
    }

    localStorage.setItem('grafana_dashboard_url', finalUrl);
    setGrafanaUrl(finalUrl);
    setIsEditing(false);
    toast.success('Grafana Dashboard URL saved!', toastStyle);
  };

  const handleResetUrl = () => {
    localStorage.removeItem('grafana_dashboard_url');
    setGrafanaUrl('');
    setTempUrl('');
    setIsEditing(true);
    toast.success('Configuration reset.', toastStyle);
  };

  return (
    <main className={`flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full transition-colors duration-300 ${
      isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-[#FAFAFA] text-gray-800'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Server Health & Monitoring</h1>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Real-time health status of your backend server (sb.neoparlour.com) and services.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center px-4 py-2 rounded-xl border shadow-sm ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-gray-200 text-gray-700'
          }`}>
            <span className={`text-xs font-bold mr-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Backend Connection:</span>
            {serverStatus === 'checking' ? (
              <span className={`inline-flex items-center text-xs font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                <span className={`w-2 h-2 rounded-full animate-pulse mr-1.5 ${isDarkMode ? 'bg-slate-500' : 'bg-gray-300'}`} /> Checking...
              </span>
            ) : serverStatus === 'up' ? (
              <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isDarkMode ? 'text-emerald-300 bg-emerald-950/70 border border-emerald-900/60' : 'text-green-600 bg-green-50'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-ping" /> ONLINE (UP)
              </span>
            ) : (
              <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isDarkMode ? 'text-rose-300 bg-rose-950/70 border border-rose-900/60' : 'text-red-600 bg-red-50'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" /> OFFLINE (DOWN)
              </span>
            )}
          </div>
          <button 
            onClick={checkServerStatus}
            disabled={checkingStatus}
            className={`p-2 border rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer ${
              isDarkMode
                ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                : 'bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-900 border-gray-200'
            }`}
            title="Refresh connection status"
          >
            <svg className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className={`rounded-3xl p-6 md:p-8 shadow-sm max-w-3xl mb-8 border transition-colors duration-300 ${isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-[15px] font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Configure Grafana Dashboard Connection</h2>
          <p className={`text-xs mb-6 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
            To view real-time metrics charts, please enter the public URL of your hosted Grafana dashboard. If Grafana is not deployed yet, follow the step-by-step instructions below.
          </p>

          <form onSubmit={handleSaveUrl} className="space-y-4">
            <div className="space-y-2">
              <label className={`text-[10px] font-extrabold uppercase tracking-wider block ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>Grafana Dashboard URL</label>
              <input
                type="url"
                required
                placeholder="e.g., https://grafana.neoparlour.com/d/neoparlour-health-dashboard?orgId=1"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                className={`w-full border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[#FF0B01] transition-all ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder-slate-500 focus:bg-zinc-800' : 'bg-gray-50/50 border-gray-200 text-gray-700 hover:bg-gray-55 focus:bg-white'}`}
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto bg-[#FF0B01] hover:bg-red-700 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
            >
              Connect Dashboard
            </button>
          </form>

          <div className={`border-t pt-6 mt-8 ${isDarkMode ? 'border-zinc-700' : 'border-gray-100'}`}>
            <h3 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Docker Setup Cheat-Sheet</h3>
            <div className="space-y-4 text-xs">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-zinc-800/80 border-zinc-700' : 'bg-gray-50 border-gray-100'}`}>
                <span className={`font-extrabold text-[10px] uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>1. Run Prometheus Container</span>
                <code className="block bg-[#1a1a1a] text-red-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto select-all">
                  docker run -d --name prometheus -p 9090:9090 -v "/path/to/neoparlour/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml" prom/prometheus
                </code>
              </div>

              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-zinc-800/80 border-zinc-700' : 'bg-gray-50 border-gray-100'}`}>
                <span className={`font-extrabold text-[10px] uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>2. Run Grafana Container (Embedding Enabled)</span>
                <code className="block bg-[#1a1a1a] text-red-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto select-all">
                  docker run -d --name grafana -p 3000:3000 -e "GF_SECURITY_ALLOW_EMBEDDING=true" -e "GF_AUTH_ANONYMOUS_ENABLED=true" grafana/grafana
                </code>
              </div>

              <p className={`text-[11px] font-semibold leading-normal ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'}`}>
                Once Grafana is running, add Prometheus as a data source (<code className={`px-1 rounded text-red-500 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>http://host.docker.internal:9090</code>) and import the <code className={`px-1 rounded text-red-500 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>monitoring/grafana-dashboard.json</code> dashboard file, then paste its share URL above.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`flex items-center justify-between rounded-2xl px-5 py-3 shadow-xs border transition-colors duration-300 ${isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
              <p className={`text-xs font-semibold truncate ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                Connected to: <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{grafanaUrl}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsEditing(true)}
                className={`px-4 py-1.5 border rounded-lg text-xs font-bold transition ${isDarkMode ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Change URL
              </button>
              <button
                onClick={handleResetUrl}
                className={`px-4 py-1.5 border rounded-lg text-xs font-bold transition ${isDarkMode ? 'border-rose-900/60 text-rose-400 hover:bg-rose-950/40' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
              >
                Disconnect
              </button>
            </div>
          </div>

          <div className={`relative rounded-3xl overflow-hidden shadow-md border transition-colors duration-300 ${isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-150'}`}>
            <iframe
              src={grafanaUrl}
              title="Grafana Server Health Dashboard"
              width="100%"
              height="800px"
              frameBorder="0"
              className="w-full min-h-[750px]"
            />
          </div>
        </div>
      )}
    </main>
  );
}
