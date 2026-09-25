import React, { useState } from 'react';
import {
  X,
  Bookmark,
  CheckSquare,
  AlertCircle,
  Zap,
  User,
  ChevronDown,
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';

export const CreateIssueModal = ({
  isOpen,
  onClose,
  onCreateIssue,
  defaultStatus = 'To Do',
  projectKey = 'KAN',
  projectName = 'KAN (Software project)',
  members = [
    { name: 'Samarth Choudhary', initials: 'SC', email: 'samarth.choudhary@softwareteam.com' },
    { name: 'Shrutika', initials: 'SH', email: 'shrutika@softwareteam.com' },
    { name: 'Alex Morgan', initials: 'AM', email: 'alex.m@softwareteam.com' },
  ],
}) => {
  if (!isOpen) return null;

  const [issueType, setIssueType] = useState('Task');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(defaultStatus);
  const [assignee, setAssignee] = useState('unassigned');
  const [priority, setPriority] = useState('Medium');
  const [storyPoints, setStoryPoints] = useState('');
  const [labelsInput, setLabelsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const issueTypes = [
    { id: 'Task', name: 'Task', icon: CheckSquare, color: 'text-[#0052CC]', iconType: 'check' },
    { id: 'Story', name: 'Story', icon: Bookmark, color: 'text-[#36B37E]', iconType: 'story' },
    { id: 'Bug', name: 'Bug', icon: AlertCircle, color: 'text-[#DE350B]', iconType: 'bug' },
    { id: 'Epic', name: 'Epic', icon: Zap, color: 'text-[#6554C0]', iconType: 'epic' },
  ];

  const priorities = [
    { id: 'Urgent', label: 'Urgent', color: 'text-[#DE350B]' },
    { id: 'High', label: 'High', color: 'text-[#FF5630]' },
    { id: 'Medium', label: 'Medium', color: 'text-[#FFAB00]' },
    { id: 'Low', label: 'Low', color: 'text-[#36B37E]' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!summary.trim()) {
      setError('Summary is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const assignedMember =
      assignee === 'unassigned'
        ? null
        : members.find((m) => m.name === assignee) || {
            name: assignee,
            initials: assignee.substring(0, 2).toUpperCase(),
          };

    const labels = labelsInput
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);

    const typeObj = issueTypes.find((t) => t.id === issueType) || issueTypes[0];

    try {
      await onCreateIssue({
        title: summary.trim(),
        description: description.trim(),
        status,
        iconType: typeObj.iconType,
        assignedTo: assignedMember,
        priority,
        storyPoints: storyPoints ? Number(storyPoints) : undefined,
        labels,
      });

      // Reset form
      setSummary('');
      setDescription('');
      setAssignee('unassigned');
      setLabelsInput('');
      setStoryPoints('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const SelectedIcon = issueTypes.find((t) => t.id === issueType)?.icon || CheckSquare;
  const selectedColor = issueTypes.find((t) => t.id === issueType)?.color || 'text-[#0052CC]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#091E42]/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#DFE1E6] overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#DFE1E6] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#172B4D]">Create issue</span>
            <span className="text-xs bg-[#E9F2FF] text-[#0052CC] font-semibold px-2 py-0.5 rounded">
              {projectKey}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B778C] hover:text-[#172B4D] hover:bg-[#EBECF0] rounded cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-[#172B4D] flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Project & Issue Type Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#6B778C] mb-1">
                Project <span className="text-red-500">*</span>
              </label>
              <div className="p-2 border border-[#DFE1E6] rounded bg-[#FAFBFC] font-semibold text-[#172B4D] flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#0052CC] text-white flex items-center justify-center text-[9px] font-bold">
                  {projectKey}
                </div>
                <span>{projectName}</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#6B778C] mb-1">
                Issue type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full p-2 border border-[#DFE1E6] rounded bg-white font-medium focus:border-[#4C9AFF] focus:ring-1 focus:ring-[#4C9AFF] appearance-none pr-8 cursor-pointer"
                >
                  {issueTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5 text-[#6B778C]">
                  <SelectedIcon className={`w-3.5 h-3.5 ${selectedColor}`} />
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#DFE1E6]" />

          {/* Summary Input */}
          <div>
            <label className="block font-bold text-[#172B4D] mb-1">
              Summary <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Implement user authentication flow"
              className="w-full p-2.5 border border-[#DFE1E6] rounded focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#4C9AFF]/20 text-xs font-medium placeholder:text-[#A5ADBA]"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-[#172B4D] mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add issue description or acceptance criteria..."
              rows={4}
              className="w-full p-2.5 border border-[#DFE1E6] rounded focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#4C9AFF]/20 text-xs placeholder:text-[#A5ADBA] resize-y"
            />
          </div>

          {/* Status, Priority & Assignee Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <label className="block font-bold text-[#6B778C] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border border-[#DFE1E6] rounded bg-white font-medium cursor-pointer"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block font-bold text-[#6B778C] mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 border border-[#DFE1E6] rounded bg-white font-medium cursor-pointer"
              >
                {priorities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block font-bold text-[#6B778C] mb-1">
                Assignee
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full p-2 border border-[#DFE1E6] rounded bg-white font-medium cursor-pointer"
              >
                <option value="unassigned">Unassigned (assignee = empty)</option>
                {members.map((m) => (
                  <option key={m.email || m.name} value={m.name}>
                    {m.name} ({m.initials})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Story Points & Labels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#6B778C] mb-1">
                Story Points Estimate
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                placeholder="e.g. 3"
                className="w-full p-2 border border-[#DFE1E6] rounded text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-[#6B778C] mb-1">
                Labels (comma-separated)
              </label>
              <input
                type="text"
                value={labelsInput}
                onChange={(e) => setLabelsInput(e.target.value)}
                placeholder="e.g. frontend, auth, backend"
                className="w-full p-2 border border-[#DFE1E6] rounded text-xs"
              />
            </div>
          </div>

          <div className="bg-[#F4F5F7] p-3 rounded flex items-center gap-2 text-[#5E6C84]">
            <Info className="w-4 h-4 text-[#0052CC] shrink-0" />
            <span className="text-[11px]">
              Issues created will immediately appear on the <strong>KAN board</strong> and synchronize in real-time across all team members.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-[#DFE1E6] pt-4 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded hover:bg-[#EBECF0] text-[#42526E] font-semibold text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0065FF] text-white font-semibold text-xs rounded shadow-xs cursor-pointer disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIssueModal;
