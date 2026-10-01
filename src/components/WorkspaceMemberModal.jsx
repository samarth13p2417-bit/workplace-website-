import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { X, UserPlus, Mail, Check, Trash2, Search, Users, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { EMAILJS_CONFIG } from '../emailjs.config';

const IS_CONFIGURED =
  EMAILJS_CONFIG.SERVICE_ID  !== 'YOUR_SERVICE_ID' &&
  EMAILJS_CONFIG.TEMPLATE_ID !== 'YOUR_TEMPLATE_ID' &&
  EMAILJS_CONFIG.PUBLIC_KEY  !== 'YOUR_PUBLIC_KEY';


export const WorkspaceMemberModal = ({ isOpen, onClose, spaceName = 'My Software Team' }) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [memberSearch, setMemberSearch] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const [members, setMembers] = useState([
    {
      id: '1',
      name: 'Shrutika Patil',
      email: 'shrutika.patil@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      role: 'Admin',
      status: 'Active',
      isOwner: true,
    },
    {
      id: '2',
      name: 'Alex Johnson',
      email: 'alex.j@company.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      role: 'Member',
      status: 'Active',
      isOwner: false,
    },
    {
      id: '3',
      name: 'Sophia Chen',
      email: 'sophia.c@design.io',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      role: 'Member',
      status: 'Active',
      isOwner: false,
    },
  ]);

  if (!isOpen) return null;

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 4000);
  };

  const toastStyles = {
    info:    'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error:   'bg-red-50 border-red-200 text-red-800',
  };

  const toastIcon = {
    info:    <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />,
    success: <Check className="w-4 h-4 text-emerald-500 shrink-0" />,
    error:   <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />,
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || isSending) return;

    const email = inviteEmail.trim().toLowerCase();

    if (members.some((m) => m.email.toLowerCase() === email)) {
      showToast('This user is already a member of this workspace.', 'error');
      return;
    }

    setIsSending(true);

    try {
      if (IS_CONFIGURED) {
        await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          {
            to_email:    email,
            to_name:     email.split('@')[0],
            from_name:   'Shrutika from Abc',
            workspace:   spaceName,
            role:        inviteRole,
            invite_link: window.location.origin,
          },
          EMAILJS_CONFIG.PUBLIC_KEY
        );
        showToast(`✉️ Invitation email sent to ${email}!`, 'success');
      } else {
        await new Promise((r) => setTimeout(r, 900));
        showToast(`Invitation recorded for ${email}. Configure EmailJS to send real emails.`, 'info');
      }

      const newMember = {
        id: Date.now().toString(),
        name: email.split('@')[0],
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=0052CC&color=fff`,
        role: inviteRole,
        status: 'Invited',
        isOwner: false,
      };
      setMembers((prev) => [newMember, ...prev]);
      setInviteEmail('');

    } catch (err) {
      console.error('EmailJS error:', err);
      showToast('Failed to send email. Check your EmailJS configuration.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleRoleChange = (memberId, newRole) => {
    setMembers(members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
    showToast('Role updated successfully.', 'success');
  };

  const handleRemoveMember = (memberId) => {
    setMembers(members.filter((m) => m.id !== memberId));
    showToast('Member removed from workspace.', 'info');
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-[#DFE1E6] overflow-hidden my-6 text-[#172B4D] relative">
        
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-[#DFE1E6] flex items-center justify-between bg-[#FAFBFC]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0052CC]/10 text-[#0052CC] rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#172B4D]">
                Manage Workspace Members
              </h2>
              <p className="text-xs text-[#5E6C84]">
                Space: <span className="font-semibold text-[#0052CC]">{spaceName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toast.message && (
          <div className={`mx-6 sm:mx-8 mt-4 p-3 border text-xs rounded font-medium flex items-center gap-2 ${toastStyles[toast.type]}`}>
            {toastIcon[toast.type]}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Invite Teammates Section */}
        <div className="p-6 sm:p-8 space-y-6">
          <form onSubmit={handleInviteMember} className="space-y-3 bg-[#FAFBFC] p-4 rounded-lg border border-[#DFE1E6]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                Invite people to this workspace
              </label>
              {IS_CONFIGURED && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" /> Real emails enabled
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. teammate@company.com"
                  required
                  disabled={isSending}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#DFE1E6] rounded bg-white focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#4C9AFF]/20 transition-all font-medium disabled:opacity-60"
                />
              </div>

              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                disabled={isSending}
                className="px-3 py-2 text-xs font-semibold border border-[#DFE1E6] rounded bg-white focus:border-[#4C9AFF] cursor-pointer disabled:opacity-60"
              >
                <option value="Member">Member (Can edit)</option>
                <option value="Admin">Admin (Full access)</option>
                <option value="Viewer">Viewer (Read-only)</option>
              </select>

              <button
                type="submit"
                disabled={isSending}
                className="px-4 py-2 bg-[#0052CC] hover:bg-[#0065FF] disabled:bg-[#0052CC]/60 text-white text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0 min-w-[90px]"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending…</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Invite</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-[#5E6C84]">
              {IS_CONFIGURED
                ? '📧 An invitation email will be sent directly to this address.'
                : '⚠️ Configure EmailJS in src/emailjs.config.js to send real emails.'}
            </p>
          </form>

          {/* Members List Header & Search */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5E6C84]">
                Current Members ({members.length})
              </h3>
              <div className="relative w-48">
                <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search members"
                  className="w-full pl-7 pr-2.5 py-1 text-xs border border-[#DFE1E6] rounded bg-white focus:border-[#4C9AFF]"
                />
              </div>
            </div>

            {/* Members Table / List */}
            <div className="border border-[#DFE1E6] rounded-lg divide-y divide-[#DFE1E6] max-h-64 overflow-y-auto">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-[#FAFBFC] transition-colors"
                >
                  {/* User Profile */}
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200"
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#172B4D] truncate">{member.name}</p>
                        {member.isOwner && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
                            Space Owner
                          </span>
                        )}
                        {member.status === 'Invited' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold flex items-center gap-0.5">
                            <Mail className="w-2.5 h-2.5" /> Invited
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#5E6C84] truncate">{member.email}</p>
                    </div>
                  </div>

                  {/* Role Dropdown & Remove Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={member.role}
                      disabled={member.isOwner}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="px-2 py-1 text-xs font-medium border border-[#DFE1E6] rounded bg-white focus:border-[#4C9AFF] disabled:bg-gray-100 disabled:text-gray-500 cursor-pointer"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Member">Member</option>
                      <option value="Viewer">Viewer</option>
                    </select>

                    {!member.isOwner && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        title="Remove member"
                        className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-3.5 bg-[#FAFBFC] border-t border-[#DFE1E6] flex items-center justify-between">
          <p className="text-[11px] text-[#5E6C84]">
            Invited members receive an email with a link to join.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[#172B4D] bg-white border border-[#DFE1E6] hover:bg-gray-50 rounded shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

export default WorkspaceMemberModal;
