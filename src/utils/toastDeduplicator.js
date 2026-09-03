import toast from 'react-hot-toast';

/**
 * Setup global toast deduplication.
 * Safely patches react-hot-toast methods so identical toast messages 
 * update the existing toast card instead of stacking duplicates on screen.
 */
export function setupToastDeduplication() {
  if (typeof window === 'undefined' || window.__toastDeduplicatorInitialized) {
    return;
  }
  window.__toastDeduplicatorInitialized = true;

  try {
    const originalError = toast.error;
    const originalSuccess = toast.success;
    const originalLoading = toast.loading;

    if (typeof originalError === 'function') {
      toast.error = (message, options = {}) => {
        const id = options?.id || (typeof message === 'string' && message.trim() ? `error:${message.trim()}` : undefined);
        return originalError.call(toast, message, id ? { id, ...options } : options);
      };
    }

    if (typeof originalSuccess === 'function') {
      toast.success = (message, options = {}) => {
        const id = options?.id || (typeof message === 'string' && message.trim() ? `success:${message.trim()}` : undefined);
        return originalSuccess.call(toast, message, id ? { id, ...options } : options);
      };
    }

    if (typeof originalLoading === 'function') {
      toast.loading = (message, options = {}) => {
        const id = options?.id || (typeof message === 'string' && message.trim() ? `loading:${message.trim()}` : undefined);
        return originalLoading.call(toast, message, id ? { id, ...options } : options);
      };
    }
  } catch (err) {
    console.warn('[toastDeduplicator] Failed to initialize toast patch:', err);
  }
}

setupToastDeduplication();
