import React, { useState } from 'react';

export const GoogleAccountChooser = ({ onSelectAccount, onCancel }) => {
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const mockAccounts = [
    {
      name: 'Shrutika Patil',
      email: 'shrutika.patil@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      status: 'Signed out',
    },
    {
      name: 'Dev Workspace Team',
      email: 'developer.jira@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      status: 'Active session',
    },
  ];

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customEmail.trim()) {
      onSelectAccount({
        name: customEmail.split('@')[0],
        email: customEmail.trim(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        provider: 'Google',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      {/* Google Sign In Card */}
      <div className="w-full max-w-[450px] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden text-gray-800">
        <div className="p-8 sm:p-10">
          {/* Google Logo */}
          <div className="flex justify-center mb-4">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
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
          </div>

          <h2 className="text-xl sm:text-2xl font-normal text-center text-gray-900 mb-1">
            Choose an account
          </h2>
          <p className="text-center text-sm text-gray-600 mb-6">
            to continue to <span className="text-[#0052CC] font-bold">Abc</span>
          </p>

          {!showCustomInput ? (
            <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
              {mockAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() =>
                    onSelectAccount({
                      ...account,
                      provider: 'Google',
                    })
                  }
                  className="w-full py-3 px-2 flex items-center gap-3.5 hover:bg-gray-50 transition-colors text-left group cursor-pointer"
                >
                  <img
                    src={account.avatar}
                    alt={account.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                      {account.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{account.email}</p>
                  </div>
                </button>
              ))}

              {/* Use another account button */}
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full py-3.5 px-2 flex items-center gap-3.5 hover:bg-gray-50 transition-colors text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Use another account</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email or phone</label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="Enter your Google email"
                  required
                  autoFocus
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Back to accounts
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-medium rounded shadow-sm"
                >
                  Next
                </button>
              </div>
            </form>
          )}

          {/* Privacy Disclaimer */}
          <p className="mt-6 text-[12px] text-gray-500 leading-relaxed">
            To continue, Google will share your name, email address, and profile picture with Abc. See Abc's{' '}
            <span className="text-blue-600 hover:underline cursor-pointer">Privacy Policy</span> and{' '}
            <span className="text-blue-600 hover:underline cursor-pointer">Terms of Service</span>.
          </p>
        </div>

        {/* Footer / Cancel */}
        <div className="bg-gray-50 px-8 py-3.5 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <span>English (United States)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAccountChooser;
