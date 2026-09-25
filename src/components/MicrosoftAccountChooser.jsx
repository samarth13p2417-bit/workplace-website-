import React from 'react';

export const MicrosoftAccountChooser = ({ onSelectAccount, onCancel }) => {
  const accounts = [
    {
      name: 'Shrutika Patil',
      email: 'shrutika.patil@outlook.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    },
    {
      name: 'Work Account (Azure AD)',
      email: 'shrutika@enterprise.onmicrosoft.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="w-full max-w-[440px] bg-white rounded shadow-2xl border border-gray-200 p-8 sm:p-10 text-gray-800">
        {/* Microsoft Logo */}
        <div className="flex items-center gap-2 mb-6">
          <svg className="w-6 h-6" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
          </svg>
          <span className="font-semibold text-lg text-gray-700">Microsoft</span>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Pick an account</h2>
        <p className="text-sm text-gray-500 mb-6">to sign in to Abc Workspace</p>

        <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
          {accounts.map((acc) => (
            <button
              key={acc.email}
              onClick={() =>
                onSelectAccount({
                  ...acc,
                  provider: 'Microsoft',
                })
              }
              className="w-full py-3.5 px-2 flex items-center gap-3.5 hover:bg-gray-50 transition-colors text-left group"
            >
              <img
                src={acc.avatar}
                alt={acc.name}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600">
                  {acc.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{acc.email}</p>
                <span className="text-[10px] text-green-700 font-medium">Signed in</span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default MicrosoftAccountChooser;
