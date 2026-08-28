import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import store from './redux/store'
import { routes } from './router/NeoParlourRouter'
import './index.css'
import i18n from './i18n' // Import i18n configuration
import { I18nextProvider } from 'react-i18next'

// Safeguard against browser extensions (Google Translate, Grammarly, Autofill) mutating DOM nodes and causing React removeChild crashes
if (typeof window !== 'undefined') {
  if (Node.prototype._originalRemoveChild === undefined) {
    Node.prototype._originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function (child) {
      if (child && child.parentNode !== this) {
        if (console) {
          console.warn('Prevented React removeChild crash: child is not a child of target node.', child, this);
        }
        return child;
      }
      return Node.prototype._originalRemoveChild.apply(this, arguments);
    };
  }
  if (Node.prototype._originalInsertBefore === undefined) {
    Node.prototype._originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function (newNode, referenceNode) {
      if (referenceNode && referenceNode.parentNode !== this) {
        if (console) {
          console.warn('Prevented React insertBefore crash: referenceNode is not a child of target node.', newNode, referenceNode, this);
        }
        return newNode;
      }
      return Node.prototype._originalInsertBefore.apply(this, arguments);
    };
  }
}

const RootFallback = () => (
  <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' }}>
    <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #ff0b01', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<RootFallback />}>
        <RouterProvider router={routes} />
      </Suspense>
    </I18nextProvider>
  </Provider>
)
