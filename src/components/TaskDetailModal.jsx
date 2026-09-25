import React, { useState, useEffect, useRef } from 'react';
import {
  CheckSquare,
  Plus,
  MoreHorizontal,
  Eye,
  Lock,
  Share2,
  Maximize2,
  Minimize2,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Settings,
  User,
  Paperclip,
  Calendar,
  Clock,
  Flag,
  MessageSquare,
  Check,
  AlignLeft,
  Bookmark,
  Layers,
  Send,
  Upload,
  Trash2,
  Link as LinkIcon
} from 'lucide-react';
import kanbanApi from '../services/kanbanApi';
import {
  getSocket,
  joinCard,
  leaveCard,
  emitCardTyping,
  emitCardStopTyping,
  emitCardComment,
} from '../services/socket';

export const TaskDetailModal = ({
  isOpen,
  onClose,
  task = {
    id: 'KAN-1',
    title: 'Task 1',
    status: 'To Do',
    dueDate: 'Oct 7, 2026',
    assignedTo: null,
  },
  currentUser = { name: 'Samarth Choudhary', initials: 'SC' },
  onUpdateTask,
  showNotification,
}) => {
  if (!isOpen) return null;

  // Task local state
  const [taskTitle, setTaskTitle] = useState(task?.title || 'Task 1');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [description, setDescription] = useState(task?.description || '');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [status, setStatus] = useState(task?.status || 'To Do');
  const [assignee, setAssignee] = useState(task?.assignedTo || null);
  const [priority, setPriority] = useState(task?.priority || 'None');
  const [dueDate, setDueDate] = useState(task?.dueDate || 'Oct 7, 2026');
  const [parentEpic, setParentEpic] = useState(task?.parent || '');
  const [isAddingParent, setIsAddingParent] = useState(false);
  const [labels, setLabels] = useState(task?.labels || []);
  const [newLabelInput, setNewLabelInput] = useState('');
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [team, setTeam] = useState(task?.team || '');
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [startDate, setStartDate] = useState(task?.startDate || '');
  const [isAddingStartDate, setIsAddingStartDate] = useState(false);

  // UI state
  const [isWatching, setIsWatching] = useState(true);
  const [watchersCount, setWatchersCount] = useState(1);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);
  const [isAttachmentsExpanded, setIsAttachmentsExpanded] = useState(true);
  const [activityTab, setActivityTab] = useState('All');
  const [comments, setComments] = useState(task?.comments || []);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [activeTypers, setActiveTypers] = useState([]);
  const typingTimerRef = useRef(null);

  // Subscribe to real-time WebSockets for this card (Week 3 Day 1-7)
  useEffect(() => {
    if (!task?.id) return;

    // Join card room
    joinCard(task.id);
    const socket = getSocket();

    // Sync comments from task props if updated
    if (task.comments && task.comments.length > 0) {
      setComments(task.comments);
    }

    const handleCommentAdded = (data) => {
      if (data.cardId === task.id && data.comment) {
        setComments((prev) => {
          if (prev.some((c) => String(c.id) === String(data.comment.id))) return prev;
          return [...prev, data.comment];
        });
      }
    };

    const handleTyping = (data) => {
      if (data.cardId === task.id && data.user) {
        setActiveTypers((prev) => {
          if (prev.some((u) => u.id === data.user.id || u.name === data.user.name)) return prev;
          return [...prev, data.user];
        });
      }
    };

    const handleStopTyping = (data) => {
      if (data.cardId === task.id) {
        setActiveTypers((prev) =>
          prev.filter((u) => u.id !== data.user?.id && u.name !== data.user?.name)
        );
      }
    };

    socket.on('card:comment:added', handleCommentAdded);
    socket.on('card:typing', handleTyping);
    socket.on('card:stop_typing', handleStopTyping);

    return () => {
      leaveCard(task.id);
      socket.off('card:comment:added', handleCommentAdded);
      socket.off('card:typing', handleTyping);
      socket.off('card:stop_typing', handleStopTyping);
    };
  }, [task?.id]);

  const [subtasks, setSubtasks] = useState(
    task?.subtasks?.length > 0
      ? task.subtasks
      : [
          { id: 1, title: 'Draft API specification and schema', done: false },
          { id: 2, title: 'Configure unit test pipeline', done: true },
        ]
  );
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [attachments, setAttachments] = useState(task?.attachments || []);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const reporterName = currentUser?.name || 'Samarth Choudhary';
  const reporterInitials =
    currentUser?.initials ||
    (reporterName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'SC');

  const handleAssignToMe = () => {
    const updatedAssignee = {
      name: reporterName,
      initials: reporterInitials,
    };
    setAssignee(updatedAssignee);
    if (onUpdateTask) onUpdateTask(task.id, { assignedTo: updatedAssignee });
    if (showNotification) showNotification(`Task assigned to ${reporterName}`);
  };

  const handleToggleWatch = () => {
    if (isWatching) {
      setIsWatching(false);
      setWatchersCount((prev) => Math.max(0, prev - 1));
      if (showNotification) showNotification('Stopped watching task');
    } else {
      setIsWatching(true);
      setWatchersCount((prev) => prev + 1);
      if (showNotification) showNotification('Now watching this task');
    }
  };

  // Real-time typing tracking (Day 6-7)
  const handleCommentChange = (e) => {
    const val = e.target.value;
    setNewComment(val);
    emitCardTyping(task.id, 'comment');

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      emitCardStopTyping(task.id);
    }, 1200);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const commentText = newComment.trim();

    // Stop typing immediately
    emitCardStopTyping(task.id);

    const tempComment = {
      id: Date.now(),
      author: reporterName,
      initials: reporterInitials,
      time: 'Just now',
      text: commentText,
    };

    // Optimistic UI update
    setComments((prev) => [...prev, tempComment]);
    setNewComment('');
    setIsAddingComment(false);

    // Broadcast over WebSockets
    emitCardComment(task.id, tempComment);

    // Persist to backend MongoDB & Redis cache
    try {
      const res = await kanbanApi.addCardComment(task.id, {
        text: commentText,
        author: reporterName,
        initials: reporterInitials,
      });

      if (res && res.card && onUpdateTask) {
        onUpdateTask(task.id, { comments: res.card.comments });
      }
    } catch (err) {
      console.warn('Failed to persist comment to API:', err);
    }

    if (showNotification) showNotification('Comment added to task');
  };

  const handleDeleteComment = async (commentId) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    try {
      await kanbanApi.deleteCardComment(task.id, commentId);
      if (onUpdateTask) {
        const nextComments = comments.filter((c) => c.id !== commentId);
        onUpdateTask(task.id, { comments: nextComments });
      }
      if (showNotification) showNotification('Comment deleted');
    } catch (err) {
      console.warn('Failed to delete comment:', err);
    }
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: Date.now(), title: newSubtaskTitle.trim(), done: false },
    ]);
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
    if (showNotification) showNotification('Subtask created');
  };

  const toggleSubtaskDone = (id) => {
    setSubtasks((prev) =>
      prev.map((st) => (st.id === id ? { ...st, done: !st.done } : st))
    );
  };

  const handleImproveTaskAI = () => {
    if (showNotification) {
      showNotification('Atlassian Intelligence refined description and acceptance criteria!');
    }
    setDescription(
      `**Objective:**\nDeliver core functionality for ${taskTitle}.\n\n**Acceptance Criteria:**\n- [ ] Implemented as per design specification\n- [ ] Unit test coverage >= 85%\n- [ ] CI/CD deployment verified without regressions`
    );
    setIsEditingDesc(true);
  };

  const handleAddAttachmentMock = () => {
    const fileId = Date.now();
    setAttachments((prev) => [
      ...prev,
      {
        id: fileId,
        name: `spec_mockup_${attachments.length + 1}.png`,
        size: '240 KB',
        date: 'Just now',
      },
    ]);
    if (showNotification) showNotification('Attachment added successfully');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/55 backdrop-blur-[2px] animate-fadeIn select-none">
      {/* Modal Dialog Box */}
      <div
        className={`bg-white rounded-lg shadow-2xl border border-[#DFE1E6] flex flex-col transition-all duration-200 overflow-hidden ${
          isFullWidth
            ? 'w-[98vw] h-[96vh]'
            : 'w-full max-w-5xl max-h-[92vh] h-[860px]'
        }`}
      >
        {/* ========================================================================= */}
        {/* 1. TOP HEADER / BREADCRUMBS & TOOLBAR */}
        {/* ========================================================================= */}
        <div className="h-13 px-5 border-b border-[#DFE1E6] flex items-center justify-between shrink-0 bg-white sticky top-0 z-20">
          {/* Left: Add epic + Issue Type & Key */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setIsAddingParent(true)}
              className="flex items-center gap-1.5 px-2 py-1 text-[#42526E] hover:text-[#172B4D] hover:bg-[#EBECF0] rounded cursor-pointer font-medium"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#6554C0]" />
              <span>{parentEpic || 'Add epic'}</span>
            </button>

            <span className="text-[#C1C7D0]">/</span>

            <div className="flex items-center gap-1.5 px-2 py-1 text-[#0052CC] hover:bg-[#DEEBFF] rounded cursor-pointer font-semibold">
              <CheckSquare className="w-4 h-4 text-[#0052CC]" />
              <span>{task?.id || 'KAN-1'}</span>
            </div>
          </div>

          {/* Right Action Icons: Lock, Watchers, Share, ..., Maximize, Close */}
          <div className="flex items-center gap-1 text-[#6B778C]">
            {/* Lock */}
            <button
              title="Issue security"
              onClick={() => showNotification && showNotification('Issue permissions restricted to workspace')}
              className="p-1.5 rounded hover:bg-[#EBECF0] hover:text-[#172B4D] cursor-pointer"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Watchers Pill Button */}
            <button
              onClick={handleToggleWatch}
              title={isWatching ? 'Stop watching' : 'Watch issue'}
              className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#EBECF0] hover:text-[#172B4D] border border-[#DFE1E6] text-xs font-semibold text-[#0052CC] cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#0052CC]" />
              <span>{watchersCount}</span>
            </button>

            {/* Share */}
            <button
              onClick={() => showNotification && showNotification('Issue link copied to clipboard')}
              title="Share issue"
              className="p-1.5 rounded hover:bg-[#EBECF0] hover:text-[#172B4D] cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* More Options */}
            <button
              title="More actions"
              className="p-1.5 rounded hover:bg-[#EBECF0] hover:text-[#172B4D] cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* Maximize Toggle */}
            <button
              onClick={() => setIsFullWidth(!isFullWidth)}
              title={isFullWidth ? 'Restore size' : 'Expand full width'}
              className="p-1.5 rounded hover:bg-[#EBECF0] hover:text-[#172B4D] cursor-pointer"
            >
              {isFullWidth ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Modal (✕) */}
            <button
              onClick={onClose}
              title="Close (Esc)"
              className="p-1.5 rounded hover:bg-[#FFEBE6] hover:text-[#DE350B] cursor-pointer transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. BODY CONTENT: TWO COLUMNS (MAIN DETAILS + RIGHT SIDEBAR) */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#DFE1E6]">
          {/* ----------------------------------------------------------------------- */}
          {/* LEFT MAIN COLUMN (~64% width) */}
          {/* ----------------------------------------------------------------------- */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Task Title (Editable) */}
            <div>
              {isEditingTitle ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full text-2xl font-bold text-[#172B4D] p-1.5 border border-[#4C9AFF] rounded focus:outline-none focus:ring-2 focus:ring-[#4C9AFF]/30"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsEditingTitle(false);
                        if (onUpdateTask) onUpdateTask(task.id, { title: taskTitle });
                        if (showNotification) showNotification('Task title updated');
                      }}
                      className="px-2.5 py-1 bg-[#0052CC] text-white text-xs font-semibold rounded hover:bg-[#0065FF] cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingTitle(false)}
                      className="px-2.5 py-1 text-[#42526E] text-xs hover:bg-[#EBECF0] rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <h1
                  onClick={() => setIsEditingTitle(true)}
                  className="text-2xl font-bold text-[#172B4D] hover:bg-[#EBECF0]/60 p-1 -ml-1 rounded cursor-text transition-colors tracking-tight"
                >
                  {taskTitle}
                </h1>
              )}

              {/* Sub-action buttons directly below title (Matching screenshot: +, ..., format) */}
              <div className="flex items-center gap-1.5 mt-3 text-[#42526E]">
                <button
                  onClick={handleAddAttachmentMock}
                  title="Add attachment"
                  className="p-1.5 border border-[#DFE1E6] rounded hover:bg-[#FAFBFC] hover:text-[#172B4D] cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  title="Actions"
                  className="p-1.5 border border-[#DFE1E6] rounded hover:bg-[#FAFBFC] hover:text-[#172B4D] cursor-pointer shadow-xs"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsEditingDesc(true)}
                  title="Format description"
                  className="p-1.5 border border-[#DFE1E6] rounded hover:bg-[#FAFBFC] hover:text-[#172B4D] cursor-pointer shadow-xs"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wide">
                Description
              </h3>
              {isEditingDesc ? (
                <div className="space-y-2">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    rows={4}
                    className="w-full text-xs p-3 border border-[#4C9AFF] rounded focus:outline-none focus:ring-2 focus:ring-[#4C9AFF]/20 text-[#172B4D] leading-relaxed"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsEditingDesc(false);
                        if (onUpdateTask) onUpdateTask(task.id, { description });
                        if (showNotification) showNotification('Task description updated');
                      }}
                      className="px-3 py-1 bg-[#0052CC] text-white text-xs font-semibold rounded hover:bg-[#0065FF] cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingDesc(false)}
                      className="px-2.5 py-1 text-[#42526E] text-xs hover:bg-[#EBECF0] rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDesc(true)}
                  className="min-h-[56px] p-2.5 rounded border border-transparent hover:border-[#DFE1E6] hover:bg-[#FAFBFC] cursor-text text-xs text-[#6B778C] transition-colors leading-relaxed whitespace-pre-wrap"
                >
                  {description || 'Add a description...'}
                </div>
              )}
            </div>

            {/* Attachments Section */}
            <div className="space-y-2">
              <button
                onClick={() => setIsAttachmentsExpanded(!isAttachmentsExpanded)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#172B4D] hover:text-[#0052CC] cursor-pointer"
              >
                {isAttachmentsExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5" />
                )}
                <span>Attachments</span>
                {attachments.length > 0 && (
                  <span className="text-[11px] text-[#6B778C] font-normal">
                    ({attachments.length})
                  </span>
                )}
              </button>

              {isAttachmentsExpanded && (
                <div className="space-y-2">
                  {/* Dashed dropzone matching the screenshot */}
                  <div
                    onClick={handleAddAttachmentMock}
                    className="border border-dashed border-[#DFE1E6] rounded-lg p-6 bg-[#FAFBFC] hover:bg-white hover:border-[#4C9AFF] transition-colors cursor-pointer flex items-center justify-center gap-3"
                  >
                    {/* Purple/black tag icon matching screenshot */}
                    <div className="w-6 h-6 rounded-full bg-[#5243AA] text-white flex items-center justify-center shadow-xs">
                      <Paperclip className="w-3.5 h-3.5" />
                    </div>

                    <button className="px-3 py-1 bg-white border border-[#DFE1E6] text-xs font-semibold text-[#172B4D] rounded shadow-xs hover:bg-[#EBECF0] cursor-pointer">
                      Add attachment
                    </button>
                  </div>

                  {/* Rendered attachments if any */}
                  {attachments.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                      {attachments.map((att) => (
                        <div
                          key={att.id}
                          className="p-2 border border-[#DFE1E6] rounded bg-white flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Paperclip className="w-3.5 h-3.5 text-[#0052CC] shrink-0" />
                            <span className="truncate font-medium text-[#172B4D]">
                              {att.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#6B778C] shrink-0">
                            {att.size}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Subtasks Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wide">
                Subtasks
              </h3>

              <div className="space-y-1.5">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-[#FAFBFC] border border-transparent hover:border-[#DFE1E6] text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={st.done}
                        onChange={() => toggleSubtaskDone(st.id)}
                        className="rounded text-[#0052CC] focus:ring-0 cursor-pointer"
                      />
                      <span
                        className={`${
                          st.done ? 'line-through text-[#6B778C]' : 'text-[#172B4D]'
                        }`}
                      >
                        {st.title}
                      </span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EBECF0] text-[#42526E] font-medium">
                      {st.done ? 'Done' : 'To Do'}
                    </span>
                  </div>
                ))}

                {isAddingSubtask ? (
                  <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="What needs to be done?"
                      className="flex-1 text-xs p-1.5 border border-[#4C9AFF] rounded focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-[#0052CC] text-white text-xs font-semibold rounded cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingSubtask(false)}
                      className="px-2 py-1 text-xs text-[#42526E] hover:bg-[#EBECF0] rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsAddingSubtask(true)}
                    className="text-xs text-[#6B778C] hover:text-[#0052CC] cursor-pointer flex items-center gap-1 font-medium py-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add subtask</span>
                  </button>
                )}
              </div>
            </div>

            {/* Linked Work Items Section */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wide">
                Linked work items
              </h3>
              <button
                onClick={() => showNotification && showNotification('Issue linker opened')}
                className="text-xs text-[#6B778C] hover:text-[#0052CC] cursor-pointer flex items-center gap-1 font-medium py-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add linked work item</span>
              </button>
            </div>

            {/* Activity Section */}
            <div className="space-y-3 pt-3 border-t border-[#DFE1E6]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wide">
                  Activity
                </h3>
                {/* Tabs: All, Comments, History, Work log */}
                <div className="flex items-center gap-1 bg-[#F4F5F7] p-0.5 rounded text-xs">
                  {['All', 'Comments', 'History', 'Work log'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActivityTab(tab)}
                      className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                        activityTab === tab
                          ? 'bg-white text-[#0052CC] shadow-xs'
                          : 'text-[#42526E] hover:text-[#172B4D]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Comment Input */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#FF8B00] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  {reporterInitials}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={handleCommentChange}
                    onFocus={() => setIsAddingComment(true)}
                    placeholder="Add a comment... (Type to sync live with collaborators)"
                    className="w-full text-xs p-2 border border-[#DFE1E6] rounded focus:border-[#4C9AFF] focus:ring-1 focus:ring-[#4C9AFF] transition-colors"
                  />

                  {/* Real-time Typing Indicator (Week 3 Day 6-7) */}
                  {activeTypers.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-[#0052CC] font-medium py-0.5 animate-fadeIn">
                      <span className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                      <span>
                        {activeTypers.map((u) => u.name || 'Collaborator').join(', ')} is typing a comment...
                      </span>
                    </div>
                  )}

                  {isAddingComment && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAddComment}
                        className="px-3 py-1 bg-[#0052CC] text-white text-xs font-semibold rounded hover:bg-[#0065FF] cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingComment(false);
                          setNewComment('');
                          emitCardStopTyping(task.id);
                        }}
                        className="px-2.5 py-1 text-[#42526E] text-xs hover:bg-[#EBECF0] rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-3 pt-2">
                {comments.length === 0 ? (
                  <div className="text-center py-4 text-[#6B778C] text-xs">
                    No comments yet. Start the conversation!
                  </div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2.5 text-xs group">
                      <div className="w-7 h-7 rounded-full bg-[#0052CC] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {c.initials || 'US'}
                      </div>
                      <div className="flex-1 bg-[#FAFBFC] border border-[#DFE1E6] rounded p-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#172B4D]">{c.author}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[#6B778C]">{c.time}</span>
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-[#6B778C] hover:text-[#DE350B] rounded cursor-pointer transition-opacity"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[#172B4D] leading-relaxed whitespace-pre-wrap">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT SIDEBAR COLUMN (~36% width) */}
          {/* ----------------------------------------------------------------------- */}
          <div className="w-full md:w-80 lg:w-96 p-5 space-y-4 shrink-0 bg-white">
            {/* Top Status & AI Action Buttons Row (Matching screenshot: To Do ∨, ⚡, ✦ Improve Task) */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="px-3 py-1.5 bg-[#FAFBFC] hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>{status}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B778C]" />
                </button>

                {showStatusDropdown && (
                  <div className="absolute left-0 top-9 w-36 bg-white border border-[#DFE1E6] rounded shadow-lg py-1 z-30 text-xs">
                    {['To Do', 'In Progress', 'In Review', 'Done'].map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setStatus(st);
                          setShowStatusDropdown(false);
                          if (onUpdateTask) onUpdateTask(task.id, { status: st });
                          if (showNotification) showNotification(`Status changed to ${st}`);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-[#FAFBFC] font-medium flex items-center justify-between ${
                          status === st ? 'text-[#0052CC] font-bold bg-[#DEEBFF]/30' : 'text-[#172B4D]'
                        }`}
                      >
                        <span>{st}</span>
                        {status === st && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Automation Lightning Button */}
              <button
                onClick={() => showNotification && showNotification('Triggered automation rule')}
                title="Automations"
                className="p-1.5 border border-[#DFE1E6] rounded hover:bg-[#FAFBFC] text-[#42526E] cursor-pointer shadow-xs"
              >
                <Zap className="w-3.5 h-3.5" />
              </button>

              {/* AI Improve Task Button */}
              <button
                onClick={handleImproveTaskAI}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#DFE1E6] hover:bg-[#F3F0FF] hover:border-[#6554C0] text-xs font-semibold text-[#172B4D] hover:text-[#6554C0] rounded cursor-pointer transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#6554C0]" />
                <span>Improve Task</span>
              </button>
            </div>

            {/* Collapsible Details Panel (Matching screenshot: ∨ Details ⚙) */}
            <div className="border border-[#DFE1E6] rounded-md overflow-hidden bg-white shadow-xs">
              <div className="p-3 bg-[#FAFBFC] border-b border-[#DFE1E6] flex items-center justify-between">
                <button
                  onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#172B4D] cursor-pointer"
                >
                  {isDetailsExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                  <span>Details</span>
                </button>

                <button
                  onClick={() => showNotification && showNotification('Field configuration settings')}
                  className="text-[#6B778C] hover:text-[#172B4D] cursor-pointer"
                  title="Configure fields"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>

              {isDetailsExpanded && (
                <div className="p-3.5 space-y-3.5 text-xs">
                  {/* 1. Assignee */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[#6B778C] font-medium w-24">Assignee</span>
                    <div className="flex-1 text-right">
                      {assignee ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-[#FF8B00] text-white text-[10px] font-bold flex items-center justify-center">
                            {assignee.initials || 'SC'}
                          </div>
                          <span className="font-semibold text-[#172B4D]">{assignee.name}</span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-end gap-1.5 text-[#6B778C]">
                            <div className="w-5 h-5 rounded-full bg-[#EBECF0] flex items-center justify-center">
                              <User className="w-3 h-3 text-[#6B778C]" />
                            </div>
                            <span>Unassigned</span>
                          </div>
                          <button
                            onClick={handleAssignToMe}
                            className="text-[#0052CC] hover:underline font-semibold text-[11px] cursor-pointer"
                          >
                            Assign to me
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Parent */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#6B778C] font-medium w-24">Parent</span>
                    <div className="flex-1 text-right">
                      {isAddingParent ? (
                        <input
                          type="text"
                          value={parentEpic}
                          onChange={(e) => setParentEpic(e.target.value)}
                          onBlur={() => setIsAddingParent(false)}
                          placeholder="Epic name"
                          className="text-xs p-1 border border-[#4C9AFF] rounded w-full"
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => setIsAddingParent(true)}
                          className="text-[#6B778C] hover:text-[#0052CC] hover:underline cursor-pointer"
                        >
                          {parentEpic || 'Add parent'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3. Priority */}
                  <div className="flex items-center justify-between gap-2 relative">
                    <span className="text-[#6B778C] font-medium w-24">Priority</span>
                    <div className="flex-1 text-right">
                      <button
                        onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                        className="text-[#172B4D] hover:text-[#0052CC] cursor-pointer font-medium"
                      >
                        {priority}
                      </button>

                      {showPriorityDropdown && (
                        <div className="absolute right-0 top-6 w-36 bg-white border border-[#DFE1E6] rounded shadow-lg py-1 z-30 text-xs">
                          {[
                            { label: 'Urgent', color: 'text-rose-600 font-bold', icon: '🔥' },
                            { label: 'High', color: 'text-amber-600 font-semibold', icon: '↑' },
                            { label: 'Medium', color: 'text-yellow-600 font-semibold', icon: '=' },
                            { label: 'Low', color: 'text-emerald-600 font-medium', icon: '↓' },
                            { label: 'None', color: 'text-slate-500 font-normal', icon: '-' },
                          ].map((p) => (
                            <button
                              key={p.label}
                              onClick={() => {
                                setPriority(p.label);
                                setShowPriorityDropdown(false);
                                if (onUpdateTask) onUpdateTask(task.id, { priority: p.label });
                                if (showNotification) showNotification(`Priority set to ${p.label}`);
                              }}
                              className={`w-full text-left px-3 py-1.5 hover:bg-[#FAFBFC] flex items-center gap-2 cursor-pointer ${p.color}`}
                            >
                              <span>{p.icon}</span>
                              <span>{p.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4. Labels */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#6B778C] font-medium w-24">Labels</span>
                    <div className="flex-1 text-right">
                      {labels.length > 0 ? (
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          {labels.map((l, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-[#EBECF0] rounded text-[11px]">
                              {l}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setLabels(['frontend', 'auth']);
                            if (showNotification) showNotification('Added sample labels');
                          }}
                          className="text-[#6B778C] hover:text-[#0052CC] hover:underline cursor-pointer"
                        >
                          Add labels
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 5. Due date (Matching screenshot: Oct 7, 2026) */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#6B778C] font-medium w-24">Due date</span>
                    <span className="text-[#172B4D] font-medium">{dueDate}</span>
                  </div>

                  {/* 6. Team */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#6B778C] font-medium w-24">Team</span>
                    <div className="flex-1 text-right">
                      {isAddingTeam ? (
                        <input
                          type="text"
                          value={team}
                          onChange={(e) => setTeam(e.target.value)}
                          onBlur={() => setIsAddingTeam(false)}
                          placeholder="Team name"
                          className="text-xs p-1 border border-[#4C9AFF] rounded w-full"
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => setIsAddingTeam(true)}
                          className="text-[#6B778C] hover:text-[#0052CC] hover:underline cursor-pointer"
                        >
                          {team || 'Add team'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 7. Start date */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#6B778C] font-medium w-24">Start date</span>
                    <div className="flex-1 text-right">
                      {isAddingStartDate ? (
                        <input
                          type="text"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          onBlur={() => setIsAddingStartDate(false)}
                          placeholder="e.g. Oct 1, 2026"
                          className="text-xs p-1 border border-[#4C9AFF] rounded w-full"
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => setIsAddingStartDate(true)}
                          className="text-[#6B778C] hover:text-[#0052CC] hover:underline cursor-pointer"
                        >
                          {startDate || 'Add date'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 8. Reporter (Matching screenshot: SC Samarth Choudhary) */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#DFE1E6]/70">
                    <span className="text-[#6B778C] font-medium w-24">Reporter</span>
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-[#FF8B00] text-white text-[10px] font-bold flex items-center justify-center">
                        {reporterInitials}
                      </div>
                      <span className="font-semibold text-[#172B4D]">{reporterName}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
