/**
 * Standardized Unified Support Architecture Types & Helpers
 * Single Entity: SupportTicket (support_tickets)
 */

export const SUPPORT_TICKET_STATUSES = {
  OPEN: 'OPEN',
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  ESCALATED_TO_DEV: 'ESCALATED_TO_DEV',
  PENDING_CLIENT: 'PENDING_CLIENT',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED'
};

export const TICKET_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

export const TICKET_PLATFORMS = {
  BACKEND_API: 'BACKEND_API',
  FRONTEND_WEB: 'FRONTEND_WEB',
  MOBILE_APP_ANDROID: 'MOBILE_APP_ANDROID',
  MOBILE_APP_IOS: 'MOBILE_APP_IOS',
  GENERAL: 'GENERAL'
};

export const TICKET_CATEGORIES = {
  ACCOUNT_HELP: 'ACCOUNT_HELP',
  SALON_ONBOARDING: 'SALON_ONBOARDING',
  KYC_ISSUE: 'KYC_ISSUE',
  APPOINTMENT_HELP: 'APPOINTMENT_HELP',
  TECHNICAL_BUG: 'TECHNICAL_BUG',
  UI_BUG: 'UI_BUG',
  PAYMENT_BILLING: 'PAYMENT_BILLING',
  GENERAL: 'GENERAL'
};

export const STATUS_CONFIG = {
  OPEN: {
    label: 'Open',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    iconColor: 'text-emerald-500',
    emoji: '🟢'
  },
  PENDING: {
    label: 'Pending',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    iconColor: 'text-amber-500',
    emoji: '🟡'
  },
  IN_PROGRESS: {
    label: 'In Progress',
    badgeClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
    iconColor: 'text-sky-500',
    emoji: '🔵'
  },
  ESCALATED_TO_DEV: {
    label: 'Escalated to Dev',
    badgeClass: 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30 animate-pulse',
    iconColor: 'text-purple-500',
    emoji: '🟣'
  },
  PENDING_CLIENT: {
    label: 'Pending Client',
    badgeClass: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    iconColor: 'text-yellow-500',
    emoji: '🟡'
  },
  RESOLVED: {
    label: 'Resolved',
    badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    iconColor: 'text-indigo-500',
    emoji: '✅'
  },
  CLOSED: {
    label: 'Closed',
    badgeClass: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30',
    iconColor: 'text-zinc-400',
    emoji: '⚪'
  },
  REJECTED: {
    label: 'Rejected',
    badgeClass: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
    iconColor: 'text-red-500',
    emoji: '🔴'
  }
};

export const PLATFORM_CONFIG = {
  BACKEND_API: {
    label: 'Backend REST API',
    shortLabel: 'BACKEND_API',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
    emoji: '🌐'
  },
  FRONTEND_WEB: {
    label: 'Frontend Web / UI',
    shortLabel: 'FRONTEND_WEB',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    emoji: '💻'
  },
  MOBILE_APP_ANDROID: {
    label: 'Android Mobile App',
    shortLabel: 'ANDROID',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    emoji: '🤖'
  },
  MOBILE_APP_IOS: {
    label: 'iOS Mobile App',
    shortLabel: 'IOS',
    badgeClass: 'bg-slate-300/15 text-slate-300 border-slate-300/25',
    emoji: '🍏'
  },
  GENERAL: {
    label: 'General / Infra',
    shortLabel: 'GENERAL',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    emoji: '⚙️'
  }
};
