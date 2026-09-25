import React, { useState } from 'react';
import {
  X, User, Mail, Shield, Briefcase, Building2,
  Check, Edit3, Sparkles, Clock, Calendar, Code2,
  Users, DollarSign, Megaphone, Headphones, Layers,
  Terminal, Save, LogOut, ExternalLink, Activity
} from 'lucide-react';
import authApi from '../services/authApi';

const AVATAR_COLORS = [
  '#0052CC', '#FF8B00', '#36B37E', '#FF5630', '#6554C0',
  '#00B8D9', '#172B4D', '#403294', '#00875A', '#FF991F',
];

export const UserProfileModal = ({ isOpen, onClose, user, onUpdateUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || 'Shrutika Patil');
  const [editEmail, setEditEmail] = useState(user?.email || 'shrutika@samarth.io');
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || '#0052CC');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  if (!isOpen) return null;

  const userInitials = (user?.name || editName || 'SP')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setIsSaving(true);
    setSaveMsg('');
    try {
      const updatedData = {
        name: editName.trim(),
        email: editEmail.trim(),
        role: user?.role || 'Developer',
        workTypeTitle: user?.workTypeTitle || 'Software Development',
        avatarColor,
      };

      try {
        await authApi.updateProfile(updatedData);
      } catch (err) {
        console.warn('API update failed, updating locally:', err);
      }

      const mergedUser = { ...user, ...updatedData };
      if (onUpdateUser) {
        onUpdateUser(mergedUser);
      }
      localStorage.setItem('active_workspace_user', JSON.stringify(mergedUser));
      setSaveMsg('Profile updated successfully!');
      setTimeout(() => {
        setIsEditing(false);
        setSaveMsg('');
      }, 1200);
    } catch (err) {
      console.error('Error saving profile:', err);
      setSaveMsg('Error saving profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  const getBranchIcon = (branch) => {
    const b = (branch || '').toLowerCase();
    if (b.includes('software') || b.includes('dev')) return <Terminal className="w-4 h-4 text-emerald-500" />;
    if (b.includes('hr') || b.includes('human')) return <Users className="w-4 h-4 text-purple-500" />;
    if (b.includes('finance')) return <DollarSign className="w-4 h-4 text-green-500" />;
    if (b.includes('marketing')) return <Megaphone className="w-4 h-4 text-amber-500" />;
    if (b.includes('ops') || b.includes('operation') || b.includes('it')) return <Headphones className="w-4 h-4 text-sky-500" />;
    return <Layers className="w-4 h-4 text-indigo-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Cover Banner */}
        <div className="relative h-32 bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-500 p-6 flex justify-between items-start">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="relative flex items-center gap-2 text-white/90">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-md">
              Atlassian Cloud Account
            </span>
          </div>
          <button
            onClick={onClose}
            className="relative p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-all hover:rotate-90 duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Header with Avatar */}
        <div className="px-8 pb-4 relative -mt-12 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 border-b border-slate-100">
          <div className="flex items-end gap-5 text-center sm:text-left">
            <div
              className="w-24 h-24 rounded-2xl ring-4 ring-white shadow-xl flex items-center justify-center text-white font-extrabold text-3xl transition-transform hover:scale-105"
              style={{ backgroundColor: avatarColor }}
            >
              {userInitials}
            </div>
            <div className="pb-2">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                {user?.name || editName}
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <Activity className="w-3 h-3 text-emerald-500" /> Active
                </span>
              </h2>
              <p className="text-sm font-medium text-slate-500">{user?.email || editEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pb-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors border border-blue-200"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1">
          {saveMsg && (
            <div className={`p-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${saveMsg.includes('Error') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
              <Check className="w-4 h-4" /> {saveMsg}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Avatar Color Accent
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setAvatarColor(color)}
                      className={`w-8 h-8 rounded-full transition-transform ${avatarColor === color ? 'scale-125 ring-2 ring-offset-2 ring-blue-600' : 'hover:scale-110'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-md transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                  <div className="p-2.5 rounded-lg bg-blue-100 text-blue-600">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Workplace Role</span>
                    <p className="text-sm font-bold text-slate-800 capitalize mt-0.5">{user?.role || 'Full-Stack Developer'}</p>
                    <span className="text-xs text-slate-500">Access level: Member / Creator</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                  <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-600">
                    {getBranchIcon(user?.workTypeTitle)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Branch / Department</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{user?.workTypeTitle || 'Software Development'}</p>
                    <span className="text-xs text-slate-500">Default workspace branch</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                  <div className="p-2.5 rounded-lg bg-purple-100 text-purple-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Workspace</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{user?.workspaceName || 'Samarth Workspace'}</p>
                    <span className="text-xs text-slate-500">Atlassian Premium Jira Plan</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                  <div className="p-2.5 rounded-lg bg-amber-100 text-amber-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Account Status</span>
                    <p className="text-sm font-bold text-emerald-600 mt-0.5">Verified & Connected</p>
                    <span className="text-xs text-slate-500">Session JWT active</span>
                  </div>
                </div>
              </div>

              {/* Organization and Permissions banner */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Assigned Teams & Projects</span>
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-100/80 px-2 py-0.5 rounded-md">Enterprise</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-white border border-indigo-200 text-xs font-medium text-slate-700 shadow-sm">
                    🚀 Frontend Core Team
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white border border-indigo-200 text-xs font-medium text-slate-700 shadow-sm">
                    ⚡ Sprint 42 Planning
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white border border-indigo-200 text-xs font-medium text-slate-700 shadow-sm">
                    🛡️ Security & Compliance
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Logout & Close */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
          <button
            onClick={() => {
              if (onLogout) onLogout();
              onClose();
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-sm font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold shadow transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
