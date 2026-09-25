/**
 * Week 1: Day 3-5 — Create Workspace Modal
 * Allows users to create a new workspace with name, key, category, description.
 * Calls kanbanApi.createWorkspace() for persistence.
 */

import React, { useState } from 'react';
import {
  X,
  Plus,
  Briefcase,
  Code,
  Palette,
  BarChart2,
  Globe,
  Users,
  Sparkles,
  Check,
} from 'lucide-react';

const WORKSPACE_CATEGORIES = [
  { value: 'Software', icon: Code, color: '#0052CC', description: 'Engineering & development' },
  { value: 'Marketing', icon: BarChart2, color: '#FF8B00', description: 'Campaigns & analytics' },
  { value: 'Business', icon: Briefcase, color: '#36B37E', description: 'Operations & strategy' },
  { value: 'Design', icon: Palette, color: '#6554C0', description: 'Creative & UX' },
  { value: 'HR', icon: Users, color: '#00C7E6', description: 'People & culture' },
];

const ACCESS_TYPES = [
  { value: 'Team-managed', label: 'Team-managed', description: 'Your team controls its own working processes' },
  { value: 'Company-managed', label: 'Company-managed', description: 'An admin controls how the project works' },
];

export const CreateWorkspaceModal = ({ isOpen, onClose, onCreateWorkspace, showNotification }) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Software');
  const [accessType, setAccessType] = useState('Team-managed');
  const [isCreating, setIsCreating] = useState(false);
  const [autoKey, setAutoKey] = useState(true);

  if (!isOpen) return null;

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    // Auto-generate key from name
    if (autoKey) {
      const generated = newName
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .substring(0, 4);
      setKey(generated || '');
    }
  };

  const handleKeyChange = (e) => {
    setAutoKey(false);
    setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      const newWorkspace = {
        name: name.trim(),
        key: key.trim() || name.trim().substring(0, 3).toUpperCase(),
        category,
        type: accessType,
        description: description.trim(),
      };

      if (onCreateWorkspace) {
        await onCreateWorkspace(newWorkspace);
      }
      if (showNotification) {
        showNotification(`Workspace "${name.trim()}" created successfully!`);
      }
      onClose();
    } catch (err) {
      if (showNotification) {
        showNotification(err.message || 'Failed to create workspace');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const selectedCategory = WORKSPACE_CATEGORIES.find((c) => c.value === category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn select-none">
      <div className="bg-white rounded-xl shadow-2xl border border-[#DFE1E6] max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 px-6 border-b border-[#DFE1E6] flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2 text-[#172B4D]">
            <Plus className="w-5 h-5 text-[#0052CC]" />
            <h2 className="font-bold text-base">Create a new workspace</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#EBECF0] text-[#6B778C] hover:text-[#172B4D] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Workspace Name */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1.5">
              Workspace name <span className="text-[#DE350B]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g., My Engineering Team"
              className="w-full px-3 py-2 text-sm bg-white border border-[#DFE1E6] rounded-[3px] focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#4C9AFF]/20 transition-colors"
              autoFocus
              required
            />
          </div>

          {/* Project Key */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1.5">
              Key
            </label>
            <input
              type="text"
              value={key}
              onChange={handleKeyChange}
              placeholder="AUTO"
              maxLength={6}
              className="w-full px-3 py-2 text-sm bg-white border border-[#DFE1E6] rounded-[3px] focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#4C9AFF]/20 transition-colors font-mono uppercase"
            />
            <p className="text-[11px] text-[#6B778C] mt-1">
              Used as a prefix for issues (e.g., {key || 'KEY'}-1, {key || 'KEY'}-2)
            </p>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {WORKSPACE_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0052CC] bg-[#E9F2FF]'
                        : 'border-[#DFE1E6] hover:border-[#B3D4FF] bg-white'
                    }`}
                  >
                    <Icon
                      className="w-5 h-5 mb-1"
                      style={{ color: cat.color }}
                    />
                    <p className={`text-xs font-semibold ${isSelected ? 'text-[#0052CC]' : 'text-[#172B4D]'}`}>
                      {cat.value}
                    </p>
                    <p className="text-[10px] text-[#6B778C] leading-tight mt-0.5">
                      {cat.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Access Type */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-2">
              Access
            </label>
            <div className="space-y-2">
              {ACCESS_TYPES.map((at) => (
                <label
                  key={at.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    accessType === at.value
                      ? 'border-[#0052CC] bg-[#E9F2FF]'
                      : 'border-[#DFE1E6] hover:border-[#B3D4FF]'
                  }`}
                >
                  <input
                    type="radio"
                    name="accessType"
                    checked={accessType === at.value}
                    onChange={() => setAccessType(at.value)}
                    className="mt-0.5 accent-[#0052CC]"
                  />
                  <div>
                    <p className="text-xs font-semibold text-[#172B4D]">{at.label}</p>
                    <p className="text-[11px] text-[#6B778C]">{at.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1.5">
              Description <span className="text-[#6B778C] font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this workspace about?"
              rows={3}
              className="w-full px-3 py-2 text-sm bg-white border border-[#DFE1E6] rounded-[3px] focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#4C9AFF]/20 transition-colors resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#DFE1E6] flex items-center justify-between bg-[#FAFBFC]">
          <div className="flex items-center gap-1.5 text-xs text-[#6B778C]">
            {selectedCategory && (
              <>
                <selectedCategory.icon className="w-3.5 h-3.5" style={{ color: selectedCategory.color }} />
                <span>{selectedCategory.value}</span>
                <span>·</span>
                <span>{accessType}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-[#42526E] bg-white border border-[#DFE1E6] rounded-[3px] hover:bg-[#EBECF0] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || isCreating}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0052CC] rounded-[3px] hover:bg-[#0065FF] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              {isCreating ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>Create workspace</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
