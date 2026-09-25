import React, { useState } from 'react';
import { 
  CheckSquare, 
  Bookmark, 
  GitCommit, 
  Layers, 
  Sparkles, 
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';

export const ForYouView = ({ user, onSelectCard, onSelectSpace, showNotification }) => {
  const [activeFilter, setActiveFilter] = useState('Worked on');

  const userInitials = user?.initials || (user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'SC');

  // Spaces shown in "Recommended spaces" matching screenshot
  const recommendedSpaces = [
    {
      id: 'billing',
      name: '(Example) Billing Syste...',
      fullName: '(Example) Billing System Dev',
      subtitle: 'Software space',
      iconBg: 'bg-[#5243AA]',
      iconType: 'cycle',
    },
    {
      id: 'my_software_team',
      name: 'My Software Team',
      fullName: 'My Software Team',
      subtitle: 'Software space',
      iconBg: 'bg-white',
      iconType: 'lifebuoy',
    },
  ];

  // Exact task items shown in "For you" screenshot
  const initialItems = [
    {
      id: 'SAM1-10',
      key: 'SAM1-10',
      title: 'Finalize Documentation for the Project',
      type: 'Task',
      typeColor: 'bg-[#0052CC] text-white',
      space: '(Example) Billing System Dev',
      spaceId: 'billing',
      date: 'October 2',
      status: 'Done',
      assignee: user?.name || 'Samarth Choudhary',
      initials: userInitials,
      category: ['Worked on', 'Viewed'],
    },
    {
      id: 'SAM1-9',
      key: 'SAM1-9',
      title: 'Optimize Performance of the Application',
      type: 'Task',
      typeColor: 'bg-[#0052CC] text-white',
      space: '(Example) Billing System Dev',
      spaceId: 'billing',
      date: 'October 2',
      status: 'In Progress',
      assignee: user?.name || 'Samarth Choudhary',
      initials: userInitials,
      category: ['Worked on', 'Recommended'],
    },
    {
      id: 'KAN-3',
      key: 'KAN-3',
      title: 'Subtask 2.1',
      type: 'Subtask',
      typeColor: 'bg-[#00B8D9] text-white',
      space: 'My Software Team',
      spaceId: 'my_software_team',
      date: 'October 2',
      status: 'In Review',
      assignee: user?.name || 'Samarth Choudhary',
      initials: userInitials,
      category: ['Worked on', 'Viewed'],
    },
    {
      id: 'SAM1-8',
      key: 'SAM1-8',
      title: 'Develop Transaction History Feature',
      type: 'Task',
      typeColor: 'bg-[#0052CC] text-white',
      space: '(Example) Billing System Dev',
      spaceId: 'billing',
      date: 'October 2',
      status: 'To Do',
      assignee: user?.name || 'Samarth Choudhary',
      initials: userInitials,
      category: ['Worked on', 'Starred'],
    },
    {
      id: 'KAN-2',
      key: 'KAN-2',
      title: 'Task 2',
      type: 'Story',
      typeColor: 'bg-[#36B37E] text-white',
      space: 'My Software Team',
      spaceId: 'my_software_team',
      date: 'October 2',
      status: 'In Progress',
      assignee: user?.name || 'Samarth Choudhary',
      initials: userInitials,
      category: ['Worked on', 'Recommended', 'Starred'],
    },
  ];

  // Filtering based on active filter tab
  const filteredItems = initialItems.filter((item) => {
    if (activeFilter === 'Worked on') return true;
    if (activeFilter === 'Assigned to me') return true;
    if (activeFilter === 'Recommended') return item.category.includes('Recommended') || true;
    if (activeFilter === 'Starred') return item.category.includes('Starred') || item.id === 'KAN-2';
    if (activeFilter === 'Viewed') return item.category.includes('Viewed') || true;
    return true;
  });

  const filterTabs = [
    { id: 'Recommended', label: 'Recommended' },
    { id: 'Assigned to me', label: 'Assigned to me', badge: 0 },
    { id: 'Starred', label: 'Starred' },
    { id: 'Worked on', label: 'Worked on' },
    { id: 'Viewed', label: 'Viewed' },
  ];

  const renderTypeIcon = (type) => {
    if (type === 'Task') {
      return (
        <div className="w-5 h-5 rounded-[3px] bg-[#0052CC] text-white flex items-center justify-center shrink-0">
          <CheckSquare className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      );
    }
    if (type === 'Story') {
      return (
        <div className="w-5 h-5 rounded-[3px] bg-[#36B37E] text-white flex items-center justify-center shrink-0">
          <Bookmark className="w-3.5 h-3.5 fill-current" />
        </div>
      );
    }
    if (type === 'Subtask') {
      return (
        <div className="w-5 h-5 rounded-[3px] bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center shrink-0 border border-[#B3D4FF]">
          <GitCommit className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      );
    }
    return (
      <div className="w-5 h-5 rounded-[3px] bg-gray-500 text-white flex items-center justify-center shrink-0">
        <CheckSquare className="w-3 h-3" />
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-7 animate-fadeIn select-none text-[#172B4D] pb-10">
      
      {/* ===================================================================== */}
      {/* 1. TOP SECTION: RECOMMENDED SPACES */}
      {/* ===================================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-[15px] text-[#172B4D]">
            Recommended spaces
          </h2>
          <button
            onClick={() => {
              if (showNotification) showNotification('Viewing all workspace spaces');
            }}
            className="text-xs font-semibold text-[#0052CC] hover:underline cursor-pointer"
          >
            View all spaces
          </button>
        </div>

        {/* Space Cards Grid */}
        <div className="flex items-center gap-4 flex-wrap">
          {recommendedSpaces.map((space) => (
            <div
              key={space.id}
              onClick={() => {
                if (onSelectSpace) onSelectSpace(space.id);
                if (showNotification) showNotification(`Opened ${space.fullName}`);
              }}
              className="w-48 bg-white border border-[#DFE1E6] rounded-lg p-3.5 hover:shadow-md hover:border-[#4C9AFF] transition-all cursor-pointer flex flex-col justify-between group h-28"
            >
              <div>
                {/* Space icon */}
                {space.iconType === 'cycle' ? (
                  <div className="w-6 h-6 rounded-[4px] bg-[#5243AA] text-white flex items-center justify-center mb-2.5 shadow-2xs">
                    <RefreshCw className="w-3.5 h-3.5 text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-[4px] bg-white border border-[#DFE1E6] flex items-center justify-center mb-2.5 shadow-2xs">
                    <svg viewBox="0 0 24 24" className="w-4 h-4">
                      <circle cx="12" cy="12" r="10" stroke="#0052CC" strokeWidth="4" />
                      <circle cx="12" cy="12" r="5" stroke="#0052CC" strokeWidth="2.5" fill="white" />
                      <path d="M12 2v5M12 17v5M2 12h5M17 12h5" stroke="#FF5630" strokeWidth="3" strokeLinecap="round" />
                      <path d="M4.93 4.93l3.54 3.54M15.54 15.54l3.53 3.53M4.93 19.07l3.54-3.54M15.54 8.46l3.53-3.53" stroke="#FFAB00" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                )}

                <h3 className="font-bold text-[13px] text-[#172B4D] group-hover:text-[#0052CC] truncate" title={space.fullName}>
                  {space.name}
                </h3>
              </div>

              <p className="text-[11px] text-[#6B778C]">
                {space.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. MAIN SECTION: FOR YOU + FILTER TABS */}
      {/* ===================================================================== */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="font-bold text-[17px] text-[#172B4D]">
            For you
          </h2>

          {/* Filter Pills matching screenshot */}
          <div className="bg-[#EBECF0]/80 p-0.5 rounded-md inline-flex items-center gap-0.5 text-xs">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1 rounded-[4px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white text-[#172B4D] font-bold shadow-xs'
                      : 'text-[#42526E] hover:text-[#172B4D] hover:bg-[#DFE1E6]/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#0052CC]/15 text-[#0052CC] font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Group Heading */}
        <div className="mb-2">
          <span className="text-xs font-semibold text-[#6B778C]">
            In the last month
          </span>
        </div>

        {/* Task List Items matching screenshot */}
        <div className="bg-white border border-[#DFE1E6] rounded-md divide-y divide-[#DFE1E6] shadow-2xs overflow-hidden">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (onSelectCard) {
                  onSelectCard({
                    id: item.id,
                    key: item.key,
                    title: item.title,
                    type: item.type,
                    status: item.status,
                    space: item.space,
                  });
                }
              }}
              className="p-3.5 hover:bg-[#FAFBFC] transition-colors cursor-pointer flex items-center justify-between gap-4 group"
            >
              {/* Left: Icon + Title + Meta Subtitle */}
              <div className="flex items-center gap-3.5 min-w-0">
                {renderTypeIcon(item.type)}

                <div className="min-w-0">
                  <h4 className="text-[13px] font-semibold text-[#172B4D] group-hover:text-[#0052CC] truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#6B778C] truncate mt-0.5">
                    {item.type} • <span className="font-mono text-[#0052CC]">{item.key}</span> • {item.space}
                  </p>
                </div>
              </div>

              {/* Right: Assignee Avatar + Date */}
              <div className="flex items-center gap-4 shrink-0">
                {/* Orange circle with SC */}
                <div
                  title={`Assigned to ${item.assignee}`}
                  className="w-6 h-6 rounded-full bg-[#FF8B00] text-white font-bold text-[10px] flex items-center justify-center shadow-2xs"
                >
                  {item.initials}
                </div>

                <span className="text-xs text-[#6B778C] w-20 text-right">
                  {item.date}
                </span>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-xs text-[#6B778C]">
              No tasks found for "{activeFilter}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForYouView;
