/**
 * Week 1: Day 6-7 — Protected Route Component
 * Guards workspace pages from unauthenticated access.
 * Shows a loading spinner while verifying session, then either
 * renders children or redirects to home/login.
 */

import React from 'react';
import { useAuth } from './AuthContext';

export const ProtectedRoute = ({ children, onRedirectToLogin }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // While checking existing session (on page load), show a loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          {/* Spinner */}
          <div className="w-10 h-10 border-3 border-[#DFE1E6] border-t-[#0052CC] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#6B778C] font-medium">
            Verifying your session...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    // If a redirect handler is provided, call it
    if (onRedirectToLogin) {
      // Use a microtask to avoid calling setState during render
      Promise.resolve().then(() => onRedirectToLogin());
    }
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg border border-[#DFE1E6] p-8 max-w-sm text-center space-y-4">
          <div className="w-12 h-12 bg-[#DEEBFF] rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-[#0052CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#172B4D]">Authentication Required</h2>
          <p className="text-sm text-[#6B778C]">
            Please log in to access your workspace.
          </p>
          <p className="text-xs text-[#6B778C]">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Authenticated → render workspace content
  return children;
};

export default ProtectedRoute;
