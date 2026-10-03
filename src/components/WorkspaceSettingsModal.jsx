import React, { useState } from 'react';
import {
  X,
  Settings,
  Shield,
  Palette,
  Users,
  Archive,
  Trash2,
  Check,
  AlertTriangle,
  Sparkles,
  Lock,
  Globe
} from 'lucide-react';

export const WorkspaceSettingsModal = ({
  isOpen,
  onClose,
  workspace,
  onUpdateWorkspace,
  showNotification,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('general'); // 'general', 'access', 'members', 'danger'
  const [name, setName] = useState(workspace?.name || 'My Software Team');
  const [key, setKey] = useState(workspace?.key || 'KAN');
  const [description, setDescription] = useState(
    workspace?.description || 'Core engineering workspace for agile delivery and CI/CD development tracking.'
  );
  const [category, setCategory] = useState(workspace?.category || 'Software');
  const [accessLevel, setAccessLevel] = useState('Team-managed'); // 'Public', 'Private', 'Team-managed'
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onUpdateWorkspace({
      name: name.trim(),
      key: key.trim().toUpperCase(),
      description: description.trim(),
      category,
      type: accessLevel,
    });
    if (showNotification) showNotification('Workspace settings saved successfully');
    onClose();
  };

  const handleArchive = () => {
    if (showNotification) showNotification('Workspace archived. Visible in archive vault.');
    onClose();
  };

  const handleDelete = () => {
    if (deleteConfirmText !== name) {
      if (showNotification) showNotification(`Type "${name}" to confirm deletion.`);
      return;
    }
    if (showNotification) showNotification('Workspace deleted.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn select-none">
      <div className="bg-white rounded-xl shadow-2xl border border-[#DFE1E6] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 px-6 border-b border-[#DFE1E6] flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2 text-[#172B4D]">
            <Settings className="w-5 h-5 text-[#0052CC]" />
            <h2 className="font-bold text-base">Space settings — {name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#EBECF0] text-[#6B778C] hover:text-[#172B4D] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 px-6 border-b border-[#DFE1E6] text-xs font-semibold text-[#42526E] bg-[#FAFBFC]">
          {[
            { id: 'general', label: 'General', icon: Settings },
            { id: 'access', label: 'Access & Permissions', icon: Shield },
            { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#0052CC] text-[#0052CC]'
                    : 'border-transparent hover:text-[#172B4D]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-[#172B4D]">
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-[#172B4D] block">Space Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-[#DFE1E6] rounded focus:border-[#4C9AFF] focus:ring-1 focus:ring-[#4C9AFF]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#172B4D] block">Key (Prefix)</label>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value.toUpperCase())}
                    maxLength={10}
                    className="w-full p-2 border border-[#DFE1E6] rounded focus:border-[#4C9AFF] font-mono uppercase"
                  />
                  <span className="text-[11px] text-[#6B778C]">Used for issue identifiers (e.g. KAN-1)</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#172B4D] block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-[#DFE1E6] rounded focus:border-[#4C9AFF] bg-white cursor-pointer"
                  >
                    <option value="Software">Software</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#172B4D] block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-[#DFE1E6] rounded focus:border-[#4C9AFF] leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DFE1E6]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded hover:bg-[#EBECF0] text-[#42526E] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0065FF] text-white font-semibold rounded cursor-pointer shadow-xs"
                >
                  Save changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ACCESS & PERMISSIONS */}
          {activeTab === 'access' && (
            <div className="space-y-4">
              <p className="text-xs text-[#6B778C]">
                Configure who can see and modify issues within this space.
              </p>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'Public',
                    title: 'Open / Public',
                    desc: 'Anyone with an account in your organization can view and create tasks.',
                    icon: Globe,
                  },
                  {
                    id: 'Team-managed',
                    title: 'Team-managed (Recommended)',
                    desc: 'Only invited workspace members and admins can view and transition tasks.',
                    icon: Users,
                  },
                  {
                    id: 'Private',
                    title: 'Restricted / Private',
                    desc: 'Strictly limited to explicitly designated admins.',
                    icon: Lock,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setAccessLevel(item.id)}
                    className={`p-3.5 rounded-lg border flex items-start gap-3 cursor-pointer transition-all ${
                      accessLevel === item.id
                        ? 'border-[#0052CC] bg-[#DEEBFF]/30 shadow-xs'
                        : 'border-[#DFE1E6] hover:bg-[#FAFBFC]'
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 shrink-0 mt-0.5 ${
                        accessLevel === item.id ? 'text-[#0052CC]' : 'text-[#6B778C]'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#172B4D]">{item.title}</span>
                        {accessLevel === item.id && (
                          <Check className="w-4 h-4 text-[#0052CC]" />
                        )}
                      </div>
                      <p className="text-[#6B778C] text-[11px] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DFE1E6]">
                <button
                  onClick={() => {
                    onUpdateWorkspace({ type: accessLevel });
                    if (showNotification) showNotification('Access permissions updated');
                    onClose();
                  }}
                  className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0065FF] text-white font-semibold rounded cursor-pointer shadow-xs"
                >
                  Apply settings
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DANGER ZONE */}
          {activeTab === 'danger' && (
            <div className="space-y-4">
              <div className="p-4 border border-[#FFAB00] bg-[#FFFAE6] rounded-lg text-xs text-[#172B4D] flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#FFAB00] shrink-0" />
                <div>
                  <h4 className="font-bold">Cautionary actions</h4>
                  <p className="text-[11px] text-[#42526E] mt-0.5">
                    Archiving removes the space from active dashboards. Deleting permanently destroys all sprint boards, issues, and attachments.
                  </p>
                </div>
              </div>

              {/* Archive */}
              <div className="p-3.5 border border-[#DFE1E6] rounded-lg flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-[#172B4D]">Archive this space</h5>
                  <p className="text-[11px] text-[#6B778C]">
                    Mark space as read-only and hide from active sidebar lists.
                  </p>
                </div>
                <button
                  onClick={handleArchive}
                  className="px-3 py-1.5 bg-[#FAFBFC] border border-[#DFE1E6] hover:bg-[#EBECF0] text-[#42526E] font-semibold rounded cursor-pointer"
                >
                  Archive space
                </button>
              </div>

              {/* Delete */}
              <div className="p-3.5 border border-[#DE350B]/30 bg-red-50/20 rounded-lg space-y-3">
                <div>
                  <h5 className="font-bold text-[#DE350B]">Delete this space permanently</h5>
                  <p className="text-[11px] text-[#6B778C]">
                    Type <span className="font-bold text-[#172B4D] select-all">{name}</span> below to confirm deletion.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={`Type ${name} here`}
                    className="flex-1 p-1.5 border border-[#DFE1E6] rounded text-xs"
                  />
                  <button
                    onClick={handleDelete}
                    disabled={deleteConfirmText !== name}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                      deleteConfirmText === name
                        ? 'bg-[#DE350B] text-white hover:bg-red-700 shadow-xs'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Delete space
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettingsModal;
