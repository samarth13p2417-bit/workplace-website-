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
  MessageSquare
} from 'lucide-react';

import { SeePlansModal } from './SeePlansModal';
import { WorkspaceMemberModal } from './WorkspaceMemberModal';
import { AbcLogo } from './AbcLogo';
import { DevelopmentView } from './DevelopmentView';
import { TaskDetailModal } from './TaskDetailModal';
import { KanbanBoardEngine } from './KanbanBoardEngine';
import { WorkspaceSettingsModal } from './WorkspaceSettingsModal';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';
import kanbanApi from '../services/kanbanApi';

export const WorkspaceDashboard = ({ user, onLogout }) => {
  const [teamName, setTeamName] = useState(user?.workspaceName || 'My Software Team');
  const [isStarred, setIsStarred] = useState(false);
  const [showSpaceMenu, setShowSpaceMenu] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [activePlan, setActivePlan] = useState('Standard');
  const [statusNotification, setStatusNotification] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [boardRefreshKey, setBoardRefreshKey] = useState(0);

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'SC';

  const [activeTab, setActiveTab] = useState('Board');

  const showNotification = (msg) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(''), 2500);
  };

  const navTabs = [
    { name: 'Summary', icon: Globe },
    { name: 'List', icon: ListIcon },
    { name: 'Board', icon: Columns },
    { name: 'Development', icon: Code, prefix: '</>' },
    { name: 'Forms', icon: FileText },
    { name: 'Timeline', icon: Calendar },
    { name: 'Docs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-white text-[#172B4D] flex flex-col font-sans antialiased text-[14px] selection:bg-[#DEEBFF] selection:text-[#0747A6]">
      
      {/* Toast Notification */}
      {statusNotification && (
        <div className="fixed top-14 right-6 z-50 bg-[#172B4D] text-white px-4 py-2 rounded shadow-xl text-xs font-medium animate-fadeIn flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* 1. TOP HEADER BAR */}
      <header className="h-12 border-b border-[#DFE1E6] px-3.5 flex items-center justify-between sticky top-0 z-40 bg-white">
        {/* Left: App Switcher + Abc Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="p-1.5 rounded hover:bg-[#EBECF0] text-[#42526E] cursor-pointer">
            <div className="grid grid-cols-3 gap-0.5 w-4 h-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-[#42526E] rounded-full" />
              ))}
            </div>
          </button>

          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => onLogout()}>
            <AbcLogo size="sm" />
            <span className="font-extrabold text-[18px] tracking-tight text-[#172B4D]">Abc</span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B778C]" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-[#DFE1E6] rounded-[3px] focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#4C9AFF]/20 transition-colors"
            />
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setActiveTab('Board');
              showNotification('Switched to Board view. Click "+ Create issue" on any column to add a card.');
            }}
            className="px-3 py-1 bg-[#0052CC] hover:bg-[#0065FF] text-white text-xs font-semibold rounded-[3px] flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>

          {/* See plans */}
          <button
            onClick={() => setIsPlansModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#6554C0] bg-white border border-[#6554C0] rounded-[3px] hover:bg-[#F3F0FF] transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3 h-3 text-[#6554C0]" />
            <span>See plans</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="p-1.5 rounded-full hover:bg-[#EBECF0] text-[#42526E]">
              <Bell className="w-4 h-4" />
            </button>
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#DE350B] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              1
            </span>
          </div>

          {/* Help */}
          <div className="relative hidden sm:block">
            <button className="p-1.5 rounded-full hover:bg-[#EBECF0] text-[#42526E]">
              <HelpCircle className="w-4 h-4" />
            </button>
            <span className="absolute top-0 right-0 px-1 py-0.2 bg-[#0052CC] text-white text-[8px] font-bold rounded-full">
              3+
            </span>
          </div>

          {/* Settings */}
          <button className="p-1.5 rounded-full hover:bg-[#EBECF0] text-[#42526E]">
            <Settings className="w-4 h-4" />
          </button>

          {/* User Avatar with dropdown */}
          <div className="relative group">
            <div className="w-7 h-7 rounded-full bg-[#FF8B00] text-white font-bold text-[11px] flex items-center justify-center cursor-pointer shadow-xs">
              {userInitials}
            </div>

            <div className="absolute right-0 top-8 w-48 bg-white border border-[#DFE1E6] rounded shadow-lg p-2 hidden group-hover:block z-50">
              <p className="font-bold text-xs text-[#172B4D] truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-[#6B778C] truncate mb-2">{user?.email}</p>
              <button
                onClick={() => setIsMemberModalOpen(true)}
                className="w-full text-left px-2 py-1.5 text-xs text-[#172B4D] hover:bg-gray-100 rounded flex items-center gap-1.5 mb-1"
              >
                <UsersIcon className="w-3.5 h-3.5 text-[#0052CC]" />
                <span>Workspace Members</span>
              </button>
              <button
                onClick={onLogout}
                className="w-full text-left px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. BODY: LEFT SIDEBAR + MAIN KANBAN BOARD */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside className="w-60 border-r border-[#DFE1E6] bg-[#FAFBFC] flex flex-col justify-between py-3 overflow-y-auto shrink-0 select-none text-[13px] text-[#42526E]">
          <div className="space-y-4">
            {/* Top Nav */}
            <div className="space-y-0.5 px-2">
              <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded hover:bg-[#EBECF0] cursor-pointer text-[#172B4D]">
                <User className="w-4 h-4 text-[#6B778C]" />
                <span>For you</span>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-[#EBECF0] cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#6B778C]" />
                  <span>Recent</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#6B778C]" />
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-[#EBECF0] cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-[#6B778C]" />
                  <span>Starred</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#6B778C]" />
              </div>
              <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded hover:bg-[#EBECF0] cursor-pointer">
                <Grid className="w-4 h-4 text-[#6B778C]" />
                <span>Apps</span>
              </div>
              <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded hover:bg-[#EBECF0] cursor-pointer">
                <Calendar className="w-4 h-4 text-[#6B778C]" />
                <span>Plans</span>
              </div>
            </div>

            {/* Spaces Header */}
            <div className="px-2">
              <div className="flex items-center justify-between px-2.5 py-1 text-xs font-semibold text-[#6B778C]">
                <div className="flex items-center gap-2 text-[#172B4D]">
                  <Compass className="w-4 h-4 text-[#6B778C]" />
                  <span>Spaces</span>
                </div>
                <div className="flex items-center gap-1">
                  <Plus 
                    onClick={() => setIsCreateWorkspaceOpen(true)}
                    className="w-3.5 h-3.5 text-[#6B778C] hover:text-[#172B4D] cursor-pointer" 
                  />
                  <MoreHorizontal className="w-3.5 h-3.5 text-[#6B778C] hover:text-[#172B4D] cursor-pointer" />
                </div>
              </div>

              {/* Starred Space */}
              <div className="mt-2 space-y-0.5">
                <p className="text-[11px] font-semibold text-[#6B778C] px-2.5 uppercase tracking-wider">Starred</p>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#EBECF0] cursor-pointer text-xs">
                  <div className="w-4 h-4 rounded bg-[#5243AA] text-white flex items-center justify-center text-[10px] font-bold">
                    B
                  </div>
                  <span className="truncate">(Example) Billing System Dev</span>
                </div>
              </div>

              {/* Recent Spaces */}
              <div className="mt-3 space-y-0.5">
                <p className="text-[11px] font-semibold text-[#6B778C] px-2.5 uppercase tracking-wider">Recent</p>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-[#E9F2FF] text-[#0052CC] font-semibold text-xs border-l-[3px] border-[#0052CC] cursor-pointer">
                  <div className="w-4 h-4 rounded bg-gradient-to-tr from-[#00C7E6] via-[#FF5630] to-[#FFAB00] flex items-center justify-center text-[9px] text-white font-black">
                    ✕
                  </div>
                  <span className="truncate">{teamName}</span>
                </div>

                <div className="flex items-center justify-between px-2.5 py-1 rounded hover:bg-[#EBECF0] text-xs text-[#5E6C84] cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ListIcon className="w-3.5 h-3.5" />
                    <span>More spaces</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Recommended: Roadmap */}
              <div className="mt-4 space-y-0.5">
                <p className="text-[11px] font-semibold text-[#6B778C] px-2.5 uppercase tracking-wider">Recommended</p>
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-[#EBECF0] cursor-pointer text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-[8px] text-white font-bold">
                      2
                    </div>
                    <span className="truncate">Create a roadmap</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 bg-[#F3F0FF] text-[#6554C0] font-bold rounded">
                    Try
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Links */}
            <div className="px-2 pt-2 border-t border-[#DFE1E6]/70 space-y-0.5 text-xs text-[#42526E]">
              <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded hover:bg-[#EBECF0] cursor-pointer">
                <Filter className="w-4 h-4 text-[#6B778C]" />
                <span>Filters</span>
              </div>
              <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded hover:bg-[#EBECF0] cursor-pointer">
                <LayoutDashboard className="w-4 h-4 text-[#6B778C]" />
                <span>Dashboards</span>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-[#EBECF0] cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-[#6B778C]" />
                  <span>Assets</span>
                </div>
                <ExternalLink className="w-3 h-3 text-[#6B778C]" />
              </div>
              <div 
                onClick={() => setIsMemberModalOpen(true)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded hover:bg-[#EBECF0] cursor-pointer text-[#0052CC] font-semibold"
              >
                <UsersIcon className="w-4 h-4 text-[#0052CC]" />
                <span>Teams & Members</span>
              </div>
              <div 
                onClick={() => setIsSettingsModalOpen(true)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded hover:bg-[#EBECF0] cursor-pointer text-[#42526E] font-medium"
              >
                <Settings className="w-4 h-4 text-[#6B778C]" />
                <span>Space settings</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN BOARD CONTENT AREA */}
        <main className="flex-1 bg-white overflow-y-auto p-6 flex flex-col space-y-5 relative">
          
          {/* Breadcrumb + Project Title Row */}
          <div>
            <span className="text-xs text-[#6B778C] font-medium block mb-1">Spaces</span>
            <div className="flex items-center justify-between">
              
              {/* Left Project Icon + Title + Team Badge + Three Dots Dropdown */}
              <div className="relative flex items-center gap-2.5">
                {/* Jira / Atlassian Project Badge Icon */}
                <div className="w-6 h-6 rounded-[5px] bg-[#FAFBFC] border border-[#DFE1E6] flex items-center justify-center p-0.5 shadow-xs overflow-hidden">
                  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5">
                    <path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 9 9.5 11 12 11C14.5 11 16.5 9 16.5 6.5C16.5 4 14.5 2 12 2Z" fill="#00C7E6"/>
                    <path d="M17.5 7.5C15 7.5 13 9.5 13 12C13 14.5 15 16.5 17.5 16.5C20 16.5 22 14.5 22 12C22 9.5 20 7.5 17.5 7.5Z" fill="#FF5630"/>
                    <path d="M12 13C9.5 13 7.5 15 7.5 17.5C7.5 20 9.5 22 12 22C14.5 22 16.5 20 16.5 17.5C16.5 15 14.5 13 12 13Z" fill="#FFAB00"/>
                    <path d="M6.5 7.5C4 7.5 2 9.5 2 12C2 14.5 4 16.5 6.5 16.5C9 16.5 11 14.5 11 12C11 9.5 9 7.5 6.5 7.5Z" fill="#0052CC"/>
                  </svg>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
                  {teamName}
                </h1>

                {/* Team Members Icon */}
                <button
                  onClick={() => setIsMemberModalOpen(true)}
                  title="Manage Workspace Members"
                  className="p-1.5 rounded hover:bg-[#EBECF0] text-[#42526E] hover:text-[#0052CC] transition-colors cursor-pointer border border-[#DFE1E6] flex items-center gap-1 shadow-xs"
                >
                  <UsersIcon className="w-3.5 h-3.5" />
                </button>

                {/* Three Dots Button (...) -> Opens Space Menu Dropdown (Matching Screenshot) */}
                <button
                  onClick={() => setShowSpaceMenu(!showSpaceMenu)}
                  className={`p-1.5 rounded border transition-colors cursor-pointer ${
                    showSpaceMenu
                      ? 'bg-[#0052CC] text-white border-[#0052CC]'
                      : 'border-[#DFE1E6] hover:bg-[#EBECF0] text-[#6B778C]'
                  }`}
                  aria-label="Space options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {/* ========================================================================= */}
                {/* SPACE OPTIONS DROPDOWN MENU (MATCHING THE SHARED SCREENSHOT PIXEL-PERFECT) */}
                {/* ========================================================================= */}
                {showSpaceMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowSpaceMenu(false)}
                    />
                    <div className="absolute top-9 left-28 w-64 bg-white rounded-lg shadow-2xl border border-[#DFE1E6] py-1.5 z-50 text-[13px] text-[#172B4D] animate-fadeIn select-none">
                      
                      {/* 1. Add to starred */}
                      <button
                        onClick={() => {
                          setIsStarred(!isStarred);
                          setShowSpaceMenu(false);
                          showNotification(isStarred ? 'Removed from starred' : 'Added to starred spaces');
                        }}
                        className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#FAFBFC] transition-colors text-left"
                      >
                        <Star className={`w-4 h-4 ${isStarred ? 'text-amber-500 fill-amber-500' : 'text-[#6B778C]'}`} />
                        <span>{isStarred ? 'Remove from starred' : 'Add to starred'}</span>
                      </button>

                      {/* 2. Add people (MEMBER MANAGEMENT) */}
                      <button
                        onClick={() => {
                          setShowSpaceMenu(false);
                          setIsMemberModalOpen(true);
                        }}
                        className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#FAFBFC] transition-colors text-left font-semibold text-[#0052CC]"
                      >
                        <UserPlus className="w-4 h-4 text-[#0052CC]" />
                        <span>Add people</span>
                      </button>

                      {/* 3. Save as template */}
                      <button
                        onClick={() => {
                          setShowSpaceMenu(false);
                          showNotification('Template feature available in Enterprise tier');
                        }}
                        className="w-full px-3.5 py-2 flex items-center justify-between hover:bg-[#FAFBFC] transition-colors text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <Bookmark className="w-4 h-4 text-[#6B778C]" />
                          <span>Save as template</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.2 bg-[#F3F0FF] text-[#6554C0] font-bold rounded">
                          Enterprise
                        </span>
                      </button>

                      {/* 4. Create a plan with this space */}
                      <button
                        onClick={() => {
                          setShowSpaceMenu(false);
                          setIsPlansModalOpen(true);
                        }}
                        className="w-full px-3.5 py-2 flex items-center justify-between hover:bg-[#FAFBFC] transition-colors text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-[#6B778C]" />
                          <span>Create a plan with this space</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.2 bg-[#F3F0FF] text-[#6554C0] font-bold rounded">
                          Try
                        </span>
                      </button>

                      {/* 5. Set space background */}
                      <button
                        onClick={() => {
                          setShowSpaceMenu(false);
                          showNotification('Space background palette opened');
                        }}
                        className="w-full px-3.5 py-2 flex items-center justify-between hover:bg-[#FAFBFC] transition-colors text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <Palette className="w-4 h-4 text-[#6B778C]" />
                          <span>Set space background</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-[#6B778C]" />
                      </button>

                      {/* 6. Space settings */}
                      <button
                        onClick={() => {
                          setShowSpaceMenu(false);
                          setIsSettingsModalOpen(true);
                        }}
                        className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#FAFBFC] transition-colors text-left cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-[#6B778C]" />
                        <span>Space settings</span>
                      </button>

                      <div className="my-1 border-t border-[#DFE1E6]" />

                      {/* 7. Archive space */}
                      <button
                        onClick={() => {
                          setShowSpaceMenu(false);
                          showNotification('Space archived');
                        }}
                        className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#FAFBFC] transition-colors text-left"
                      >
                        <Archive className="w-4 h-4 text-[#6B778C]" />
                        <span>Archive space</span>
                      </button>

                      {/* 8. Delete space (Red text) */}
                      <button
                        onClick={() => {
                          setShowSpaceMenu(false);
                          showNotification('Space deletion requires admin confirmation');
                        }}
                        className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-red-50 text-[#DE350B] transition-colors text-left font-medium"
                      >
                        <Trash2 className="w-4 h-4 text-[#DE350B]" />
                        <span>Delete space</span>
                      </button>

                      <div className="my-1 border-t border-[#DFE1E6]" />

                      {/* 9. Bottom Space Type Info */}
                      <div className="px-3.5 py-2 bg-[#FAFBFC] flex items-center gap-2.5 rounded-b-lg">
                        <AbcLogo size="sm" />
                        <div className="text-left text-xs leading-tight">
                          <p className="font-bold text-[#172B4D]">Software space</p>
                          <p className="text-[11px] text-[#6B778C]">Team-managed</p>
                        </div>
                      </div>

                    </div>
                  </>
                )}
              </div>

              {/* Right Action Icons (Share, Automation, Feedback, Expand) */}
              <div className="flex items-center gap-1.5 text-[#6B778C]">
                <button 
                  onClick={() => setIsMemberModalOpen(true)}
                  title="Share / Invite to Space"
                  className="p-1.5 rounded hover:bg-[#EBECF0] hover:text-[#172B4D] cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => showNotification('Automations rules panel')}
                  title="Automation"
                  className="p-1.5 rounded hover:bg-[#EBECF0] hover:text-[#172B4D] cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => showNotification('Feedback and chat')}
                  title="Feedback"
                  className="p-1.5 rounded hover:bg-[#EBECF0] hover:text-[#172B4D] cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => showNotification('Full screen toggle')}
                  title="Maximize"
                  className="p-1.5 rounded hover:bg-[#EBECF0] hover:text-[#172B4D] cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Project Views Tabs Navigation */}
          <div className="flex items-center gap-6 border-b border-[#DFE1E6] overflow-x-auto text-[13px] font-medium text-[#42526E]">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.name;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border-[#0052CC] text-[#0052CC] font-semibold'
                      : 'border-transparent hover:text-[#172B4D] hover:border-[#DFE1E6]'
                  }`}
                >
                  {tab.prefix ? (
                    <span className={`font-mono text-xs font-bold ${isActive ? 'text-[#0052CC]' : 'text-[#6B778C]'}`}>
                      {tab.prefix}
                    </span>
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  <span>{tab.name}</span>
                </button>
              );
            })}
            <button 
              onClick={() => showNotification('Custom view creation')}
              className="pb-2.5 text-[#6B778C] hover:text-[#172B4D] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* MAIN TAB CONTENT */}
          {activeTab === 'Development' ? (
            <DevelopmentView
              teamName={teamName}
              user={user}
              showNotification={showNotification}
            />
          ) : activeTab === 'Board' ? (
            <KanbanBoardEngine
              key={boardRefreshKey}
              workspace={{ name: teamName, key: 'KAN' }}
              user={user}
              onSelectCard={(card) => setSelectedTask(card)}
              showNotification={showNotification}
            />
          ) : (
            <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-xl p-8 text-center space-y-3">
              <h3 className="text-base font-bold text-[#172B4D]">{activeTab} View</h3>
              <p className="text-xs text-[#6B778C]">
                Explore features or switch to the Development tab to view live CI/CD and metrics.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setActiveTab('Development')}
                  className="px-3.5 py-1.5 bg-[#0052CC] text-white text-xs font-semibold rounded-[3px] hover:bg-[#0065FF] cursor-pointer shadow-xs"
                >
                  Open Development View
                </button>
                <button
                  onClick={() => setActiveTab('Board')}
                  className="px-3.5 py-1.5 bg-white border border-[#DFE1E6] text-[#42526E] text-xs font-semibold rounded-[3px] hover:bg-gray-50 cursor-pointer"
                >
                  Open Kanban Board
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

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
        spaceName={teamName}
      />

      {/* Workspace Settings Modal (Week 1: Day 6-7) */}
      <WorkspaceSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        workspace={{
          name: teamName,
          key: 'KAN',
          category: 'Software',
          description: 'Core engineering workspace for agile delivery and CI/CD development tracking.',
        }}
        onUpdateWorkspace={(updates) => {
          if (updates.name) setTeamName(updates.name);
          if (showNotification) showNotification('Workspace settings updated');
        }}
        showNotification={showNotification}
      />

      {/* Task Details Modal (Task 1 / KAN-1) */}
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

      {/* Create Workspace Modal (Week 1: Day 3-5) */}
      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
        onCreateWorkspace={async (wsData) => {
          const created = await kanbanApi.createWorkspace(wsData);
          setTeamName(created.name);
        }}
        showNotification={showNotification}
      />
    </div>
  );
};

export default WorkspaceDashboard;
