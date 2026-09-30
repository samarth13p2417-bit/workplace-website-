import React, { useState } from 'react';
import { AbcLogo } from './AbcLogo';

export const JiraLoginPage = ({ onOpenGoogle, onOpenMicrosoft, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'password'
  const [rememberMe, setRememberMe] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleContinue = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setStep('password');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }
    if (onLoginSuccess) {
      onLoginSuccess({
        name: email.split('@')[0],
        email: email.trim(),
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        provider: 'Email',
      });
    }
  };

  const handleSocialClick = (provider) => {
    if (provider === 'Google' && onOpenGoogle) {
      onOpenGoogle();
      return;
    }
    if (provider === 'Microsoft' && onOpenMicrosoft) {
      onOpenMicrosoft();
      return;
    }
    setStatusMessage(`Redirecting to ${provider} sign-in...`);
    setTimeout(() => {
      if (onLoginSuccess) {
        onLoginSuccess({
          name: `${provider} User`,
          email: `user@${provider.toLowerCase()}.com`,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          provider,
        });
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col items-center justify-center py-10 px-4 select-none">
      {/* Login Card Container */}
      <div className="w-full max-w-[400px] bg-white rounded-[3px] shadow-[0_0_10px_rgba(0,0,0,0.1)] border border-[#DFE1E6] px-8 sm:px-10 py-8">
        
        {/* Top Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <AbcLogo size="lg" />
          <span className="text-[30px] font-extrabold text-[#172B4D] tracking-tight">Abc</span>
        </div>

        {/* Title */}
        <h1 className="text-center font-bold text-[#172B4D] text-[15px] sm:text-[16px] mb-6">
          Log in to continue
        </h1>

        {/* Status Alert */}
        {statusMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-[3px] text-center font-medium animate-fadeIn">
            {statusMessage}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 text-xs rounded-[3px] font-medium">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        {step === 'email' ? (
          <form onSubmit={handleContinue} className="space-y-4">
            <div>
              <label htmlFor="emailInput" className="block text-[12px] font-semibold text-[#5E6C84] mb-1">
                Email <span className="text-[#DE350B]">*</span>
              </label>
              <input
                id="emailInput"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-2.5 py-2 text-[14px] text-[#172B4D] border border-[#DFE1E6] rounded-[3px] bg-[#FAFBFC] hover:bg-white focus:bg-white focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#4C9AFF]/20 transition-colors"
                autoFocus
              />
            </div>

            {/* Remember Me with Info Icon */}
            <div className="flex items-center justify-start gap-2 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-[2px] border-[#DFE1E6] text-[#0052CC] focus:ring-0 cursor-pointer"
                />
                <span className="text-[14px] text-[#172B4D]">Remember me</span>
              </label>

              <div className="relative inline-flex items-center">
                <button
                  type="button"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="w-4 h-4 rounded-full bg-[#8777D9] text-white flex items-center justify-center text-[10px] font-bold leading-none cursor-pointer focus:outline-none"
                  aria-label="Info about Remember me"
                >
                  i
                </button>

                {showTooltip && (
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-48 p-2 bg-[#172B4D] text-white text-[11px] rounded-[3px] shadow-lg leading-tight">
                    Keep you logged in on this browser for 30 days.
                  </div>
                )}
              </div>
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-[#0052CC] hover:bg-[#0065FF] active:bg-[#0747A6] text-white font-bold text-[14px] rounded-[3px] transition-colors shadow-sm cursor-pointer mt-2"
            >
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[#5E6C84] bg-slate-100 p-2 rounded-[3px]">
              <span className="truncate font-medium">{email}</span>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-[#0052CC] hover:underline font-semibold shrink-0 ml-2"
              >
                Change
              </button>
            </div>

            <div>
              <label htmlFor="passwordInput" className="block text-[12px] font-semibold text-[#5E6C84] mb-1">
                Password <span className="text-[#DE350B]">*</span>
              </label>
              <input
                id="passwordInput"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-2.5 py-2 text-[14px] text-[#172B4D] border border-[#DFE1E6] rounded-[3px] bg-[#FAFBFC] hover:bg-white focus:bg-white focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#4C9AFF]/20 transition-colors"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-[#0052CC] hover:bg-[#0065FF] active:bg-[#0747A6] text-white font-bold text-[14px] rounded-[3px] transition-colors shadow-sm cursor-pointer"
            >
              Log in
            </button>
          </form>
        )}

        {/* Divider: Or login with */}
        <div className="my-5 text-center">
          <span className="text-[12px] text-[#5E6C84]">Or login with:</span>
        </div>

        {/* Passkey Button */}
        <button
          type="button"
          onClick={() => handleSocialClick('Passkey')}
          className="w-full py-2 px-4 bg-white hover:bg-[#FAFBFC] active:bg-[#EBECF0] border border-[#DFE1E6] text-[#172B4D] font-bold text-[14px] rounded-[3px] flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5 text-[#172B4D]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 14C5.9 14 5 13.1 5 12C5 10.9 5.9 10 7 10C8.1 10 9 10.9 9 12C9 13.1 8.1 14 7 14ZM12.6 10C11.8 7.6 9.6 6 7 6C3.7 6 1 8.7 1 12C1 15.3 3.7 18 7 18C9.6 18 11.8 16.4 12.6 14H16V18H20V14H23V10H12.6Z" />
          </svg>
          <span>Passkey</span>
        </button>

        {/* Divider: Or continue with */}
        <div className="my-5 text-center">
          <span className="text-[12px] text-[#5E6C84]">Or continue with:</span>
        </div>

        {/* Social Buttons Stack */}
        <div className="space-y-2.5">
          {/* Google */}
          <button
            type="button"
            onClick={() => handleSocialClick('Google')}
            className="w-full py-2 px-4 bg-white hover:bg-[#FAFBFC] active:bg-[#EBECF0] border border-[#DFE1E6] text-[#172B4D] font-bold text-[14px] rounded-[3px] flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>Google</span>
          </button>

          {/* Microsoft */}
          <button
            type="button"
            onClick={() => handleSocialClick('Microsoft')}
            className="w-full py-2 px-4 bg-white hover:bg-[#FAFBFC] active:bg-[#EBECF0] border border-[#DFE1E6] text-[#172B4D] font-bold text-[14px] rounded-[3px] flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#F25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
              <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
            </svg>
            <span>Microsoft</span>
          </button>

          {/* Apple */}
          <button
            type="button"
            onClick={() => handleSocialClick('Apple')}
            className="w-full py-2 px-4 bg-white hover:bg-[#FAFBFC] active:bg-[#EBECF0] border border-[#DFE1E6] text-[#172B4D] font-bold text-[14px] rounded-[3px] flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 fill-black" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.94-12.04-14.58-6.19-9.5-11.02-20.08-14.5-31.73-3.48-11.66-5.23-22.6-5.23-32.83 0-14.28 3.69-25.79 11.08-34.54 7.39-8.74 16.54-13.23 27.46-13.48 4.79 0 10.35 1.28 16.68 3.84 6.33 2.56 10.15 3.89 11.46 3.99 1.1.1 5.09-1.28 11.97-4.14 6.88-2.86 12.73-4.14 17.55-3.84 13.56.78 24.28 5.63 32.17 14.54-11.75 7.09-17.51 16.89-17.29 29.39.22 9.87 3.97 18.06 11.25 24.56 7.28 6.5 15.86 10.22 25.75 11.16-2.07 6.1-4.68 12.39-7.85 18.88zm-33.15-114.73c0 7.39-2.72 14.45-8.17 21.18-5.45 6.73-12.24 10.87-20.37 12.43-.22-.99-.33-2.09-.33-3.3 0-7.39 2.83-14.45 8.5-21.18 5.67-6.73 12.57-10.76 20.7-12.09.22.99.37 2.09.37 2.96z" />
            </svg>
            <span>Apple</span>
          </button>

          {/* Slack */}
          <button
            type="button"
            onClick={() => handleSocialClick('Slack')}
            className="w-full py-2 px-4 bg-white hover:bg-[#FAFBFC] active:bg-[#EBECF0] border border-[#DFE1E6] text-[#172B4D] font-bold text-[14px] rounded-[3px] flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 127 127">
              <path d="M27.2 79.7c0 7.5-6.1 13.6-13.6 13.6S0 87.2 0 79.7s6.1-13.6 13.6-13.6h13.6v13.6z" fill="#E01E5A"/>
              <path d="M34 79.7c0-7.5 6.1-13.6 13.6-13.6s13.6 6.1 13.6 13.6v34c0 7.5-6.1 13.6-13.6 13.6s-13.6-6.1-13.6-13.6v-34z" fill="#E01E5A"/>
              <path d="M47.6 27.2c-7.5 0-13.6-6.1-13.6-13.6S40.1 0 47.6 0s13.6 6.1 13.6 13.6v13.6H47.6z" fill="#36C5F0"/>
              <path d="M47.6 34c7.5 0 13.6 6.1 13.6 13.6s-6.1 13.6-13.6 13.6H13.6C6.1 61.2 0 55.1 0 47.6s6.1-13.6 13.6-13.6h34z" fill="#36C5F0"/>
              <path d="M99.8 47.6c0-7.5 6.1-13.6 13.6-13.6s13.6 6.1 13.6 13.6-6.1 13.6-13.6 13.6H99.8V47.6z" fill="#2EB67D"/>
              <path d="M93 47.6c0 7.5-6.1 13.6-13.6 13.6s-13.6-6.1-13.6-13.6V13.6C65.8 6.1 71.9 0 79.4 0s13.6 6.1 13.6 13.6v34z" fill="#2EB67D"/>
              <path d="M79.4 99.8c7.5 0 13.6 6.1 13.6 13.6s-6.1 13.6-13.6 13.6-13.6-6.1-13.6-13.6V99.8h13.6z" fill="#ECB22E"/>
              <path d="M79.4 93c-7.5 0-13.6-6.1-13.6-13.6s6.1-13.6 13.6-13.6h34c7.5 0 13.6 6.1 13.6 13.6s-6.1 13.6-13.6 13.6h-34z" fill="#ECB22E"/>
            </svg>
            <span>Slack</span>
          </button>
        </div>

        {/* Footer Links */}
        <div className="mt-8 pt-4 border-t border-[#DFE1E6]/80 flex items-center justify-center gap-2 text-[14px]">
          <a
            href="#cant-login"
            onClick={(e) => { e.preventDefault(); setStatusMessage('Password reset instructions sent.'); }}
            className="text-[#0052CC] hover:underline"
          >
            Can't log in?
          </a>
          <span className="text-[#5E6C84]">•</span>
          <a
            href="#create-account"
            onClick={(e) => { e.preventDefault(); setStatusMessage('Account creation screen initiated.'); }}
            className="text-[#0052CC] hover:underline"
          >
            Create an account
          </a>
        </div>
      </div>

      {/* Atlassian Footer / Copyright */}
      <footer className="mt-6 text-center text-xs text-[#5E6C84] flex items-center justify-center gap-3">
        <span>Privacy Policy</span>
        <span>•</span>
        <span>User Notice</span>
      </footer>
    </div>
  );
};

export default JiraLoginPage;
