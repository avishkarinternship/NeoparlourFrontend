import React from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const SupportEngineerRouteGuard = ({ children, isFinancialRoute = false }) => {
  const token = localStorage.getItem('ownerStaffToken') || localStorage.getItem('user_token');
  const user = JSON.parse(localStorage.getItem('ownerStaffUser')) || {};
  const userRole = (user?.role || user?.userRole || '').toUpperCase();

  if (!token) {
    return <Navigate to="/owner/login" replace />;
  }

  // If user is SUPPORT_ENGINEER trying to access financial/revenue routes
  if (userRole === 'SUPPORT_ENGINEER' && isFinancialRoute) {
    toast.error('Access Restricted: Confidential Financial Module', {
      id: 'support-eng-restricted-toast',
      style: {
        background: '#18181b',
        color: '#f43f5e',
        border: '1px solid #e11d48',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    });
    return <Navigate to="/admin/tickets" replace />;
  }

  return children;
};

export const SeoAdminRouteGuard = ({ children, isAllowedForSeo = true }) => {
  const token = localStorage.getItem('ownerStaffToken') || localStorage.getItem('user_token');
  const user = JSON.parse(localStorage.getItem('ownerStaffUser')) || {};
  const userRole = (user?.role || user?.userRole || '').toUpperCase();

  if (!token) {
    return <Navigate to="/owner/login" replace />;
  }

  // If user is SEO_ADMIN trying to access restricted salon/finance routes
  if ((userRole === 'SEO_ADMIN' || userRole.includes('SEO')) && !isAllowedForSeo) {
    toast.error('Access Restricted: Dedicated SEO & Content Workspace', {
      id: 'seo-admin-restricted-toast',
      style: {
        background: '#18181b',
        color: '#f59e0b',
        border: '1px solid #d97706',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    });
    return <Navigate to="/admin/blogs" replace />;
  }

  return children;
};

export default SupportEngineerRouteGuard;
