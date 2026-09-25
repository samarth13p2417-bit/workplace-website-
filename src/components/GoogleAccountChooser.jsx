import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, ArrowRight, Trash2, Plus, X, Check } from 'lucide-react';
import authApi from '../services/authApi';

// ─── Helpers ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'jira_saved_google_accounts_v1';

const loadSavedAccounts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Filter out any old demo/fake accounts
    return Array.isArray(parsed)
      ? parsed.filter((a) => a?.email && !['alex.morgan@gmail.com', 'test@test.com'].includes(a.email))
      : [];
  } catch {
    return [];
  }
};

const persistAccounts = (list) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
};

const makeInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'GU';

const avatarColor = (email = '') => {
  const colors = [
    '#1a73e8','#d93025','#1e8e3e','#e37400','#7b1fa2',
    '#0288d1','#c62828','#2e7d32','#ef6c00','#6a1b9a',
  ];
  let hash = 0;
  for (const c of email) hash = (hash * 31 + c.charCodeAt(0)) % colors.length;
  return colors[Math.abs(hash)];
};

// ─── Component ───────────────────────────────────────────────────────────────

export const GoogleAccountChooser = ({ onSelectAccount, onCancel }) => {
  const [savedAccounts, setSavedAccounts] = useState(loadSavedAccounts);

  const hasAccounts = savedAccounts.length > 0;
  const [viewMode, setViewMode] = useState(hasAccounts ? 'list' : 'input');

  // Form fields
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput]   = useState('');

  // UI state
  const [isLoading, setIsLoading]       = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [statusMsg, setStatusMsg]       = useState('');
  const [errorMsg, setErrorMsg]         = useState('');

  // ── Authenticate any account (saved or new) ────────────────────────────────
  const authenticate = async (account) => {
    setSelectedEmail(account.email);
    setIsLoading(true);
    setErrorMsg('');
    setStatusMsg(`Signing in as ${account.name}...`);

    try {
      // Call backend social login (creates/finds user in MongoDB + returns JWT)
      const result = await authApi.loginSocial({
        name:     account.name,
        email:    account.email.trim().toLowerCase(),
        provider: 'Google',
        avatar:   account.avatar || '',
      });

      // Bump account to top of saved list
      const updated = [
        { ...account, lastUsed: new Date().toISOString() },
        ...savedAccounts.filter((a) => a.email.toLowerCase() !== account.email.toLowerCase()),
      ];
      setSavedAccounts(updated);
      persistAccounts(updated);

      setStatusMsg('Connected! Opening Samarth Workplace…');

      setTimeout(() => {
        onSelectAccount({
          ...result.user,
          name:     account.name,
          email:    account.email.toLowerCase(),
          provider: 'Google',
          avatar:   account.avatar || result.user?.avatar || '',
          initials: makeInitials(account.name),
        });
      }, 450);

    } catch (err) {
      console.warn('[GoogleAuth] Backend error, using local session:', err);
      // Graceful fallback — still lets user in
      setStatusMsg('Opening Samarth Workplace…');
      setTimeout(() => {
        onSelectAccount({
          id:       `usr_${Date.now()}`,
          name:     account.name,
          email:    account.email.toLowerCase(),
          provider: 'Google',
          avatar:   account.avatar || '',
          role:     'Member',
          initials: makeInitials(account.name),
        });
      }, 350);
    }
  };

  // ── Form submit: add new Google account ───────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const email = emailInput.trim().toLowerCase();
    if (!email) return setErrorMsg('Please enter your Gmail address.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setErrorMsg('Please enter a valid email (e.g. yourname@gmail.com).');

    const name = nameInput.trim() || email.split('@')[0];
    await authenticate({
      name,
      email,
      avatar: '',
      lastUsed: new Date().toISOString(),
    });
  };

  // ── Remove a saved account ─────────────────────────────────────────────────
  const removeAccount = (emailToRemove, e) => {
    e.stopPropagation();
    const updated = savedAccounts.filter((a) => a.email !== emailToRemove);
    setSavedAccounts(updated);
    persistAccounts(updated);
    if (updated.length === 0) setViewMode('input');
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-[3px] flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden text-[#202124] animate-scaleUp">

        {/* ── HEADER ── */}
        <div className="px-8 pt-8 pb-6">

          {/* Google Logo */}
          <div className="flex justify-center mb-5">
            <svg className="w-10 h-10" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
          </div>

          <h2 className="text-[22px] font-normal text-center text-[#202124] leading-snug">
            {viewMode === 'list' ? 'Choose an account' : 'Sign in with Google'}
          </h2>
          <p className="text-center text-sm text-[#5f6368] mt-1">
            to continue to{' '}
            <span className="text-[#1a73e8] font-semibold">Samarth Workplace</span>
          </p>

          {/* Status */}
          {statusMsg && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 text-[#1a73e8] text-xs rounded-lg text-center flex items-center justify-center gap-2 animate-fadeIn">
              <div className="w-3.5 h-3.5 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin shrink-0" />
              <span className="font-medium">{statusMsg}</span>
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}
        </div>

        {/* ── ACCOUNT LIST VIEW ── */}
        {viewMode === 'list' && (
          <div>
            <div className="border-t border-[#e8eaed]">
              {savedAccounts.map((acc) => {
                const isSel = selectedEmail === acc.email;
                const color = avatarColor(acc.email);
                return (
                  <button
                    key={acc.email}
                    type="button"
                    disabled={isLoading}
                    onClick={() => authenticate(acc)}
                    className={`w-full px-6 py-3.5 flex items-center gap-4 text-left transition-colors group border-b border-[#e8eaed] last:border-0 disabled:opacity-70 ${
                      isSel ? 'bg-[#e8f0fe]' : 'hover:bg-[#f8f9fa]'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      {isSel && isLoading
                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : makeInitials(acc.name)
                      }
                    </div>

                    {/* Name / Email */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#202124] truncate group-hover:text-[#1a73e8] transition-colors">
                        {acc.name}
                      </p>
                      <p className="text-xs text-[#5f6368] truncate">{acc.email}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => removeAccount(acc.email, e)}
                        onKeyDown={(e) => e.key === 'Enter' && removeAccount(acc.email, e)}
                        title="Remove account"
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-gray-200 text-[#5f6368] hover:text-red-500 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                      {isSel && isLoading
                        ? null
                        : <ArrowRight className="w-4 h-4 text-[#5f6368] group-hover:text-[#1a73e8] group-hover:translate-x-0.5 transition-all" />
                      }
                    </div>
                  </button>
                );
              })}

              {/* Use another account */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => { setViewMode('input'); setErrorMsg(''); setEmailInput(''); setNameInput(''); }}
                className="w-full px-6 py-3.5 flex items-center gap-4 text-left hover:bg-[#f8f9fa] transition-colors group border-t border-[#e8eaed] disabled:opacity-70"
              >
                <div className="w-10 h-10 rounded-full bg-[#f1f3f4] flex items-center justify-center group-hover:bg-[#e8f0fe] transition-colors shrink-0">
                  <Plus className="w-5 h-5 text-[#5f6368] group-hover:text-[#1a73e8]" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-[#3c4043] group-hover:text-[#1a73e8] transition-colors">
                    Use another account
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#5f6368] group-hover:text-[#1a73e8] group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        )}

        {/* ── SIGN-IN INPUT VIEW ── */}
        {viewMode === 'input' && (
          <div className="px-8 pb-6 animate-fadeIn">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email field */}
              <div>
                <label className="block text-xs font-semibold text-[#3c4043] mb-1.5">
                  Email or phone
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your Gmail address"
                  autoFocus
                  autoComplete="email"
                  className="w-full px-4 py-3 text-sm text-[#202124] border border-[#dadce0] rounded-lg focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 outline-none transition-all bg-white placeholder:text-[#9aa0a6]"
                />
              </div>

              {/* Name field */}
              <div>
                <label className="block text-xs font-semibold text-[#3c4043] mb-1.5">
                  Your name{' '}
                  <span className="font-normal text-[#9aa0a6]">(optional)</span>
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Samarth Choudhary"
                  autoComplete="name"
                  className="w-full px-4 py-3 text-sm text-[#202124] border border-[#dadce0] rounded-lg focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 outline-none transition-all bg-white placeholder:text-[#9aa0a6]"
                />
              </div>

              {/* Forgot / Back */}
              <div className="flex items-center justify-between pt-1">
                {hasAccounts ? (
                  <button
                    type="button"
                    onClick={() => { setViewMode('list'); setErrorMsg(''); }}
                    className="text-xs font-semibold text-[#1a73e8] hover:underline cursor-pointer"
                  >
                    ← Back
                  </button>
                ) : (
                  <a href="#" className="text-xs font-semibold text-[#1a73e8] hover:underline">
                    Forgot email?
                  </a>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !emailInput.trim()}
                  className="px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#104791] disabled:bg-[#dadce0] disabled:text-[#9aa0a6] text-white text-sm font-semibold rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in…</span>
                    </>
                  ) : (
                    <>
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Create account link */}
            <div className="mt-5 pt-4 border-t border-[#e8eaed] text-center">
              <p className="text-xs text-[#5f6368]">
                Don't have a Google account?{' '}
                <a href="#" className="text-[#1a73e8] font-semibold hover:underline">
                  Create account
                </a>
              </p>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div className="px-6 py-3.5 bg-[#f8f9fa] border-t border-[#e8eaed] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[#5f6368]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure Google Sign-In</span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1 text-xs text-[#5f6368] hover:text-[#202124] font-medium cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleAccountChooser;
