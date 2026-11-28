import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('RootErrorBoundary caught unhandled error:', error, errorInfo);
  }

  handleHardReset = () => {
    try {
      localStorage.removeItem('activeSalonTheme');
      const styleEl = document.getElementById('np-salon-dynamic-theme');
      if (styleEl) styleEl.remove();
    } catch (e) {
      console.debug('Failed to clear style element during reset:', e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafafa',
          fontFamily: 'sans-serif',
          padding: '24px'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            border: '1px solid #f3f4f6'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              backgroundColor: '#fee2e2',
              color: '#ef4444',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <AlertTriangle style={{ width: '28px', height: '28px' }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: '0 0 8px' }}>
              Interface Initialization Error
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px', lineHeight: '1.5' }}>
              The application encountered a startup issue. Click below to refresh the cached session and reload.
            </p>
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <p style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#b91c1c',
                margin: 0,
                wordBreak: 'break-word'
              }}>
                {this.state.error?.message || String(this.state.error)}
              </p>
            </div>
            <button
              onClick={this.handleHardReset}
              style={{
                width: '100%',
                padding: '14px 20px',
                backgroundColor: 'var(--brand-primary, #7C3AED)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
              Reset Cache & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
