import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import authApi from './services/authApi';
import AbcLandingPage from './components/AbcLandingPage';
import JiraLoginPage from './components/JiraLoginPage';
import GoogleAccountChooser from './components/GoogleAccountChooser';
import MicrosoftAccountChooser from './components/MicrosoftAccountChooser';
import OnboardingRoleSelector from './components/OnboardingRoleSelector';
import WorkspaceDashboard from './components/WorkspaceDashboard';
import SeePlansModal from './components/SeePlansModal';

/**
 * Inner app component that has access to useAuth() context
 */
function AppContent() {
  const { isAuthenticated, loginSocial, login, logout: authLogout, user: authUser } = useAuth();

  const defaultUser = {
    name: 'Samarth Choudhary',
    email: 'samarth.choudhary@softwareteam.com',
    workspaceName: 'Samarth Workplace',
    role: 'Developer',
    workTypeTitle: 'Software Development',
  };

  const getInitialPage = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('page')) return params.get('page');
    } catch {}
    return 'home';
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [activeModal, setActiveModal] = useState(null); // 'google', 'microsoft', 'plans', null
  const [initialEmail, setInitialEmail] = useState('');
  const [pendingUser, setPendingUser] = useState(null); // User who just authenticated
  const [activeWorkspaceUser, setActiveWorkspaceUser] = useState(() => {
    try {
      const saved = localStorage.getItem('jira_active_workspace_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return (
      isAuthenticated && authUser
        ? { ...defaultUser, name: authUser.name, email: authUser.email, role: authUser.role || defaultUser.role, workTypeTitle: authUser.workTypeTitle || defaultUser.workTypeTitle }
        : defaultUser
    );
  });

  // Navigation handlers
  const handleNavigateToLogin = (email = '') => {
    if (email) setInitialEmail(email);
    setCurrentPage('login');
  };

  // Step 1: User authenticates with real Google account, Microsoft, or Email
  const handleAccountAuthenticated = async (user) => {
    setActiveModal(null);

    // Persist auth via JWT token
    try {
      await loginSocial({
        name: user.name,
        email: user.email,
        provider: user.provider || 'Google',
        avatar: user.avatar || user.picture,
      });
    } catch (err) {
      console.error('Social login persistence failed:', err);
    }

    const initials = (user.name || user.email.split('@')[0])
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const preparedUser = {
      ...user,
      name: user.name || user.email.split('@')[0],
      email: user.email,
      workspaceName: user.workspaceName || 'Samarth Workplace',
      role: user.role || 'Developer',
      workTypeTitle: user.workTypeTitle || 'Software Development',
      avatar: user.avatar || user.picture,
      initials: initials || 'SC',
    };

    // Transition directly to the Role & Branch Onboarding Flow
    setPendingUser(preparedUser);
    setCurrentPage('onboarding');
  };

  // Step 2: User finishes selecting their role (Manager, Developer, etc.) & branch (HR, Finance, Marketing, Software Dev)
  const handleCompleteOnboarding = async (finalUserData) => {
    try {
      await authApi.updateProfile({
        role: finalUserData.role,
        workTypeTitle: finalUserData.workTypeTitle,
        workspaceName: finalUserData.workspaceName,
        email: finalUserData.email,
        name: finalUserData.name,
      });
    } catch (err) {
      console.warn('Profile sync error:', err);
    }

    setPendingUser(null);
    setActiveWorkspaceUser(finalUserData);
    try {
      localStorage.setItem('jira_active_workspace_user', JSON.stringify(finalUserData));
    } catch {}
    setCurrentPage('workspace');
  };

  // Log out or reset back to landing page
  const handleLogout = async () => {
    await authLogout(); // Clear JWT session
    localStorage.removeItem('jira_active_workspace_user');
    setActiveWorkspaceUser(null);
    setPendingUser(null);
    setActiveModal(null);
    try {
      window.history.replaceState({}, '', window.location.pathname);
    } catch {}
    setCurrentPage('home');
  };

  return (
    <div className="relative">
      {/* 1. Landing Page */}
      {currentPage === 'home' && (
        <AbcLandingPage
          onNavigateToLogin={handleNavigateToLogin}
          onOpenGoogle={() => setActiveModal('google')}
          onOpenPlans={() => setActiveModal('plans')}
        />
      )}

      {/* 2. Login Page */}
      {currentPage === 'login' && (
        <div>
          <JiraLoginPage
            onOpenGoogle={() => setActiveModal('google')}
            onOpenMicrosoft={() => setActiveModal('microsoft')}
            onLoginSuccess={handleAccountAuthenticated}
          />
          {/* Back to Home Button on Login Page */}
          <div className="fixed top-4 left-4 z-30">
            <button
              onClick={() => setCurrentPage('home')}
              className="px-3 py-1.5 bg-white/90 hover:bg-white text-xs font-semibold text-[#42526E] border border-[#DFE1E6] rounded shadow-xs cursor-pointer"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      )}

      {/* 2.5 Onboarding Role & Branch Selection Screen */}
      {currentPage === 'onboarding' && (
        <OnboardingRoleSelector
          user={pendingUser || activeWorkspaceUser || defaultUser}
          onCompleteOnboarding={handleCompleteOnboarding}
          onCancel={() => {
            setPendingUser(null);
            setCurrentPage('workspace');
          }}
        />
      )}

      {/* 3. Logged-in Workspace Dashboard — Protected by Auth */}
      {currentPage === 'workspace' && (
        <ProtectedRoute onRedirectToLogin={() => setCurrentPage('login')}>
          <WorkspaceDashboard
            user={activeWorkspaceUser || defaultUser}
            onLogout={handleLogout}
            onOpenOnboarding={() => setCurrentPage('onboarding')}
          />
        </ProtectedRoute>
      )}

      {/* Global Google Account Picker Modal */}
      {activeModal === 'google' && (
        <GoogleAccountChooser
          onSelectAccount={handleAccountAuthenticated}
          onCancel={() => setActiveModal(null)}
        />
      )}

      {/* Global Microsoft Account Picker Modal */}
      {activeModal === 'microsoft' && (
        <MicrosoftAccountChooser
          onSelectAccount={handleAccountAuthenticated}
          onCancel={() => setActiveModal(null)}
        />
      )}

      {/* Global See Plans Pricing Modal */}
      {activeModal === 'plans' && (
        <SeePlansModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onSelectPlan={(plan) => {
            setActiveModal(null);
            handleNavigateToLogin();
          }}
        />
      )}



      {/* Quick Flow Navigator Pill at Bottom Right */}
      <div className="fixed bottom-4 right-4 z-50 bg-[#172B4D]/95 text-white backdrop-blur-md px-3 py-1.5 rounded-full shadow-2xl border border-white/20 flex items-center gap-1.5 text-[11px] font-medium">
        <span className="text-[#8993A4] pr-1 hidden sm:inline">Flow:</span>
        <button
          onClick={() => {
            try { window.history.replaceState({}, '', window.location.pathname); } catch {}
            setCurrentPage('home');
          }}
          className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            currentPage === 'home'
              ? 'bg-[#0052CC] text-white font-bold shadow-xs'
              : 'hover:bg-white/10 text-white/80'
          }`}
          title="Go to Home Landing Page"
        >
          1. Home
        </button>
        <button
          onClick={() => setCurrentPage('login')}
          className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            currentPage === 'login'
              ? 'bg-[#0052CC] text-white font-bold shadow-xs'
              : 'hover:bg-white/10 text-white/80'
          }`}
          title="Go to Login Page"
        >
          2. Login
        </button>
        <button
          onClick={() => setCurrentPage('onboarding')}
          className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            currentPage === 'onboarding'
              ? 'bg-[#0052CC] text-white font-bold shadow-xs'
              : 'hover:bg-white/10 text-white/80'
          }`}
          title="Select Role & Branch"
        >
          3. Role & Branch
        </button>
        <button
          onClick={() => {
            if (!activeWorkspaceUser) setActiveWorkspaceUser(defaultUser);
            setCurrentPage('workspace');
          }}
          className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            currentPage === 'workspace'
              ? 'bg-[#0052CC] text-white font-bold shadow-xs'
              : 'hover:bg-white/10 text-white/80'
          }`}
          title="Open Kanban Workspace Board"
        >
          4. Board
        </button>
      </div>
    </div>
  );
}

/**
 * Root App component wrapped with AuthProvider
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
