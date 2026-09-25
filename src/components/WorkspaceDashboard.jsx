import React, { useState } from 'react';
import {
  Grid,
  Search,
  Plus,
  Bell,
  HelpCircle,
  Settings,
  Star,
  Clock,
  User,
  Compass,
  ChevronRight,
  Share2,
  Zap,
  Maximize2,
  Globe,
  List as ListIcon,
  Columns,
  Code,
  FileText,
  Calendar,
  Layers,
  Filter,
  BarChart2,
  Sliders,
  MoreHorizontal,
  CheckSquare,
  Bookmark,
  Sparkles,
  ExternalLink,
  Users as UsersIcon,
  LogOut,
  LayoutDashboard,
  UserPlus,
  Trash2,
  Archive,
  Palette,
  Check,
  MessageSquare,
  Copy,
  FolderGit2,
  Radio,
  ChevronDown,
  Briefcase,
  RefreshCw,
  Menu,
  LayoutGrid,
} from 'lucide-react';

import { SeePlansModal } from './SeePlansModal';
import { WorkspaceMemberModal } from './WorkspaceMemberModal';
import { DevelopmentView } from './DevelopmentView';
import { TaskDetailModal } from './TaskDetailModal';
import { KanbanBoardEngine } from './KanbanBoardEngine';
import { WorkspaceSettingsModal } from './WorkspaceSettingsModal';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';
import { CreateIssueModal } from './CreateIssueModal';
import { TimelineView } from './TimelineView';
import { BacklogView } from './BacklogView';
import { SearchEngineModal } from './SearchEngineModal';
import { NotificationCenter } from './NotificationCenter';
import { ForYouView } from './ForYouView';
import { ExploreAppsView } from './ExploreAppsView';
import { CreatePlanModal } from './CreatePlanModal';
import { UserProfileModal } from './UserProfileModal';
import kanbanApi from '../services/kanbanApi';

