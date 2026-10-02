import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
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
    workspaceName: 'My Software Team',
    role: 'Software Engineer',
    workTypeTitle: 'Software Development',
  };

  const [currentPage, setCurrentPage] = useState(isAuthenticated ? 'workspace' : 'home');
  const [activeModal, setActiveModal] = useState(null); // 'google', 'microsoft', 'plans', null
  const [initialEmail, setInitialEmail] = useState('');
  const [pendingUser, setPendingUser] = useState(null); // User who just authenticated
  const [activeWorkspaceUser, setActiveWorkspaceUser] = useState(
    isAuthenticated && authUser
      ? { ...defaultUser, name: authUser.name, email: authUser.email }
      : defaultUser
  );

  // Navigation handlers
  const handleNavigateToLogin = (email = '') => {
    if (email) setInitialEmail(email);
    setCurrentPage('login');
  };

  // Step 1: User picks an account from Google/Microsoft/Email
  const handleAccountAuthenticated = async (user) => {
    setActiveModal(null);

    // Persist auth via JWT token
    try {
      await loginSocial({
        name: user.name,
        email: user.email,
        provider: user.provider || 'Email',
      });
    } catch (err) {
      console.error('Social login persistence failed:', err);
    }

    setPendingUser(user); // Triggers Role & Work Type Onboarding modal
  };

  // Step 2: User finishes selecting their work type (HR, Marketing, Software Dev) & role
  const handleCompleteOnboarding = (finalUserData) => {
    setPendingUser(null);
    setActiveWorkspaceUser(finalUserData);
    setCurrentPage('workspace');
  };

  // Log out or reset back to landing page
  const handleLogout = async () => {
    await authLogout(); // Clear JWT session
    setActiveWorkspaceUser(null);
    setPendingUser(null);
    setActiveModal(null);
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

      {/* 3. Logged-in Workspace Dashboard — Protected by Auth */}
      {currentPage === 'workspace' && (
        <ProtectedRoute onRedirectToLogin={() => setCurrentPage('login')}>
          <WorkspaceDashboard
            user={activeWorkspaceUser || defaultUser}
            onLogout={handleLogout}
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

      {/* Pop-up Modal: Work Type & Role Selection */}
      {pendingUser && (
        <OnboardingRoleSelector
          user={pendingUser}
          onCompleteOnboarding={handleCompleteOnboarding}
          onCancel={() => setPendingUser(null)}
        />
      )}

      {/* Quick Flow Navigator Pill at Bottom Right */}
      <div className="fixed bottom-4 right-4 z-50 bg-[#172B4D]/95 text-white backdrop-blur-md px-3 py-1.5 rounded-full shadow-2xl border border-white/20 flex items-center gap-1.5 text-[11px] font-medium">
        <span className="text-[#8993A4] pr-1 hidden sm:inline">Views:</span>
        <button
          onClick={() => {
            if (!activeWorkspaceUser) setActiveWorkspaceUser(defaultUser);
            setCurrentPage('workspace');
          }}
          className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
            currentPage === 'workspace'
              ? 'bg-[#0052CC] text-white font-bold'
              : 'hover:bg-white/10 text-white/80'
          }`}
        >
          My Software Team (Dev)
        </button>
        <button
          onClick={() => setCurrentPage('home')}
          className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
            currentPage === 'home'
              ? 'bg-[#0052CC] text-white font-bold'
              : 'hover:bg-white/10 text-white/80'
          }`}
        >
          Landing
        </button>
        <button
          onClick={() => setCurrentPage('login')}
          className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
            currentPage === 'login'
              ? 'bg-[#0052CC] text-white font-bold'
              : 'hover:bg-white/10 text-white/80'
          }`}
        >
          Login
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
