import React from 'react';
import { Play, Plus, CheckSquare, Bookmark, AlertCircle, User, MoreHorizontal } from 'lucide-react';

export const BacklogView = ({ onSelectCard, showNotification, onRequestCreateIssue }) => {
  const sprintIssues = [
    { id: 'KAN-1', title: 'Task 1', type: 'check', status: 'TO DO', priority: 'High', points: 3, assignee: null },
    { id: 'KAN-2', title: 'Task 2: Configure sprint boards and link CI/CD repositories', type: 'story', status: 'IN PROGRESS', priority: 'Medium', points: 5, assignee: 'Samarth Choudhary', initials: 'SC' },
    { id: 'KAN-4', title: 'Implement OAuth Chooser & SSO Security', type: 'story', status: 'IN REVIEW', priority: 'High', points: 5, assignee: 'Shrutika', initials: 'SH' },
  ];

  const backlogIssues = [
    { id: 'KAN-3', title: 'Setup GitHub Actions CI/CD Deployment', type: 'check', status: 'TO DO', priority: 'High', points: 2, assignee: null },
    { id: 'KAN-5', title: 'Production Redis Cluster & Socket.io Handshake', type: 'story', status: 'TO DO', priority: 'Medium', points: 8, assignee: null },
    { id: 'KAN-6', title: 'Multi-workspace Member Permissions & RBAC', type: 'story', status: 'TO DO', priority: 'Low', points: 3, assignee: 'Alex Morgan', initials: 'AM' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn text-xs text-[#172B4D]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#172B4D]">Backlog & Sprint Planning</h2>
          <p className="text-xs text-[#6B778C]">Prioritize issues, groom backlogs, and plan upcoming sprints for KAN</p>
        </div>
        <button
          onClick={onRequestCreateIssue}
          className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0065FF] text-white text-xs font-semibold rounded-[3px] flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Issue</span>
        </button>
      </div>

      {/* SPRINT 1 CONTAINER */}
      <div className="border border-[#DFE1E6] rounded-lg bg-white overflow-hidden shadow-xs">
        <div className="px-4 py-3 bg-[#FAFBFC] border-b border-[#DFE1E6] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#172B4D]">Sprint 1 (Active)</span>
            <span className="text-[11px] text-[#6B778C]">Oct 1 - Oct 15</span>
            <span className="text-[10px] px-2 py-0.5 bg-[#E9F2FF] text-[#0052CC] font-bold rounded-full">
              {sprintIssues.length} issues
            </span>
          </div>
          <button
            onClick={() => showNotification && showNotification('Sprint 1 is actively running in KAN board')}
            className="px-3 py-1 bg-white hover:bg-[#EBECF0] text-[#42526E] border border-[#DFE1E6] rounded text-xs font-semibold cursor-pointer shadow-2xs"
          >
            Complete sprint
          </button>
        </div>

        {/* Sprint Issue List */}
        <div className="divide-y divide-[#DFE1E6]">
          {sprintIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => onSelectCard && onSelectCard(issue)}
              className="px-4 py-2.5 flex items-center justify-between hover:bg-[#FAFBFC] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                {issue.type === 'story' ? (
                  <Bookmark className="w-3.5 h-3.5 text-[#36B37E]" />
                ) : (
                  <CheckSquare className="w-3.5 h-3.5 text-[#0052CC]" />
                )}
                <span className="font-semibold text-[#5E6C84] group-hover:underline">{issue.id}</span>
                <span className="font-medium text-[#172B4D] group-hover:text-[#0052CC]">{issue.title}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[#EBECF0] text-[#42526E]">
                  {issue.status}
                </span>
                <span className="w-5 h-5 rounded-full bg-[#EBECF0] text-[#42526E] text-[10px] font-bold flex items-center justify-center">
                  {issue.points}
                </span>
                {issue.assignee ? (
                  <div className="w-5 h-5 rounded-full bg-[#FF8B00] text-white text-[10px] font-bold flex items-center justify-center">
                    {issue.initials}
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#EBECF0] text-[#6B778C] flex items-center justify-center" title="assignee = empty">
                    <User className="w-3 h-3 text-[#6B778C]" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BACKLOG CONTAINER */}
      <div className="border border-[#DFE1E6] rounded-lg bg-white overflow-hidden shadow-xs">
        <div className="px-4 py-3 bg-[#FAFBFC] border-b border-[#DFE1E6] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#172B4D]">Backlog</span>
            <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700 font-bold rounded-full">
              {backlogIssues.length} issues
            </span>
          </div>
          <button
            onClick={() => showNotification && showNotification('Created Sprint 2')}
            className="px-3 py-1 bg-white hover:bg-[#EBECF0] text-[#42526E] border border-[#DFE1E6] rounded text-xs font-semibold cursor-pointer shadow-2xs"
          >
            Create sprint
          </button>
        </div>

        {/* Backlog Issue List */}
        <div className="divide-y divide-[#DFE1E6]">
          {backlogIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => onSelectCard && onSelectCard(issue)}
              className="px-4 py-2.5 flex items-center justify-between hover:bg-[#FAFBFC] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                {issue.type === 'story' ? (
                  <Bookmark className="w-3.5 h-3.5 text-[#36B37E]" />
                ) : (
                  <CheckSquare className="w-3.5 h-3.5 text-[#0052CC]" />
                )}
                <span className="font-semibold text-[#5E6C84] group-hover:underline">{issue.id}</span>
                <span className="font-medium text-[#172B4D] group-hover:text-[#0052CC]">{issue.title}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[#EBECF0] text-[#42526E]">
                  {issue.status}
                </span>
                <span className="w-5 h-5 rounded-full bg-[#EBECF0] text-[#42526E] text-[10px] font-bold flex items-center justify-center">
                  {issue.points}
                </span>
                {issue.assignee ? (
                  <div className="w-5 h-5 rounded-full bg-[#36B37E] text-white text-[10px] font-bold flex items-center justify-center">
                    {issue.initials}
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#EBECF0] text-[#6B778C] flex items-center justify-center" title="assignee = empty">
                    <User className="w-3 h-3 text-[#6B778C]" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BacklogView;