export const WorkspaceDashboard = ({ user: initialUser, onLogout, onOpenOnboarding }) => {
  const [user, setUser] = useState(initialUser);
  const [teamName, setTeamName] = useState(initialUser?.workspaceName || 'Samarth Workplace');

  React.useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      if (initialUser.workspaceName) setTeamName(initialUser.workspaceName);
    }
  }, [initialUser]);
  const [isStarred, setIsStarred] = useState(true);
  const [showSpaceMenu, setShowSpaceMenu] = useState(false);
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activePlan, setActivePlan] = useState('Standard');
  const [statusNotification, setStatusNotification] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [boardRefreshKey, setBoardRefreshKey] = useState(0);
  const [activeSpace, setActiveSpace] = useState('my_software_team');
  const [isRecentExpanded, setIsRecentExpanded] = useState(false);
  const [isStarredExpanded, setIsStarredExpanded] = useState(false);
  const [activeSidebarNav, setActiveSidebarNav] = useState('Starred');

  // Global hotkeys: '/' or 'Cmd/Ctrl + K' opens Search Engine Modal
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if already in an input/textarea
      if (
        ['INPUT', 'TEXTAREA'].includes(e.target.tagName) ||
        e.target.isContentEditable
      ) {
        return;
      }

      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenTaskFromNotification = async (cardId) => {
    try {
      const card = await kanbanApi.getCardById(cardId);
      if (card) {
        setSelectedTask(card);
      } else {
        setSelectedTask({ id: cardId, key: cardId, title: `Task ${cardId}` });
      }
    } catch {
      setSelectedTask({ id: cardId, key: cardId, title: `Task ${cardId}` });
    }
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'SC';

  // Active view: 'Board' (KAN board), 'Timeline', 'Backlog', 'Development' (Code)
  const [activeTab, setActiveTab] = useState('Board');

  const showNotification = (msg) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(''), 2800);
  };

  const handleCopyJiraLink = () => {
    const url = 'https://samarth13p2417.atlassian.net/jira/software/projects/KAN/boards/2?filter=assignee%20%3D%20empty&groupBy=none';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showNotification('Copied Jira board URL to clipboard!');
    } else {
      showNotification(url);
    }
  };

  const handleCreateIssue = async (issueData) => {
    try {
      const created = await kanbanApi.createCard('list_todo', issueData);
      setBoardRefreshKey((prev) => prev + 1);
      showNotification(`Created issue ${created.id}: ${created.title}`);
    } catch (err) {
      console.error('Failed to create issue:', err);
      showNotification('Failed to create issue');
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#172B4D] flex flex-col font-sans antialiased text-[14px] selection:bg-[#DEEBFF] selection:text-[#0747A6]">
      
      {/* Toast Notification */}
      {statusNotification && (
        <div className="fixed top-14 right-6 z-50 bg-[#172B4D] text-white px-4 py-2 rounded shadow-xl text-xs font-medium animate-fadeIn flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. OFFICIAL ATLASSIAN JIRA SOFTWARE TOP NAVIGATION BAR */}
      {/* ===================================================================== */}
      <header className="h-12 border-b border-[#DFE1E6] px-3.5 flex items-center justify-between sticky top-0 z-40 bg-white select-none">
        {/* Left: App Switcher + Jira Software Logo + Main Menus */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* 9-dot Jira app switcher */}
          <button className="p-1.5 rounded hover:bg-[#EBECF0] text-[#42526E] cursor-pointer">
            <div className="grid grid-cols-3 gap-0.5 w-4 h-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-[#42526E] rounded-full" />
              ))}
            </div>
          </button>

          {/* Atlassian Jira Logo */}
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveTab('Board')}>
            <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0">
              <path fill="#0052CC" d="M11.53 2c0 5.23 4.24 9.47 9.47 9.47H22V2h-10.47z"/>
              <path fill="#2684FF" d="M2 11.53c0 5.23 4.24 9.47 9.47 9.47h1.06v-9.47H2z"/>
              <path fill="#0052CC" d="M11.53 11.53c0 5.23 4.24 9.47 9.47 9.47H22v-9.47h-10.47z"/>
            </svg>
            <span className="font-bold text-[18px] tracking-tight text-[#172B4D]">Jira</span>
            <span className="text-xs font-semibold text-[#6B778C] hidden md:inline">Software</span>
          </div>

          {/* Top Dropdown Links */}
          <nav className="hidden lg:flex items-center gap-1 text-[13px] font-medium text-[#42526E]">
            <button className="px-2.5 py-1.5 rounded hover:bg-[#EBECF0] flex items-center gap-1 cursor-pointer">
              <span>Your work</span>
              <ChevronDown className="w-3 h-3 text-[#6B778C]" />
            </button>

            {/* Projects dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProjectsDropdown(!showProjectsDropdown)}
                className="px-2.5 py-1.5 rounded bg-[#E9F2FF] text-[#0052CC] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Projects</span>
                <ChevronDown className="w-3 h-3 text-[#0052CC]" />
              </button>

              {showProjectsDropdown && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowProjectsDropdown(false)} />
                  <div className="absolute left-0 top-9 w-64 bg-white border border-[#DFE1E6] rounded-md shadow-xl py-2 z-40 animate-fadeIn text-xs">
                    <p className="px-3 py-1 font-bold text-[#6B778C] uppercase text-[10px] tracking-wider">
                      Recent Projects
                    </p>
                    <div
                      onClick={() => {
                        setActiveTab('Board');
                        setShowProjectsDropdown(false);
                      }}
                      className="px-3 py-2 hover:bg-[#FAFBFC] flex items-center gap-2.5 cursor-pointer bg-[#F4F5F7]"
                    >
                      <div className="w-5 h-5 rounded bg-[#0052CC] text-white flex items-center justify-center font-bold text-[9px]">
                        KAN
                      </div>
                      <div>
                        <p className="font-bold text-[#172B4D]">KAN</p>
                        <p className="text-[11px] text-[#6B778C]">Software project</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button className="px-2.5 py-1.5 rounded hover:bg-[#EBECF0] flex items-center gap-1 cursor-pointer">
              <span>Filters</span>
              <ChevronDown className="w-3 h-3 text-[#6B778C]" />
            </button>
            <button className="px-2.5 py-1.5 rounded hover:bg-[#EBECF0] flex items-center gap-1 cursor-pointer">
              <span>Dashboards</span>
              <ChevronDown className="w-3 h-3 text-[#6B778C]" />
            </button>
            <button className="px-2.5 py-1.5 rounded hover:bg-[#EBECF0] flex items-center gap-1 cursor-pointer">
              <span>Teams</span>
              <ChevronDown className="w-3 h-3 text-[#6B778C]" />
            </button>
            <button
              onClick={() => setIsCreatePlanOpen(true)}
              className="px-2.5 py-1.5 rounded hover:bg-[#EBECF0] flex items-center gap-1 cursor-pointer"
            >
              <span>Plans</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#6B778C]" />
            </button>
          </nav>

          {/* Jira Create Button (Iconic solid blue) */}
          <button
            onClick={() => setIsCreateIssueOpen(true)}
            className="px-3 py-1 bg-[#0052CC] hover:bg-[#0065FF] text-white text-xs font-semibold rounded-[3px] flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>
        </div>

        {/* Center: Global Search Bar (Opens SearchEngineModal) */}
        <div className="flex-1 max-w-sm mx-4 hidden md:block">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full pl-3 pr-2.5 py-1.5 text-xs bg-[#FAFBFC] hover:bg-white border border-[#DFE1E6] hover:border-[#4C9AFF] rounded-[3px] flex items-center justify-between text-[#6B778C] cursor-pointer transition-colors shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#6B778C] group-hover:text-[#0052CC]" />
              <span>Search tasks (e.g. KAN-1)...</span>
            </div>
            <kbd className="text-[10px] font-mono text-[#6B778C] bg-[#EBECF0] px-1.5 py-0.5 rounded border border-[#DFE1E6]">
              /
            </kbd>
          </button>
        </div>

        {/* Center-Right: Branch & Role Badge (Clickable to switch) */}
        <button
          onClick={onOpenOnboarding}
          title="Click to switch your Role or Branch"
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F4F5F7] hover:bg-[#EBECF0] border border-[#DFE1E6] text-xs cursor-pointer transition-colors select-none"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-[#172B4D]">{user?.workTypeTitle || 'Software Development'}</span>
          <span className="text-[#6B778C]">·</span>
          <span className="font-bold text-[#0052CC]">{user?.role || 'Developer'}</span>
          <span className="text-[10px] text-[#6B778C] ml-1 bg-white px-1.5 py-0.5 rounded border border-[#DFE1E6]">Change</span>
        </button>

        {/* Right Action Tools: Notifications, Settings, Profile */}
        <div className="flex items-center gap-2">
          {/* Real-time In-App Notification Center (Week 4 Day 1-2) */}
          <NotificationCenter
            user={user}
            onOpenTask={handleOpenTaskFromNotification}
            showNotificationToast={showNotification}
          />

          {/* Help */}
          <button className="p-1.5 rounded-full hover:bg-[#EBECF0] text-[#42526E] hidden sm:block cursor-pointer">
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-1.5 rounded-full hover:bg-[#EBECF0] text-[#42526E] cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Avatar — click to open full Profile Modal */}
          <div className="relative">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              title="View Profile"
              className="w-8 h-8 rounded-full text-white font-bold text-[11px] flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md hover:scale-105 transition-all select-none"
              style={{ backgroundColor: user?.avatarColor || '#FF8B00' }}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                userInitials
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. JIRA SIMULATION LINK BANNER (samarth13p2417.atlassian.net) */}
      {/* ===================================================================== */}
      <div className="bg-[#091E42] text-white px-4 py-1.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[#4C9AFF] bg-white/10 px-2 py-0.5 rounded text-[11px] font-semibold">
            samarth13p2417.atlassian.net
          </span>
          <span className="text-[#8993A4] hidden sm:inline">/</span>
          <span className="text-white/90 font-medium">
            jira/software/projects/KAN/boards/2?filter=assignee = empty&groupBy=none
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyJiraLink}
            className="flex items-center gap-1 text-[11px] bg-white/15 hover:bg-white/25 text-white px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer"
          >
            <Copy className="w-3 h-3" />
            <span>Copy Jira URL</span>
          </button>
          <a
            href="https://samarth13p2417.atlassian.net/jira/software/projects/KAN/boards/2?filter=assignee%20%3D%20empty&groupBy=none"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[11px] text-[#4C9AFF] hover:underline font-semibold"
          >
            <span>Open Atlassian</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. MAIN BODY: JIRA PROJECT SIDEBAR + VIEW CONTENT */}
      {/* ===================================================================== */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT JIRA GLOBAL SIDEBAR (Exactly Matching Jira Navigation) */}
        <aside className="w-64 border-r border-[#DFE1E6] bg-[#FAFBFC] flex flex-col justify-between py-3 overflow-y-auto shrink-0 select-none text-[13px] text-[#42526E]">
          <div className="space-y-1 px-2">
            
            {/* 1. For you */}
            <button
              onClick={() => {
                setActiveSidebarNav('for_you');
                setActiveTab('ForYou');
                showNotification('Showing tasks in For you');
              }}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded text-left transition-colors cursor-pointer ${
                activeTab === 'ForYou' ? 'bg-[#EBECF0] text-[#172B4D] font-bold shadow-2xs' : 'hover:bg-[#EBECF0] text-[#42526E]'
              }`}
            >
              <User className="w-4 h-4 text-[#42526E]" />
              <span className="font-medium text-[13px]">For you</span>
            </button>

            {/* 2. Recent */}
            <button
              onClick={() => {
                setIsRecentExpanded(!isRecentExpanded);
                setActiveSidebarNav('Recent');
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-left transition-colors cursor-pointer ${
                activeSidebarNav === 'Recent' ? 'bg-[#EBECF0] text-[#172B4D] font-semibold' : 'hover:bg-[#EBECF0] text-[#42526E]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#42526E]" />
                <span className="font-medium text-[13px]">Recent</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-[#6B778C] transition-transform ${isRecentExpanded ? 'rotate-90' : ''}`} />
            </button>
            {isRecentExpanded && (
              <div className="pl-9 pr-2 py-1 space-y-1 text-xs text-[#5E6C84]">
                <div onClick={() => setActiveTab('Board')} className="hover:text-[#0052CC] cursor-pointer py-1 truncate">
                  • KAN Active Board
                </div>
                <div onClick={() => setActiveTab('Backlog')} className="hover:text-[#0052CC] cursor-pointer py-1 truncate">
                  • Sprint 1 Backlog
                </div>
              </div>
            )}

            {/* 3. Starred (Highlighted active in screenshot) */}
            <button
              onClick={() => {
                setIsStarredExpanded(!isStarredExpanded);
                setActiveSidebarNav('Starred');
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-left transition-colors cursor-pointer ${
                activeSidebarNav === 'Starred' ? 'bg-[#EBECF0] text-[#172B4D] font-semibold' : 'hover:bg-[#EBECF0] text-[#42526E]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-[#42526E]" />
                <span className="font-medium text-[13px]">Starred</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-[#6B778C] transition-transform ${isStarredExpanded ? 'rotate-90' : ''}`} />
            </button>
            {isStarredExpanded && (
              <div className="pl-9 pr-2 py-1 space-y-1 text-xs text-[#5E6C84]">
                <div onClick={() => { setActiveSpace('billing'); showNotification('Switched space to (Example) Billing System Dev'); }} className="hover:text-[#0052CC] cursor-pointer py-1 truncate">
                  • (Example) Billing System Dev
                </div>
                <div onClick={() => { setActiveSpace('my_software_team'); showNotification('Switched space to My Software Team'); }} className="hover:text-[#0052CC] cursor-pointer py-1 truncate">
                  • My Software Team
                </div>
              </div>
            )}

            {/* 4. Apps */}
            <button
              onClick={() => {
                setActiveSidebarNav('Apps');
                setActiveTab('Apps');
                showNotification('Opening Explore apps for Jira');
              }}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded text-left transition-colors cursor-pointer ${
                activeTab === 'Apps' ? 'bg-[#EBECF0] text-[#172B4D] font-bold shadow-2xs' : 'hover:bg-[#EBECF0] text-[#42526E]'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-[#42526E]" />
              <span className="font-medium text-[13px]">Apps</span>
            </button>

            {/* 5. Plans */}
            <button
              onClick={() => {
                setActiveSidebarNav('Plans');
                setIsCreatePlanOpen(true);
                showNotification('Opening Create your plan');
              }}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded text-left transition-colors cursor-pointer ${
                isCreatePlanOpen ? 'bg-[#EBECF0] text-[#172B4D] font-bold shadow-2xs' : 'hover:bg-[#EBECF0] text-[#42526E]'
              }`}
            >
              <svg className="w-4 h-4 text-[#42526E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="6" width="7" height="4" rx="2" />
                <rect x="14" y="14" width="7" height="4" rx="2" />
                <path d="M10 8h4a2 2 0 0 1 2 2v4" />
              </svg>
              <span className="font-medium text-[13px]">Plans</span>
            </button>

            {/* 6. Spaces Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between px-3 py-1 text-[#42526E]">
                <div className="flex items-center gap-3">
                  {/* Planet / Saturn icon */}
                  <svg className="w-4 h-4 text-[#42526E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5.5" />
                    <path d="M3 13.5c1.8 3.5 8 5.5 13.5 3.5s7.5-6.5 5.5-9" />
                    <path d="M2.5 10.5c1.2-2.5 5-4.5 9.5-4" strokeDasharray="2 3" />
                  </svg>
                  <span className="font-semibold text-[13px]">Spaces</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsCreateWorkspaceOpen(true)}
                    title="Create Space"
                    className="p-1 hover:bg-[#DFE1E6] rounded text-[#42526E] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => showNotification('Spaces options: Manage or customize spaces')}
                    title="More options"
                    className="p-1 hover:bg-[#DFE1E6] rounded text-[#42526E] cursor-pointer"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Subsection: Starred */}
              <div className="px-3 pt-2 pb-1">
                <span className="text-[11px] font-bold text-[#6B778C]">Starred</span>
              </div>
              <button
                onClick={() => {
                  setActiveSpace('billing');
                  showNotification('Switched space to (Example) Billing System Dev');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-left transition-colors cursor-pointer ${
                  activeSpace === 'billing'
                    ? 'bg-[#E9F2FF] text-[#0052CC] font-bold border-l-3 border-[#0052CC]'
                    : 'hover:bg-[#EBECF0] text-[#172B4D]'
                }`}
              >
                <div className="w-5 h-5 rounded-[4px] bg-[#5243AA] text-white flex items-center justify-center shrink-0">
                  <RefreshCw className="w-3 h-3 text-white" />
                </div>
                <span className="truncate text-[13px]">(Example) Billing System Dev</span>
              </button>

              {/* Subsection: Recent */}
              <div className="px-3 pt-2.5 pb-1">
                <span className="text-[11px] font-bold text-[#6B778C]">Recent</span>
              </div>

              {/* Active Space: My Software Team */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setActiveSpace('my_software_team');
                    setActiveTab('Board');
                    showNotification('Switched space to My Software Team');
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-left transition-colors cursor-pointer ${
                    activeSpace === 'my_software_team'
                      ? 'bg-[#E9F2FF] text-[#0052CC] font-bold border-l-3 border-[#0052CC]'
                      : 'hover:bg-[#EBECF0] text-[#172B4D]'
                  }`}
                >
                  {/* Multi-colored lifebuoy icon matching screenshot */}
                  <div className="w-5 h-5 rounded bg-white border border-[#DFE1E6] flex items-center justify-center shrink-0 shadow-2xs">
                    <svg viewBox="0 0 24 24" className="w-4 h-4">
                      <circle cx="12" cy="12" r="10" stroke="#0052CC" strokeWidth="4" />
                      <circle cx="12" cy="12" r="5" stroke="#0052CC" strokeWidth="2.5" fill="white" />
                      <path d="M12 2v5M12 17v5M2 12h5M17 12h5" stroke="#FF5630" strokeWidth="3" strokeLinecap="round" />
                      <path d="M4.93 4.93l3.54 3.54M15.54 15.54l3.53 3.53M4.93 19.07l3.54-3.54M15.54 8.46l3.53-3.53" stroke="#FFAB00" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="truncate text-[13px] font-bold">My Software Team</span>
                </button>

                {/* Sub-navigation views when My Software Team is active */}
                {activeSpace === 'my_software_team' && (
                  <div className="pl-6 pr-1 space-y-0.5 pt-0.5 border-l-2 border-blue-200 ml-4">
                    <button
                      onClick={() => setActiveTab('Board')}
                      className={`w-full flex items-center justify-between px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                        activeTab === 'Board'
                          ? 'bg-blue-100/70 text-[#0052CC] font-bold'
                          : 'hover:bg-[#EBECF0] text-[#42526E]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Columns className="w-3.5 h-3.5 text-[#0052CC]" />
                        <span>Board</span>
                      </div>
                      <span className="text-[9px] px-1 py-0.2 bg-[#0052CC] text-white rounded font-bold">
                        KAN
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('Timeline')}
                      className={`w-full flex items-center gap-2 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                        activeTab === 'Timeline'
                          ? 'bg-blue-100/70 text-[#0052CC] font-bold'
                          : 'hover:bg-[#EBECF0] text-[#42526E]'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#6B778C]" />
                      <span>Timeline</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('Backlog')}
                      className={`w-full flex items-center gap-2 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                        activeTab === 'Backlog'
                          ? 'bg-blue-100/70 text-[#0052CC] font-bold'
                          : 'hover:bg-[#EBECF0] text-[#42526E]'
                      }`}
                    >
                      <ListIcon className="w-3.5 h-3.5 text-[#6B778C]" />
                      <span>Backlog</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('Development')}
                      className={`w-full flex items-center gap-2 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                        activeTab === 'Development'
                          ? 'bg-blue-100/70 text-[#0052CC] font-bold'
                          : 'hover:bg-[#EBECF0] text-[#42526E]'
                      }`}
                    >
                      <Code className="w-3.5 h-3.5 text-[#6B778C]" />
                      <span>Code</span>
                    </button>
                  </div>
                )}
              </div>

              {/* More spaces > */}
              <button
                onClick={() => setIsCreateWorkspaceOpen(true)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#EBECF0] text-[#42526E] transition-colors cursor-pointer mt-1"
              >
                <div className="flex items-center gap-2.5">
                  <Menu className="w-4 h-4 text-[#42526E]" />
                  <span className="font-medium text-[13px]">More spaces</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#6B778C]" />
              </button>

              {/* Subsection: Recommended */}
              <div className="px-3 pt-2.5 pb-1">
                <span className="text-[11px] font-bold text-[#6B778C]">Recommended</span>
              </div>
              <button
                onClick={() => showNotification('Template: Collect IT requests preview opened')}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#EBECF0] text-[#172B4D] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-[4px] bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <span className="truncate text-[13px]">Collect IT requests</span>
                </div>
                <span className="text-[10px] font-bold text-[#6554C0] bg-[#EAE6FF] px-1.5 py-0.2 rounded border border-[#C0B6F2]">
                  Try
                </span>
              </button>
            </div>

            {/* 7. Filters */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded text-left hover:bg-[#EBECF0] text-[#42526E] transition-colors cursor-pointer"
            >
              <Filter className="w-4 h-4 text-[#42526E]" />
              <span className="font-medium text-[13px]">Filters</span>
            </button>

            {/* 8. Dashboards */}
            <button
              onClick={() => showNotification('System Dashboards: Live issue metrics and status')}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded text-left hover:bg-[#EBECF0] text-[#42526E] transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-[#42526E]" />
              <span className="font-medium text-[13px]">Dashboards</span>
            </button>

            {/* Separator */}
            <div className="border-t border-[#DFE1E6]/70 my-2" />

            {/* 9. Assets ↗ */}
            <button
              onClick={() => showNotification('Atlassian Assets: Hardware, Software & Inventory tracking')}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#EBECF0] text-[#42526E] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-[#42526E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="2" width="6" height="6" rx="1" />
                  <rect x="16" y="2" width="6" height="6" rx="1" />
                  <rect x="2" y="16" width="6" height="6" rx="1" />
                  <rect x="16" y="16" width="6" height="6" rx="1" />
                  <path d="M8 5h8M8 19h8M5 8v8M19 8v8" />
                </svg>
                <span className="font-medium text-[13px]">Assets</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#6B778C]" />
            </button>

            {/* 10. Teams ↗ */}
            <button
              onClick={() => setIsMemberModalOpen(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded text-left hover:bg-[#EBECF0] text-[#42526E] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <UsersIcon className="w-4 h-4 text-[#42526E]" />
                <span className="font-medium text-[13px]">Teams</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#6B778C]" />
            </button>

          </div>

          {/* Bottom Upgrade / Tier Badge */}
          <div className="px-3 pt-3 border-t border-[#DFE1E6]">
            <div className="p-2.5 bg-white border border-[#DFE1E6] rounded flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6554C0]" />
                <div>
                  <p className="font-bold text-xs text-[#172B4D]">Standard Tier</p>
                  <p className="text-[10px] text-[#6B778C]">Full agile features</p>
                </div>
              </div>
              <button
                onClick={() => setIsPlansModalOpen(true)}
                className="text-[10px] text-[#6554C0] font-bold hover:underline cursor-pointer"
              >
                Plans
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN VIEW CONTENT AREA */}
        <main className="flex-1 bg-white overflow-y-auto p-6 flex flex-col space-y-5 relative">
          
          {/* Active View Switching */}
          {activeTab === 'ForYou' && (
            <ForYouView
              user={user}
              onSelectCard={(card) => setSelectedTask(card)}
              onSelectSpace={(spaceId) => {
                setActiveSpace(spaceId);
                setActiveTab('Board');
              }}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'Apps' && (
            <ExploreAppsView showNotification={showNotification} />
          )}

          {activeTab === 'Board' && (
            <KanbanBoardEngine
              key={`${boardRefreshKey}_${activeSpace}`}
              workspace={{
                name: activeSpace === 'billing' ? '(Example) Billing System Dev' : teamName,
                key: activeSpace === 'billing' ? 'BILL' : 'SW',
              }}
              user={user}
              onSelectCard={(card) => setSelectedTask(card)}
              showNotification={showNotification}
              onRequestCreateIssue={() => setIsCreateIssueOpen(true)}
            />
          )}

          {activeTab === 'Timeline' && (
            <TimelineView
              onSelectCard={(card) => setSelectedTask(card)}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'Backlog' && (
            <BacklogView
              onSelectCard={(card) => setSelectedTask(card)}
              showNotification={showNotification}
              onRequestCreateIssue={() => setIsCreateIssueOpen(true)}
            />
          )}

          {activeTab === 'Development' && (
            <DevelopmentView
              teamName="Samarth Workspace"
              user={user}
              showNotification={showNotification}
            />
          )}
        </main>
      </div>

      {/* ===================================================================== */}
      {/* 4. MODALS & POPUPS */}
      {/* ===================================================================== */}

      {/* Jira Create Issue Modal */}
      <CreateIssueModal
        isOpen={isCreateIssueOpen}
        onClose={() => setIsCreateIssueOpen(false)}
        onCreateIssue={handleCreateIssue}
        projectKey="SW"
        projectName="Samarth Workspace (Software project)"
      />

      {/* Task Details Modal (KAN-1 / KAN-2 / etc.) */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          task={selectedTask}
          currentUser={{
            name: user?.name || 'Samarth Choudhary',
            initials: userInitials,
          }}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={async (taskId, updates) => {
            setSelectedTask((prev) => (prev ? { ...prev, ...updates } : null));
            try {
              await kanbanApi.updateCard(taskId, updates);
              setBoardRefreshKey((prev) => prev + 1);
            } catch (err) {
              console.error('Failed to persist task update:', err);
              if (showNotification) showNotification('Failed to save task update');
            }
          }}
          showNotification={showNotification}
        />
      )}

      {/* Create / Manage Plan Modal */}
      <CreatePlanModal
        isOpen={isCreatePlanOpen}
        onClose={() => setIsCreatePlanOpen(false)}
        onPlanCreated={(newPlan) => {
          showNotification(`Created plan "${newPlan.name}"`);
          setActiveTab('Timeline');
        }}
        showNotification={showNotification}
      />

      {/* See Plans Modal */}
      <SeePlansModal
        isOpen={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
        onSelectPlan={(plan) => setActivePlan(plan)}
      />

      {/* Workspace Member Management Modal */}
      <WorkspaceMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        spaceName="Samarth Workspace"
      />

      {/* Workspace Settings Modal */}
      <WorkspaceSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        workspace={{
          name: 'Samarth Workspace',
          key: 'SW',
          category: 'Software',
          description: 'Core engineering workspace for agile delivery and CI/CD development tracking.',
        }}
        onUpdateWorkspace={(updates) => {
          if (updates.name) setTeamName(updates.name);
          if (showNotification) showNotification('Workspace settings updated');
        }}
        showNotification={showNotification}
      />

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
        onCreateWorkspace={async (wsData) => {
          const created = await kanbanApi.createWorkspace(wsData);
          setTeamName(created.name);
        }}
        showNotification={showNotification}
      />

      {/* Comprehensive Task Search Engine Modal (Week 4 Day 1-2 & Redis Optimization) */}
      <SearchEngineModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTask={(task) => setSelectedTask(task)}
      />

      {/* User Profile Modal (Week 1 — User profile & team member list) */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdateUser={(updatedUser) => {
          setUser(updatedUser);
          try {
            const saved = JSON.parse(localStorage.getItem('jira_active_workspace_user') || '{}');
            localStorage.setItem('jira_active_workspace_user', JSON.stringify({ ...saved, ...updatedUser }));
          } catch {}
          if (updatedUser.workspaceName) setTeamName(updatedUser.workspaceName);
          showNotification('Profile updated successfully!');
        }}
        onLogout={onLogout}
      />
    </div>
  );
};

export default WorkspaceDashboard;
