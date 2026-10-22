/**
 * User-friendly error messages for NeoParlour customers.
 * Eliminates raw technical jargon and provides polite, reassuring guidance.
 */

export const getMaintenanceErrorDetails = (status, code, rawMessage = '') => {
  const normalizedMsg = (rawMessage || '').toLowerCase();
  const normalizedCode = (code || '').toUpperCase();

  // 1. Connection Timed Out / ECONNABORTED / 504 Gateway Timeout
  if (
    status === 504 ||
    normalizedCode === 'ECONNABORTED' ||
    normalizedCode === 'ERR_CONNECTION_TIMED_OUT' ||
    normalizedMsg.includes('timeout')
  ) {
    return {
      badge: 'Connection Timeout',
      title: 'Taking Longer Than Usual',
      message: 'The server is taking longer than expected to respond. This might be due to peak booking traffic or a slower internet connection.',
      hint: 'Please check your internet connection and tap Try Again.',
    };
  }

  // 2. Connection Refused / Server powered down (ERR_CONNECTION_REFUSED)
  if (
    normalizedCode === 'ERR_CONNECTION_REFUSED' ||
    normalizedMsg.includes('refused')
  ) {
    return {
      badge: 'System Upgrades',
      title: 'Upgrades in Progress',
      message: 'We are currently performing essential system enhancements to improve your salon booking experience. Services will resume shortly.',
      hint: 'Your appointments and account data are 100% safe. We will be back momentarily.',
    };
  }

  // 3. DNS / Domain Not Resolved (ERR_NAME_NOT_RESOLVED)
  if (
    normalizedCode === 'ERR_NAME_NOT_RESOLVED' ||
    normalizedMsg.includes('name_not_resolved') ||
    normalizedMsg.includes('network error')
  ) {
    return {
      badge: 'Network Unreachable',
      title: 'Unable to Connect to Server',
      message: 'We could not establish a connection to our server. Please ensure your device is connected to the internet.',
      hint: 'Please check your Wi-Fi or mobile data, then tap Try Again.',
    };
  }

  // 4. Bad Gateway (502)
  if (status === 502) {
    return {
      badge: 'Gateway Reconnecting',
      title: 'Brief Service Interruption',
      message: 'Our service gateway is momentarily reconnecting. Normal operations are being restored automatically.',
      hint: 'Please wait a few moments and tap Try Again.',
    };
  }

  // 5. Service Unavailable (503) or General Maintenance (Default)
  return {
    badge: 'System Maintenance',
    title: "We'll Be Back Online Shortly!",
    message: 'Our servers are currently undergoing scheduled maintenance and performance tuning. We are working hard to restore all services as quickly as possible.',
    hint: 'Thank you for your patience while we complete these updates.',
  };
};

/**
 * Returns a clean, friendly toast notification for standard HTTP API errors (4xx / 5xx)
 */
export const getFriendlyToastMessage = (error) => {
  const status = error.response?.status;
  const backendMessage = error.response?.data?.message;

  // If backend provided a specific validation/business message, prefer it unless it contains raw stack/SQL traces
  if (backendMessage && typeof backendMessage === 'string') {
    const isTechnical = /exception|sql|stacktrace|nullpointer|syntax error/i.test(backendMessage);
    if (!isTechnical) {
      return backendMessage;
    }
  }

  switch (status) {
    case 400:
      return 'We could not complete your request. Please review your details and try again.';
    case 401:
      return 'Your session has expired. Please log in again to continue.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested salon service, order, or page could not be found.';
    case 409:
      return 'This booking slot or item is already in use. Please select another option.';
    case 422:
      return 'Some information was incomplete or invalid. Please check the form and try again.';
    case 429:
      return "You're moving a bit too fast! Please wait a few seconds before trying again.";
    case 500:
      return 'Something went wrong on our end. Our engineering team has been notified. Please try again shortly.';
    default:
      return error.message || 'An unexpected issue occurred. Please try again.';
  }
};
