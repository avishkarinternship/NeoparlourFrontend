import React, { useState, useEffect } from 'react';
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
      // Check the backend actuator health endpoint
      const res = await axiosInstance.get('/actuator/health');
      if (res.status === 200 || res.data?.status === 'UP') {
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
    <main className="flex-1 p-6 md:p-8 bg-[#FAFAFA] overflow-y-auto max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Server Health & Monitoring</h1>
          <p className="text-xs text-gray-500 mt-0.5">Real-time health status of your backend server (sb.neoparlour.com) and services.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-xs font-bold text-gray-500 mr-2">Backend Connection:</span>
            {serverStatus === 'checking' ? (
              <span className="inline-flex items-center text-xs font-semibold text-gray-400">
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-pulse mr-1.5" /> Checking...
              </span>
            ) : serverStatus === 'up' ? (
              <span className="inline-flex items-center text-xs font-bold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-ping" /> ONLINE (UP)
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" /> OFFLINE (DOWN)
              </span>
            )}
          </div>
          <button 
            onClick={checkServerStatus}
            disabled={checkingStatus}
            className="p-2 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-900 border border-gray-200 rounded-xl shadow-xs transition disabled:opacity-50"
            title="Refresh connection status"
          >
            <svg className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm max-w-3xl mb-8">
          <h2 className="text-[15px] font-bold text-gray-900 mb-2">Configure Grafana Dashboard Connection</h2>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            To view real-time metrics charts, please enter the public URL of your hosted Grafana dashboard. If Grafana is not deployed yet, follow the step-by-step instructions below.
          </p>

          <form onSubmit={handleSaveUrl} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Grafana Dashboard URL</label>
              <input
                type="url"
                required
                placeholder="e.g., https://grafana.neoparlour.com/d/neoparlour-health-dashboard?orgId=1"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold bg-gray-50/50 hover:bg-gray-55 focus:bg-white outline-none focus:border-[#FF0B01] transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto bg-[#FF0B01] hover:bg-red-700 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
            >
              Connect Dashboard
            </button>
          </form>

          <div className="border-t border-gray-100 pt-6 mt-8">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Docker Setup Cheat-Sheet</h3>
            <div className="space-y-4 text-xs">
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                <span className="font-extrabold text-[10px] text-gray-400 uppercase tracking-wider block mb-1">1. Run Prometheus Container</span>
                <code className="block bg-[#1a1a1a] text-red-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto select-all">
                  docker run -d --name prometheus -p 9090:9090 -v "/path/to/neoparlour/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml" prom/prometheus
                </code>
              </div>

              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                <span className="font-extrabold text-[10px] text-gray-400 uppercase tracking-wider block mb-1">2. Run Grafana Container (Embedding Enabled)</span>
                <code className="block bg-[#1a1a1a] text-red-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto select-all">
                  docker run -d --name grafana -p 3000:3000 -e "GF_SECURITY_ALLOW_EMBEDDING=true" -e "GF_AUTH_ANONYMOUS_ENABLED=true" grafana/grafana
                </code>
              </div>

              <p className="text-[11px] font-semibold text-gray-400 leading-normal">
                Once Grafana is running, add Prometheus as a data source (<code className="bg-gray-100 px-1 rounded text-red-500">http://host.docker.internal:9090</code>) and import the <code className="bg-gray-100 px-1 rounded text-red-500">monitoring/grafana-dashboard.json</code> dashboard file, then paste its share URL above.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-xs">
            <div className="flex items-center space-x-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
              <p className="text-xs text-gray-500 font-semibold truncate">
                Connected to: <span className="font-bold text-gray-800">{grafanaUrl}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Change URL
              </button>
              <button
                onClick={handleResetUrl}
                className="px-4 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition"
              >
                Disconnect
              </button>
            </div>
          </div>

          <div className="relative bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-md">
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
