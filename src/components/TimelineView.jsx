import React from 'react';
import { Calendar, Plus, Clock, Bookmark, CheckSquare, Zap, AlertCircle } from 'lucide-react';

export const TimelineView = ({ onSelectCard, showNotification }) => {
  const epics = [
    {
      id: 'EPIC-1',
      title: 'Core Kanban Engine & Drag-and-Drop',
      icon: Zap,
      color: 'bg-purple-500',
      startCol: 1,
      spanCols: 4,
      progress: 85,
      assignee: 'Samarth Choudhary',
      status: 'IN PROGRESS',
    },
    {
      id: 'EPIC-2',
      title: 'Authentication & Social OAuth Chooser',
      icon: Bookmark,
      color: 'bg-emerald-500',
      startCol: 2,
      spanCols: 3,
      progress: 100,
      assignee: 'Shrutika',
      status: 'DONE',
    },
    {
      id: 'EPIC-3',
      title: 'Real-time WebSocket & Socket.io Handshake',
      icon: CheckSquare,
      color: 'bg-blue-500',
      startCol: 3,
      spanCols: 4,
      progress: 60,
      assignee: 'Samarth Choudhary',
      status: 'IN PROGRESS',
    },
    {
      id: 'EPIC-4',
      title: 'CI/CD Automated Deployment Pipeline',
      icon: AlertCircle,
      color: 'bg-amber-500',
      startCol: 4,
      spanCols: 3,
      progress: 40,
      assignee: 'Alex Morgan',
      status: 'TO DO',
    },
  ];

  const weeks = ['Oct 1 - Oct 7', 'Oct 8 - Oct 14', 'Oct 15 - Oct 21', 'Oct 22 - Oct 28', 'Oct 29 - Nov 4', 'Nov 5 - Nov 11'];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#172B4D]">Timeline (Roadmap)</h2>
          <p className="text-xs text-[#6B778C]">Visualize epics, dependencies, and milestones across the sprint schedule</p>
        </div>
        <button
          onClick={() => showNotification && showNotification('New epic planned for Sprint 2')}
          className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0065FF] text-white text-xs font-semibold rounded-[3px] flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Epic</span>
        </button>
      </div>

      {/* Gantt Grid */}
      <div className="border border-[#DFE1E6] rounded-lg bg-white overflow-hidden shadow-xs">
        {/* Weeks Header Row */}
        <div className="grid grid-cols-7 border-b border-[#DFE1E6] bg-[#FAFBFC] text-xs font-semibold text-[#5E6C84]">
          <div className="p-3 border-r border-[#DFE1E6] w-64 shrink-0">Epic / Feature</div>
          {weeks.map((w, idx) => (
            <div key={idx} className="p-3 text-center border-r last:border-r-0 border-[#DFE1E6] text-[11px]">
              {w}
            </div>
          ))}
        </div>

        {/* Epic Rows */}
        <div className="divide-y divide-[#DFE1E6]">
          {epics.map((epic) => {
            const Icon = epic.icon;
            return (
              <div key={epic.id} className="grid grid-cols-7 items-center hover:bg-[#FAFBFC] transition-colors text-xs py-2.5">
                <div className="px-3 flex items-center gap-2 border-r border-[#DFE1E6] w-64 shrink-0 font-medium text-[#172B4D]">
                  <Icon className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="truncate">{epic.title}</span>
                </div>

                {/* Timeline Bar spanning cols */}
                <div className="col-span-6 px-4 relative flex items-center h-8">
                  <div
                    style={{
                      marginLeft: `${(epic.startCol - 1) * 16.66}%`,
                      width: `${epic.spanCols * 16.66}%`,
                    }}
                    className={`h-7 ${epic.color} text-white rounded px-2.5 flex items-center justify-between text-[11px] font-semibold shadow-sm cursor-pointer hover:brightness-110 transition-all`}
                  >
                    <span className="truncate">{epic.id}</span>
                    <span className="text-[10px] bg-black/20 px-1.5 py-0.2 rounded font-bold">
                      {epic.progress}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
