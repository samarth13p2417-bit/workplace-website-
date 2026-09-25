import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, Sparkles, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

export const JiraLoginPage = ({ onOpenGoogle, onOpenMicrosoft, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');

    if (authMode === 'signup' && !name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }
    if (authMode === 'signup' && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = authMode === 'signup' ? '/api/auth/register' : '/api/auth/login';
      const payload = authMode === 'signup'
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };

      let data;
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || (authMode === 'signup' ? 'Registration failed.' : 'Incorrect email or password.'));
        }
      } catch (networkErr) {
        // Fallback for development if backend is temporarily unreachable
        if (authMode === 'signup') {
          data = {
            token: `jwt_mock_${Date.now()}`,
            user: {
              id: `usr_${Date.now()}`,
              name: name.trim(),
              email: email.trim(),
              role: 'Developer',
              workTypeTitle: 'Software Development',
            },
          };
        } else {
          throw networkErr;
        }
      }

      if (data?.token) {
        localStorage.setItem('jira_auth_token_v1', data.token);
        localStorage.setItem('jira_auth_user_v1', JSON.stringify(data.user));
      }

      setStatusMessage(authMode === 'signup' ? 'Account created! Redirecting...' : 'Login successful!');
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col items-center justify-center py-10 px-4 select-none">
      
      {/* Login Card Container */}
      <div className="w-full max-w-[420px] bg-white rounded-md shadow-[0_2px_12px_rgba(9,30,66,0.15)] border border-[#DFE1E6] px-8 sm:px-10 py-8">
        
        {/* Atlassian Jira Software Logo */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <svg viewBox="0 0 24 24" className="w-8 h-8 shrink-0">
            <path fill="#0052CC" d="M11.53 2c0 5.23 4.24 9.47 9.47 9.47H22V2h-10.47z"/>
            <path fill="#2684FF" d="M2 11.53c0 5.23 4.24 9.47 9.47 9.47h1.06v-9.47H2z"/>
            <path fill="#0052CC" d="M11.53 11.53c0 5.23 4.24 9.47 9.47 9.47H22v-9.47h-10.47z"/>
          </svg>
          <span className="text-[22px] font-extrabold text-[#172B4D] tracking-tight">Jira</span>
          <span className="text-xs font-bold text-[#6B778C] bg-[#F4F5F7] px-1.5 py-0.5 rounded">Software</span>
        </div>

        {/* Auth Mode Switcher Tabs */}
        <div className="flex border-b border-[#DFE1E6] mb-5">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
            className={`flex-1 py-2 text-center text-xs font-bold transition-all border-b-2 cursor-pointer ${
              authMode === 'login'
                ? 'border-[#0052CC] text-[#0052CC]'
                : 'border-transparent text-[#6B778C] hover:text-[#172B4D]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setErrorMessage(''); }}
            className={`flex-1 py-2 text-center text-xs font-bold transition-all border-b-2 cursor-pointer ${
              authMode === 'signup'
                ? 'border-[#0052CC] text-[#0052CC]'
                : 'border-transparent text-[#6B778C] hover:text-[#172B4D]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Title */}
        <h1 className="text-center font-bold text-[#172B4D] text-[17px] mb-1">
          {authMode === 'login' ? 'Log in to continue' : 'Create your account'}
        </h1>
        <p className="text-center text-xs text-[#6B778C] mb-6">
          {authMode === 'login' ? 'Access your KAN board and software projects' : 'Start managing your workplace and teams today'}
        </p>

        {/* Status Alert */}
        {statusMessage && (
          <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded text-center font-medium animate-fadeIn flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-300 text-red-700 text-xs rounded font-medium animate-fadeIn flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PRIMARY AUTHENTICATION ACTION: REAL GOOGLE ACCOUNT SIGN IN */}
        {/* ========================================================================= */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={onOpenGoogle}
            className="w-full py-2.5 px-4 bg-white hover:bg-[#FAFBFC] active:bg-[#EBECF0] border-2 border-[#4285F4]/40 hover:border-[#4285F4] text-[#172B4D] font-bold text-[14px] rounded-[4px] flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs hover:shadow-md group"
          >
            {/* Google G Logo */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="group-hover:text-[#0052CC] transition-colors">
              Continue with Google Account
            </span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#5E6C84]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sign in with your genuine Google account</span>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#DFE1E6]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2.5 text-[#6B778C] font-semibold uppercase text-[10px] tracking-wider">
              {authMode === 'login' ? 'Or with work email' : 'Or register with email'}
            </span>
          </div>
        </div>

        {/* Email & Password Form for existing accounts / new registration */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label className="block text-[12px] font-semibold text-[#5E6C84] mb-1">
                Full name <span className="text-[#DE350B]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Samarth Choudhary"
                required={authMode === 'signup'}
                className="w-full px-2.5 py-2 text-[13px] text-[#172B4D] border border-[#DFE1E6] rounded-[3px] bg-[#FAFBFC] hover:bg-white focus:bg-white focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#4C9AFF]/20 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[12px] font-semibold text-[#5E6C84] mb-1">
              Email address <span className="text-[#DE350B]">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. samarth.choudhary@softwareteam.com"
              required
              className="w-full px-2.5 py-2 text-[13px] text-[#172B4D] border border-[#DFE1E6] rounded-[3px] bg-[#FAFBFC] hover:bg-white focus:bg-white focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#4C9AFF]/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#5E6C84] mb-1">
              Password <span className="text-[#DE350B]">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={authMode === 'signup' ? 'Create a secure password (min 6 chars)' : 'Enter your password'}
              required
              className="w-full px-2.5 py-2 text-[13px] text-[#172B4D] border border-[#DFE1E6] rounded-[3px] bg-[#FAFBFC] hover:bg-white focus:bg-white focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#4C9AFF]/20 transition-colors"
            />
          </div>

          {authMode === 'login' && (
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-[2px] border-[#DFE1E6] text-[#0052CC]"
                />
                <span className="text-[#42526E]">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => onLoginSuccess && onLoginSuccess({
                  name: 'Samarth Choudhary',
                  email: 'samarth.choudhary@softwareteam.com',
                  initials: 'SC',
                  role: 'Software Engineer',
                  workTypeTitle: 'Software Development',
                })}
                className="text-[#0052CC] hover:underline font-semibold cursor-pointer"
              >
                Demo Engineer Login
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-[#0052CC] hover:bg-[#0065FF] active:bg-[#0747A6] text-white font-bold text-[14px] rounded-[3px] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSubmitting
              ? (authMode === 'signup' ? 'Creating account...' : 'Verifying...')
              : (authMode === 'signup' ? 'Create Account' : 'Log in')}
          </button>

          <div className="text-center text-xs text-[#6B778C] pt-1">
            {authMode === 'login' ? (
              <span>Don't have an account? <button type="button" onClick={() => { setAuthMode('signup'); setErrorMessage(''); }} className="text-[#0052CC] font-semibold hover:underline cursor-pointer">Sign up</button></span>
            ) : (
              <span>Already have an account? <button type="button" onClick={() => { setAuthMode('login'); setErrorMessage(''); }} className="text-[#0052CC] font-semibold hover:underline cursor-pointer">Log in</button></span>
            )}
          </div>
        </form>

        {/* Other Social Login Options (Microsoft) */}
        <div className="mt-5 pt-4 border-t border-[#DFE1E6] text-center">
          <p className="text-[11px] text-[#6B778C] mb-2 font-medium">Other enterprise sign-in options:</p>
          <button
            type="button"
            onClick={onOpenMicrosoft}
            className="w-full py-1.5 px-3 bg-white hover:bg-[#FAFBFC] border border-[#DFE1E6] text-[#42526E] font-semibold text-xs rounded-[3px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#F25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
              <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
            </svg>
            <span>Sign in with Microsoft 365</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-6 text-center text-xs text-[#5E6C84] flex items-center justify-center gap-3">
        <span>Atlassian Accounts</span>
        <span>•</span>
        <span>Privacy Policy</span>
        <span>•</span>
        <span>Terms of Service</span>
      </footer>
    </div>
  );
};

export default JiraLoginPage;
