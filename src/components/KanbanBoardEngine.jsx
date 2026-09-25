import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Plus,
  Search,
  Filter,
  Layers,
  MoreHorizontal,
  CheckSquare,
  Bookmark,
  User,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  Trash2,
  Edit2,
  RefreshCw,
  X,
  Radio,
  Share2,
  Star,
  Zap,
  ChevronDown,
  ChevronRight,
  Info,
  ExternalLink,
  SlidersHorizontal,
  ArrowUpRight,
  MessageSquare,
  BarChart2,
} from 'lucide-react';
import kanbanApi from '../services/kanbanApi';
import {
  joinBoard,
  getSocket,
  emitCardMove,
  emitCardCreate,
  emitCardDelete,
} from '../services/socket';

export const KanbanBoardEngine = ({
  workspace,
  user,
  onSelectCard,
  showNotification,
  onRequestCreateIssue,
}) => {
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [boardSearch, setBoardSearch] = useState('');
  const [addingToCol, setAddingToCol] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [editingListTitle, setEditingListTitle] = useState('');
  const [activeListMenu, setActiveListMenu] = useState(null);
  const [isStarred, setIsStarred] = useState(true);

  // Jira Query Parameter & Filter State (filter=assignee = empty & groupBy=none)
  const getInitialParams = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return {
        filter: params.get('filter') || 'assignee = empty',
        groupBy: params.get('groupBy') || 'none',
      };
    } catch {
      return { filter: 'assignee = empty', groupBy: 'none' };
    }
  };

  const initialParams = getInitialParams();
  const [activeFilter, setActiveFilter] = useState(initialParams.filter); // 'assignee = empty', 'only_my_issues', 'member_SC', 'all'
  const [activeGroupBy, setActiveGroupBy] = useState(initialParams.groupBy); // 'none', 'assignee', 'epic'
  const [showGroupByDropdown, setShowGroupByDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [collapsedSwimlanes, setCollapsedSwimlanes] = useState({});
  const [showInsights, setShowInsights] = useState(false);

  // Optimistic State & Sync Status
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'saving', 'error'
  const [activeSocketUsers, setActiveSocketUsers] = useState([]);
  const [cardTypers, setCardTypers] = useState({}); // cardId -> Array of user objects
  const [isFromCache, setIsFromCache] = useState(false);
  const stateSnapshotRef = useRef({ lists: [], cards: {} });

  const userInitials = user?.initials || (user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'SC');

  // Sync URL when filter or groupBy changes
  const updateUrlParams = (newFilter, newGroupBy) => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (newFilter && newFilter !== 'all') {
        params.set('filter', newFilter);
      } else {
        params.delete('filter');
      }

      if (newGroupBy && newGroupBy !== 'none') {
        params.set('groupBy', newGroupBy);
      } else {
        params.set('groupBy', 'none');
      }

      const queryString = params.toString() ? `?${params.toString()}` : window.location.pathname;
      window.history.replaceState(null, '', queryString);
    } catch (e) {
      console.warn('Could not update URL params:', e);
    }
  };

  const handleFilterChange = (filterKey) => {
    const nextFilter = activeFilter === filterKey ? 'all' : filterKey;
    setActiveFilter(nextFilter);
    updateUrlParams(nextFilter, activeGroupBy);
    if (showNotification) {
      if (nextFilter === 'assignee = empty') {
        showNotification('Filter applied: assignee = empty (Showing unassigned issues)');
      } else if (nextFilter === 'only_my_issues') {
        showNotification('Filter applied: Only my issues');
      } else if (nextFilter === 'all') {
        showNotification('Cleared filters: Showing all issues');
      } else {
        showNotification(`Filter updated: ${nextFilter}`);
      }
    }
  };

  const handleGroupByChange = (groupByKey) => {
    setActiveGroupBy(groupByKey);
    setShowGroupByDropdown(false);
    updateUrlParams(activeFilter, groupByKey);
    if (showNotification) {
      showNotification(`Grouped board by: ${groupByKey === 'none' ? 'None (Columns)' : groupByKey.charAt(0).toUpperCase() + groupByKey.slice(1)}`);
    }
  };

  const handleShareBoard = () => {
    const jiraUrl = 'https://samarth13p2417.atlassian.net/jira/software/projects/KAN/boards/2?filter=assignee%20%3D%20empty&groupBy=none';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jiraUrl);
      if (showNotification) showNotification('Copied Jira board URL to clipboard!');
    } else {
      if (showNotification) showNotification(jiraUrl);
    }
  };

  // Load initial board data from API & join real-time Socket.io room
  useEffect(() => {
    loadBoardData();

    // Ensure URL matches current initial params
    updateUrlParams(activeFilter, activeGroupBy);

    // Connect to real-time engine with secure WebSocket JWT handshake
    joinBoard('board_kanban_1');
    const socket = getSocket();

    const handleActiveUsers = (users) => {
      setActiveSocketUsers(users || []);
    };

    const handleRemoteCardMoved = (data) => {
      const { cardId, sourceListId, destinationListId, sourceIndex, destinationIndex } = data;
      setLists((prevLists) => {
        const sourceList = prevLists.find((l) => l.id === sourceListId);
        const destList = prevLists.find((l) => l.id === destinationListId);
        if (!sourceList || !destList) return prevLists;

        let next = [...prevLists];
        if (sourceListId === destinationListId) {
          const newCardIds = Array.from(sourceList.cardIds);
          newCardIds.splice(sourceIndex, 1);
          newCardIds.splice(destinationIndex, 0, cardId);
          return next.map((l) => (l.id === sourceListId ? { ...l, cardIds: newCardIds } : l));
        } else {
          const sourceCardIds = Array.from(sourceList.cardIds).filter((id) => id !== cardId);
          const destCardIds = Array.from(destList.cardIds);
          destCardIds.splice(destinationIndex, 0, cardId);
          return next.map((l) => {
            if (l.id === sourceListId) return { ...l, cardIds: sourceCardIds };
            if (l.id === destinationListId) return { ...l, cardIds: destCardIds };
            return l;
          });
        }
      });

      setCards((prev) => {
        if (!prev[cardId]) return prev;
        return {
          ...prev,
          [cardId]: {
            ...prev[cardId],
            listId: destinationListId,
          },
        };
      });
    };

    const handleRemoteCardCreated = (newCard) => {
      setCards((prev) => ({ ...prev, [newCard.id]: newCard }));
      setLists((prev) =>
        prev.map((l) =>
          l.id === newCard.listId && !l.cardIds.includes(newCard.id)
            ? { ...l, cardIds: [...l.cardIds, newCard.id] }
            : l
        )
      );
    };

    const handleRemoteCardUpdated = (updatedCard) => {
      setCards((prev) => ({ ...prev, [updatedCard.id]: updatedCard }));
    };

    const handleRemoteCardDeleted = (deletedCardId) => {
      setCards((prev) => {
        const copy = { ...prev };
        delete copy[deletedCardId];
        return copy;
      });
      setLists((prev) =>
        prev.map((l) => ({
          ...l,
          cardIds: l.cardIds.filter((id) => id !== deletedCardId),
        }))
      );
    };

    const handleRemoteCommentAdded = (data) => {
      const { cardId, comment } = data;
      setCards((prev) => {
        if (!prev[cardId]) return prev;
        const currentComments = prev[cardId].comments || [];
        if (currentComments.some((c) => String(c.id) === String(comment.id))) return prev;
        return {
          ...prev,
          [cardId]: {
            ...prev[cardId],
            comments: [...currentComments, comment],
          },
        };
      });
    };

    const handleRemoteCardTyping = (data) => {
      const { cardId, user } = data;
      if (!cardId || !user) return;
      setCardTypers((prev) => {
        const current = prev[cardId] || [];
        if (current.some((u) => u.name === user.name)) return prev;
        return { ...prev, [cardId]: [...current, user] };
      });
    };

    const handleRemoteCardStopTyping = (data) => {
      const { cardId, user } = data;
      if (!cardId) return;
      setCardTypers((prev) => {
        const current = prev[cardId] || [];
        const next = current.filter((u) => u.name !== user?.name && u.id !== user?.id);
        if (next.length === 0) {
          const copy = { ...prev };
          delete copy[cardId];
          return copy;
        }
        return { ...prev, [cardId]: next };
      });
    };

    socket.on('board:active_users', handleActiveUsers);
    socket.on('card:moved', handleRemoteCardMoved);
    socket.on('card:created', handleRemoteCardCreated);
    socket.on('card:updated', handleRemoteCardUpdated);
    socket.on('card:deleted', handleRemoteCardDeleted);
    socket.on('card:comment:added', handleRemoteCommentAdded);
    socket.on('card:typing', handleRemoteCardTyping);
    socket.on('card:stop_typing', handleRemoteCardStopTyping);

    return () => {
      socket.off('board:active_users', handleActiveUsers);
      socket.off('card:moved', handleRemoteCardMoved);
      socket.off('card:created', handleRemoteCardCreated);
      socket.off('card:updated', handleRemoteCardUpdated);
      socket.off('card:deleted', handleRemoteCardDeleted);
      socket.off('card:comment:added', handleRemoteCommentAdded);
      socket.off('card:typing', handleRemoteCardTyping);
      socket.off('card:stop_typing', handleRemoteCardStopTyping);
    };
  }, []);

  const loadBoardData = async () => {
    try {
      setIsLoading(true);
      const data = await kanbanApi.getBoardData();
      setLists(data.lists);
      setCards(data.cards);
      setIsFromCache(!!data._fromCache);
      stateSnapshotRef.current = { lists: data.lists, cards: data.cards };
    } catch (err) {
      console.error('Failed to load board data:', err);
      if (showNotification) showNotification('Failed to load board data');
    } finally {
      setIsLoading(false);
    }
  };

  // Capture snapshot for optimistic rollback
  const takeSnapshot = () => {
    stateSnapshotRef.current = {
      lists: JSON.parse(JSON.stringify(lists)),
      cards: JSON.parse(JSON.stringify(cards)),
    };
  };

  // Rollback on API failure
  const rollbackState = (msg = 'Action failed. Rolling back changes.') => {
    setLists(stateSnapshotRef.current.lists);
    setCards(stateSnapshotRef.current.cards);
    setSyncStatus('error');
    setTimeout(() => setSyncStatus('synced'), 3000);
    if (showNotification) showNotification(msg);
  };

  // =========================================================================
  // DRAG AND DROP HANDLER
  // =========================================================================
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    const cleanSourceId = source.droppableId.includes('__') ? source.droppableId.split('__')[1] : source.droppableId;
    const cleanDestId = destination.droppableId.includes('__') ? destination.droppableId.split('__')[1] : destination.droppableId;

    if (
      cleanSourceId === cleanDestId &&
      source.index === destination.index
    ) {
      return;
    }

    takeSnapshot();
    setSyncStatus('saving');

    const sourceList = lists.find((l) => l.id === cleanSourceId);
    const destList = lists.find((l) => l.id === cleanDestId);
    if (!sourceList || !destList) return;

    let newLists = [...lists];

    if (cleanSourceId === cleanDestId) {
      const newCardIds = Array.from(sourceList.cardIds || []);
      newCardIds.splice(source.index, 1);
      newCardIds.splice(destination.index, 0, draggableId);

      newLists = newLists.map((l) =>
        l.id === sourceList.id ? { ...l, cardIds: newCardIds } : l
      );

      setLists(newLists);
    } else {
      const sourceCardIds = Array.from(sourceList.cardIds || []);
      sourceCardIds.splice(source.index, 1);

      const destCardIds = Array.from(destList.cardIds || []);
      destCardIds.splice(destination.index, 0, draggableId);

      newLists = newLists.map((l) => {
        if (l.id === sourceList.id) return { ...l, cardIds: sourceCardIds };
        if (l.id === destList.id) return { ...l, cardIds: destCardIds };
        return l;
      });

      const updatedCard = {
        ...cards[draggableId],
        listId: destList.id,
        status: destList.title,
      };

      setLists(newLists);
      setCards((prev) => ({ ...prev, [draggableId]: updatedCard }));
    }

    try {
      await kanbanApi.moveCard({
        cardId: draggableId,
        sourceListId: cleanSourceId,
        destinationListId: cleanDestId,
        sourceIndex: source.index,
        destinationIndex: destination.index,
      });

      emitCardMove({
        cardId: draggableId,
        sourceListId: cleanSourceId,
        destinationListId: cleanDestId,
        sourceIndex: source.index,
        destinationIndex: destination.index,
      });

      setSyncStatus('synced');
    } catch (err) {
      console.error('Drag and drop move failed on server:', err);
      rollbackState('Failed to persist task movement. Rolled back.');
    }
  };

  // =========================================================================
  // CARDS CRUD OPERATIONS
  // =========================================================================
  const handleAddCard = async (listId) => {
    if (!newCardTitle.trim()) {
      setAddingToCol(null);
      return;
    }

    takeSnapshot();
    setSyncStatus('saving');

    const tempTitle = newCardTitle.trim();
    setNewCardTitle('');
    setAddingToCol(null);

    try {
      const createdCard = await kanbanApi.createCard(listId, {
        title: tempTitle,
        assignedTo: null, // Default unassigned (matches assignee = empty filter!)
      });

      setCards((prev) => ({ ...prev, [createdCard.id]: createdCard }));
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId ? { ...l, cardIds: [...l.cardIds, createdCard.id] } : l
        )
      );

      setSyncStatus('synced');
      emitCardCreate(createdCard);
      if (showNotification) showNotification(`Created ${createdCard.id}: ${tempTitle}`);
    } catch (err) {
      console.error('Card creation failed:', err);
      rollbackState('Failed to create task.');
    }
  };

  const handleDeleteCard = async (cardId, e) => {
    if (e) e.stopPropagation();
    takeSnapshot();
    setSyncStatus('saving');

    try {
      await kanbanApi.deleteCard(cardId);
      emitCardDelete(cardId);
      setCards((prev) => {
        const copy = { ...prev };
        delete copy[cardId];
        return copy;
      });
      setLists((prev) =>
        prev.map((l) => ({
          ...l,
          cardIds: l.cardIds.filter((id) => id !== cardId),
        }))
      );
      setSyncStatus('synced');
      if (showNotification) showNotification(`Deleted issue ${cardId}`);
    } catch (err) {
      console.error('Delete card failed:', err);
      rollbackState('Failed to delete task.');
    }
  };

  // =========================================================================
  // LISTS CRUD OPERATIONS
  // =========================================================================
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    takeSnapshot();
    setSyncStatus('saving');

    const title = newListTitle.trim();
    setNewListTitle('');
    setIsAddingList(false);

    try {
      const newList = await kanbanApi.createList(title);
      setLists((prev) => [...prev, newList]);
      setSyncStatus('synced');
      if (showNotification) showNotification(`Created column "${title}"`);
    } catch (err) {
      console.error('Create column failed:', err);
      rollbackState('Failed to create column.');
    }
  };

  const handleUpdateListTitle = async (listId) => {
    if (!editingListTitle.trim()) {
      setEditingListId(null);
      return;
    }

    takeSnapshot();
    setSyncStatus('saving');

    const title = editingListTitle.trim();
    setEditingListId(null);

    try {
      await kanbanApi.updateList(listId, { title });
      setLists((prev) =>
        prev.map((l) => (l.id === listId ? { ...l, title } : l))
      );
      setSyncStatus('synced');
      if (showNotification) showNotification(`Renamed column to "${title}"`);
    } catch (err) {
      console.error('Update column failed:', err);
      rollbackState('Failed to update column.');
    }
  };

  const handleDeleteList = async (listId) => {
    takeSnapshot();
    setSyncStatus('saving');
    setActiveListMenu(null);

    try {
      await kanbanApi.deleteList(listId);
      setLists((prev) => prev.filter((l) => l.id !== listId));
      setSyncStatus('synced');
      if (showNotification) showNotification('Column deleted');
    } catch (err) {
      console.error('Delete column failed:', err);
      rollbackState('Failed to delete column.');
    }
  };

  // Filter verification function
  const filterCard = (card) => {
    if (!card) return false;

    // Search query check
    if (boardSearch.trim()) {
      const q = boardSearch.toLowerCase();
      const matchTitle = card.title?.toLowerCase().includes(q);
      const matchKey = card.id?.toLowerCase().includes(q) || card.key?.toLowerCase().includes(q);
      const matchDesc = card.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchKey && !matchDesc) return false;
    }

    // Quick filter check
    if (activeFilter === 'assignee = empty') {
      const isUnassigned = !card.assignedTo || !card.assignedTo.name;
      return isUnassigned;
    }

    if (activeFilter === 'only_my_issues') {
      const myName = (user?.name || 'Samarth').toLowerCase();
      const cardAssignee = card.assignedTo?.name?.toLowerCase() || '';
      return cardAssignee.includes(myName) || cardAssignee.includes('samarth');
    }

    if (activeFilter.startsWith('member_')) {
      const targetInitials = activeFilter.replace('member_', '');
      const cardInitials = card.assignedTo?.initials || '';
      return cardInitials.toUpperCase() === targetInitials.toUpperCase();
    }

    return true;
  };

  // Calculate filtered counts and analytics
  const allCardIds = lists.flatMap((l) => l.cardIds);
  const totalCount = allCardIds.length;
  const filteredCount = allCardIds.filter((id) => filterCard(cards[id])).length;
  const unassignedCount = allCardIds.filter((id) => !cards[id]?.assignedTo || !cards[id]?.assignedTo.name).length;

  // Dashboard Analytics (Week 4 Essential): completed, pending, and overdue tasks
  const completedCount = allCardIds.filter((id) => {
    const c = cards[id];
    if (!c) return false;
    return c.status === 'Done' || c.status === 'Completed' || (lists.find((l) => l.id === c.listId)?.title?.toLowerCase()?.includes('done'));
  }).length;

  const pendingCount = Math.max(0, totalCount - completedCount);

  const overdueCount = allCardIds.filter((id) => {
    const c = cards[id];
    if (!c || !c.dueDate || c.status === 'Done') return false;
    const dueTime = new Date(c.dueDate).getTime();
    return !isNaN(dueTime) && dueTime < Date.now();
  }).length;

  const urgentCount = allCardIds.filter((id) => {
    const c = cards[id];
    return c?.priority === 'Urgent' || c?.priority === 'Highest';
  }).length;

  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Render Issue Type Icon
  const renderIssueTypeIcon = (iconType) => {
    switch (iconType) {
      case 'story':
        return <Bookmark className="w-3.5 h-3.5 text-[#36B37E]" title="Story" />;
      case 'bug':
        return <AlertCircle className="w-3.5 h-3.5 text-[#DE350B]" title="Bug" />;
      case 'epic':
        return <Zap className="w-3.5 h-3.5 text-[#6554C0]" title="Epic" />;
      case 'check':
      default:
        return <CheckSquare className="w-3.5 h-3.5 text-[#0052CC]" title="Task" />;
    }
  };

  // Render Priority Icon (Supports Urgent, High, Medium, Low)
  const renderPriorityIcon = (priority) => {
    switch (priority) {
      case 'Urgent':
      case 'Highest':
        return (
          <span title="Urgent Priority" className="text-rose-600 font-black text-xs leading-none flex items-center">
            🔥
          </span>
        );
      case 'High':
        return (
          <span title="High Priority" className="text-[#FF5630] font-black text-xs leading-none">
            ↑
          </span>
        );
      case 'Low':
      case 'Lowest':
        return (
          <span title="Low Priority" className="text-[#36B37E] font-black text-xs leading-none">
            ↓
          </span>
        );
      case 'Medium':
      default:
        return (
          <span title="Medium Priority" className="text-[#FFAB00] font-bold text-xs leading-none">
            =
          </span>
        );
    }
  };

  // Render a Single Kanban Card
  const renderCardItem = (card, index) => {
    if (!card) return null;

    return (
      <Draggable key={card.id} draggableId={card.id} index={index}>
        {(dragProvided, dragSnapshot) => (
          <div
            ref={dragProvided.innerRef}
            {...dragProvided.draggableProps}
            {...dragProvided.dragHandleProps}
            onClick={() => onSelectCard(card)}
            className={`bg-white p-3 rounded-[3px] border transition-all cursor-pointer space-y-2 group select-none ${
              dragSnapshot.isDragging
                ? 'shadow-2xl border-[#0052CC] ring-2 ring-[#0052CC]/30 rotate-1'
                : 'shadow-[0_1px_2px_rgba(9,30,66,0.25)] hover:shadow-md border-[#DFE1E6] hover:border-[#0052CC]'
            }`}
          >
            {/* Top row: Summary + Delete icon on hover */}
            <div className="flex items-start justify-between gap-1">
              <p className="text-[13px] font-normal text-[#172B4D] group-hover:text-[#0052CC] leading-snug">
                {card.title}
              </p>
              <button
                type="button"
                onClick={(e) => handleDeleteCard(card.id, e)}
                title="Delete issue"
                className="opacity-0 group-hover:opacity-100 p-1 text-[#6B778C] hover:text-[#DE350B] rounded hover:bg-[#FFEBE6] transition-opacity cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Labels / Parent Epic badges */}
            {(card.parent || (card.labels && card.labels.length > 0)) && (
              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                {card.parent && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#F3F0FF] text-[#6554C0] rounded tracking-wide uppercase">
                    {card.parent}
                  </span>
                )}
                {card.labels &&
                  card.labels.slice(0, 2).map((l, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-1.5 py-0.2 bg-[#EBECF0] text-[#42526E] rounded font-medium"
                    >
                      {l}
                    </span>
                  ))}
              </div>
            )}

            {/* Real-time collaborator typing indicator on card */}
            {cardTypers[card.id] && cardTypers[card.id].length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-[#0052CC] font-semibold bg-[#E9F2FF] px-2 py-0.5 rounded animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC]" />
                <span>{cardTypers[card.id].map((u) => u.name || 'User').join(', ')} typing...</span>
              </div>
            )}

            {/* Card Footer: Issue Type + Key + Priority + Story Points + Comments + Assignee */}
            <div className="flex items-center justify-between pt-1 border-t border-[#F4F5F7]">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5E6C84]">
                {renderIssueTypeIcon(card.iconType)}
                <span className="hover:underline">{card.id || card.key}</span>
                {renderPriorityIcon(card.priority)}
                {card.storyPoints !== undefined && (
                  <span className="w-4 h-4 rounded-full bg-[#EBECF0] text-[#42526E] text-[10px] font-bold flex items-center justify-center">
                    {card.storyPoints}
                  </span>
                )}
                {card.comments && card.comments.length > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-[#6B778C] hover:text-[#0052CC] font-normal" title={`${card.comments.length} comments`}>
                    <MessageSquare className="w-3 h-3" />
                    <span>{card.comments.length}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {card.assignedTo ? (
                  <div
                    title={`Assigned to ${card.assignedTo.name || 'Member'}`}
                    className="w-5 h-5 rounded-full bg-[#FF8B00] text-white flex items-center justify-center text-[10px] font-bold ring-1 ring-white"
                  >
                    {card.assignedTo.initials || 'SC'}
                  </div>
                ) : (
                  <div
                    title="Unassigned (assignee = empty)"
                    className="w-5 h-5 rounded-full bg-[#EBECF0] text-[#6B778C] flex items-center justify-center text-[10px] border border-dashed border-[#A5ADBA]"
                  >
                    <User className="w-3 h-3 text-[#6B778C]" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  // Group definitions for Swimlanes when groupBy !== 'none'
  const getSwimlanes = () => {
    if (activeGroupBy === 'assignee') {
      return [
        {
          id: 'unassigned',
          title: 'Unassigned (assignee = empty)',
          filterFn: (c) => !c.assignedTo || !c.assignedTo.name,
          badgeColor: 'bg-gray-100 text-gray-700',
        },
        {
          id: 'samarth',
          title: 'Samarth Choudhary',
          initials: 'SC',
          filterFn: (c) => c.assignedTo?.name?.toLowerCase().includes('samarth'),
          badgeColor: 'bg-amber-100 text-amber-800',
        },
        {
          id: 'shrutika',
          title: 'Shrutika',
          initials: 'SH',
          filterFn: (c) => c.assignedTo?.name?.toLowerCase().includes('shrutika'),
          badgeColor: 'bg-blue-100 text-blue-800',
        },
        {
          id: 'alex',
          title: 'Alex Morgan',
          initials: 'AM',
          filterFn: (c) => c.assignedTo?.name?.toLowerCase().includes('alex'),
          badgeColor: 'bg-green-100 text-green-800',
        },
      ];
    }

    if (activeGroupBy === 'epic') {
      return [
        {
          id: 'core',
          title: 'Core Features',
          filterFn: (c) => c.parent?.toLowerCase().includes('core'),
          badgeColor: 'bg-purple-100 text-purple-800',
        },
        {
          id: 'devops',
          title: 'DevOps & CI/CD',
          filterFn: (c) => c.parent?.toLowerCase().includes('devops'),
          badgeColor: 'bg-blue-100 text-blue-800',
        },
        {
          id: 'security',
          title: 'Security & Auth',
          filterFn: (c) => c.parent?.toLowerCase().includes('security'),
          badgeColor: 'bg-amber-100 text-amber-800',
        },
        {
          id: 'none',
          title: 'Issues without epic',
          filterFn: (c) => !c.parent,
          badgeColor: 'bg-gray-100 text-gray-700',
        },
      ];
    }

    return [];
  };

  return (
    <div className="space-y-4">
      
      {/* ========================================================================= */}
      {/* 1. JIRA BOARD HEADER: TITLE + BREADCRUMBS + CONTROLS */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-2">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-[#6B778C] font-medium">
          <span className="hover:underline cursor-pointer">Projects</span>
          <span>/</span>
          <span className="text-[#172B4D] font-semibold hover:underline cursor-pointer">
            {workspace?.name || 'Samarth Workspace'}
          </span>
          <span>/</span>
          <span className="text-[#172B4D]">Board</span>
        </div>

        {/* Board Title + Quick Actions */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#172B4D] tracking-tight">
              {workspace?.name || 'Samarth Workspace'}
            </h1>

            {/* Star Favorite */}
            <button
              onClick={() => {
                setIsStarred(!isStarred);
                if (showNotification) showNotification(isStarred ? 'Removed from starred' : 'Starred KAN board');
              }}
              title={isStarred ? 'Starred' : 'Add to starred'}
              className="p-1 rounded hover:bg-[#EBECF0] text-[#6B778C] cursor-pointer"
            >
              <Star className={`w-4 h-4 ${isStarred ? 'text-amber-500 fill-amber-500' : ''}`} />
            </button>

            {/* Share Board Button */}
            <button
              onClick={handleShareBoard}
              title="Share board URL"
              className="px-2.5 py-1 bg-white hover:bg-[#EBECF0] text-[#42526E] text-xs font-semibold rounded-[3px] border border-[#DFE1E6] flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>

          {/* Right Header Badges: Socket.io Live Status + Sync Status */}
          <div className="flex items-center gap-2.5">
            {/* Real-time Socket.io active users */}
            <div
              className="flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded border border-[#DFE1E6] bg-white shadow-xs"
              title="Real-time Socket.io synchronization with secure WebSocket handshake"
            >
              <Radio className="w-3 h-3 text-[#0052CC] animate-pulse" />
              <span className="text-[#0052CC] font-semibold">
                Live: {Math.max(1, activeSocketUsers.length)} active
              </span>
            </div>

            {/* Optimistic Sync Status */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded border border-[#DFE1E6] bg-white shadow-xs">
              {syncStatus === 'synced' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#36B37E]" />
                  <span className="text-[#006644]">Synced</span>
                </>
              )}
              {syncStatus === 'saving' && (
                <>
                  <RefreshCw className="w-3 h-3 text-[#0052CC] animate-spin" />
                  <span className="text-[#0052CC]">Syncing...</span>
                </>
              )}
              {syncStatus === 'error' && (
                <>
                  <AlertCircle className="w-3 h-3 text-[#DE350B]" />
                  <span className="text-[#DE350B]">Sync error</span>
                </>
              )}
            </div>

            {/* Analytics & Insights Toggle Button (Week 4 Essential) */}
            <button
              onClick={() => setShowInsights(!showInsights)}
              title="Toggle board analytics (completed, pending, overdue)"
              className={`px-2.5 py-1 text-xs font-semibold rounded-[3px] border flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer ${
                showInsights
                  ? 'bg-[#DEEBFF] text-[#0052CC] border-[#0052CC] font-bold ring-1 ring-[#0052CC]/30'
                  : 'bg-white hover:bg-[#FAFBFC] text-[#42526E] border-[#DFE1E6]'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-[#0052CC]" />
              <span>Analytics</span>
            </button>

            {/* Add Column Button */}
            <button
              onClick={() => setIsAddingList(true)}
              className="px-3 py-1 bg-[#FAFBFC] hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] rounded-[3px] text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add column</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. JIRA TOOLBAR: SEARCH + QUICK FILTERS (assignee = empty) + GROUP BY */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
        
        {/* Left Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Search this board */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B778C]" />
            <input
              type="text"
              value={boardSearch}
              onChange={(e) => setBoardSearch(e.target.value)}
              placeholder="Search this board"
              className="pl-8 pr-3 py-1 text-xs bg-white border border-[#DFE1E6] rounded-[3px] focus:border-[#4C9AFF] focus:ring-1 focus:ring-[#4C9AFF] w-48 shadow-xs"
            />
          </div>

          {/* Member Avatars Filter */}
          <div className="flex items-center -space-x-1 pl-1">
            <button
              onClick={() => handleFilterChange('member_SC')}
              title="Filter by Samarth Choudhary (SC)"
              className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center transition-all cursor-pointer ring-2 ${
                activeFilter === 'member_SC'
                  ? 'ring-[#0052CC] bg-[#0052CC] text-white z-10 scale-105'
                  : 'ring-white bg-[#FF8B00] text-white hover:ring-[#4C9AFF]'
              }`}
            >
              SC
            </button>
            <button
              onClick={() => handleFilterChange('member_SH')}
              title="Filter by Shrutika (SH)"
              className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center transition-all cursor-pointer ring-2 ${
                activeFilter === 'member_SH'
                  ? 'ring-[#0052CC] bg-[#0052CC] text-white z-10 scale-105'
                  : 'ring-white bg-[#0052CC] text-white hover:ring-[#4C9AFF]'
              }`}
            >
              SH
            </button>
            <button
              onClick={() => handleFilterChange('member_AM')}
              title="Filter by Alex Morgan (AM)"
              className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center transition-all cursor-pointer ring-2 ${
                activeFilter === 'member_AM'
                  ? 'ring-[#0052CC] bg-[#0052CC] text-white z-10 scale-105'
                  : 'ring-white bg-[#36B37E] text-white hover:ring-[#4C9AFF]'
              }`}
            >
              AM
            </button>
          </div>

          <div className="h-4 w-[1px] bg-[#DFE1E6] mx-1" />

          {/* Quick Filter: "assignee = empty" (KEY REQUIREMENT FROM JIRA URL!) */}
          <button
            onClick={() => handleFilterChange('assignee = empty')}
            className={`px-2.5 py-1 rounded-[3px] text-xs font-semibold cursor-pointer border transition-all shadow-xs flex items-center gap-1.5 ${
              activeFilter === 'assignee = empty'
                ? 'bg-[#E9F2FF] text-[#0052CC] border-[#0052CC] font-bold ring-1 ring-[#0052CC]/30'
                : 'bg-white text-[#42526E] border-[#DFE1E6] hover:bg-[#EBECF0]'
            }`}
          >
            <span>assignee = empty</span>
            <span
              className={`text-[10px] px-1 py-0.2 rounded-full font-bold ${
                activeFilter === 'assignee = empty'
                  ? 'bg-[#0052CC] text-white'
                  : 'bg-[#EBECF0] text-[#6B778C]'
              }`}
            >
              {unassignedCount}
            </span>
          </button>

          {/* Quick Filter: "Only my issues" */}
          <button
            onClick={() => handleFilterChange('only_my_issues')}
            className={`px-2.5 py-1 rounded-[3px] text-xs font-semibold cursor-pointer border transition-all shadow-xs ${
              activeFilter === 'only_my_issues'
                ? 'bg-[#E9F2FF] text-[#0052CC] border-[#0052CC] font-bold ring-1 ring-[#0052CC]/30'
                : 'bg-white text-[#42526E] border-[#DFE1E6] hover:bg-[#EBECF0]'
            }`}
          >
            Only my issues
          </button>

          {/* Clear filters button (when any filter is active) */}
          {(activeFilter !== 'all' || boardSearch.trim()) && (
            <button
              onClick={() => {
                setActiveFilter('all');
                setBoardSearch('');
                updateUrlParams('all', activeGroupBy);
                if (showNotification) showNotification('Cleared all board filters');
              }}
              className="text-[#0052CC] hover:underline font-semibold text-xs ml-1 cursor-pointer flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* Right Controls: Group by dropdown */}
        <div className="flex items-center gap-2">
          {/* Group by Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowGroupByDropdown(!showGroupByDropdown)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#42526E] bg-white border border-[#DFE1E6] rounded-[3px] hover:bg-[#FAFBFC] cursor-pointer shadow-xs"
            >
              <Layers className="w-3 h-3 text-[#6B778C]" />
              <span>
                Group by: {activeGroupBy === 'none' ? 'None' : activeGroupBy.charAt(0).toUpperCase() + activeGroupBy.slice(1)}
              </span>
              <ChevronDown className="w-3 h-3 text-[#6B778C]" />
            </button>

            {showGroupByDropdown && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowGroupByDropdown(false)}
                />
                <div className="absolute right-0 top-8 w-44 bg-white border border-[#DFE1E6] rounded shadow-lg py-1 z-40 text-xs font-normal animate-fadeIn">
                  <div className="px-3 py-1 text-[11px] font-bold text-[#6B778C] uppercase tracking-wider">
                    Group by
                  </div>
                  <button
                    onClick={() => handleGroupByChange('none')}
                    className={`w-full text-left px-3 py-1.5 hover:bg-[#FAFBFC] flex items-center justify-between cursor-pointer ${
                      activeGroupBy === 'none' ? 'font-bold text-[#0052CC] bg-[#E9F2FF]/50' : 'text-[#172B4D]'
                    }`}
                  >
                    <span>None</span>
                    {activeGroupBy === 'none' && <Check className="w-3.5 h-3.5 text-[#0052CC]" />}
                  </button>
                  <button
                    onClick={() => handleGroupByChange('assignee')}
                    className={`w-full text-left px-3 py-1.5 hover:bg-[#FAFBFC] flex items-center justify-between cursor-pointer ${
                      activeGroupBy === 'assignee' ? 'font-bold text-[#0052CC] bg-[#E9F2FF]/50' : 'text-[#172B4D]'
                    }`}
                  >
                    <span>Assignee</span>
                    {activeGroupBy === 'assignee' && <Check className="w-3.5 h-3.5 text-[#0052CC]" />}
                  </button>
                  <button
                    onClick={() => handleGroupByChange('epic')}
                    className={`w-full text-left px-3 py-1.5 hover:bg-[#FAFBFC] flex items-center justify-between cursor-pointer ${
                      activeGroupBy === 'epic' ? 'font-bold text-[#0052CC] bg-[#E9F2FF]/50' : 'text-[#172B4D]'
                    }`}
                  >
                    <span>Epic</span>
                    {activeGroupBy === 'epic' && <Check className="w-3.5 h-3.5 text-[#0052CC]" />}
                  </button>
                </div>
              </>
            )}
          </div>
          {/* Live Real-time Collaborators & Redis Cache Badges */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Cache Engine status */}
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold border ${
                isFromCache
                  ? 'bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]'
                  : 'bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]'
              }`}
              title={isFromCache ? 'Serving from Redis/In-Memory Cache (Optimized)' : 'Serving from MongoDB Engine'}
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>{isFromCache ? 'Redis Cache Hit' : 'MongoDB Store'}</span>
            </div>

            {/* Socket Live Presence */}
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold bg-[#FAFBFC] border border-[#DFE1E6] text-[#42526E]"
              title={`${activeSocketUsers.length || 1} active collaborators connected to this board room`}
            >
              <span className="w-2 h-2 rounded-full bg-[#36B37E] animate-ping" />
              <span>{Math.max(1, activeSocketUsers.length)} live</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ACTIVE FILTER NOTIFICATION BANNER */}
      {/* ========================================================================= */}
      {activeFilter === 'assignee = empty' && (
        <div className="bg-[#DEEBFF] border border-[#B3D4FF] rounded-[4px] px-3 py-2 flex items-center justify-between text-xs text-[#0747A6] animate-fadeIn">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#0052CC] shrink-0" />
            <span>
              <strong>Quick filter active:</strong> <code>assignee = empty</code> — Showing {filteredCount} unassigned issue(s).
            </span>
          </div>
          <button
            onClick={() => handleFilterChange('all')}
            className="text-[#0052CC] font-bold hover:underline cursor-pointer text-xs"
          >
            Show all issues ({totalCount})
          </button>
        </div>
      )}

      {/* Inline Form to Add New Column */}
      {isAddingList && (
        <form
          onSubmit={handleCreateList}
          className="p-3 bg-white border border-[#4C9AFF] rounded-md shadow-sm flex items-center gap-2 max-w-sm animate-fadeIn"
        >
          <input
            type="text"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            placeholder="Column title (e.g. QA Testing)"
            className="flex-1 text-xs p-1.5 border border-[#DFE1E6] rounded focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1 bg-[#0052CC] hover:bg-[#0065FF] text-white text-xs font-semibold rounded cursor-pointer"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setIsAddingList(false)}
            className="p-1 text-[#6B778C] hover:text-[#172B4D] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 3.5 DASHBOARD ANALYTICS PANEL (Week 4 Essential: completed, pending, overdue) */}
      {/* ========================================================================= */}
      {showInsights && (
        <div className="bg-gradient-to-r from-slate-50 via-blue-50/40 to-indigo-50/30 border border-[#B3D4FF] rounded-lg p-4 shadow-sm space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#0052CC] text-white rounded">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                  Dashboard Analytics & Task Velocity
                </h3>
                <p className="text-[11px] text-[#5E6C84]">
                  Real-time metrics: completed, pending, and overdue tasks across all board swimlanes
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInsights(false)}
              className="text-[#6B778C] hover:text-[#172B4D] p-1 rounded hover:bg-white/80 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded border border-[#DFE1E6] shadow-xs">
              <span className="text-[11px] font-semibold text-[#6B778C] uppercase tracking-wider">Total Tasks</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-[#172B4D]">{totalCount}</span>
                <span className="text-[11px] text-[#5E6C84]">in board</span>
              </div>
              <div className="mt-2 text-[10px] text-[#6B778C]">
                {lists.length} active columns
              </div>
            </div>

            <div className="bg-white p-3 rounded border border-emerald-200 shadow-xs">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                <CheckSquare className="w-3 h-3 text-emerald-600" /> Completed
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-emerald-600">{completedCount}</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full">
                  {completionPercentage}%
                </span>
              </div>
              <div className="mt-2 w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-3 rounded border border-blue-200 shadow-xs">
              <span className="text-[11px] font-semibold text-[#0052CC] uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#0052CC]" /> Pending / In Progress
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-[#0052CC]">{pendingCount}</span>
                <span className="text-[11px] text-[#5E6C84]">active</span>
              </div>
              <div className="mt-2 text-[10px] text-[#6B778C]">
                {unassignedCount} unassigned
              </div>
            </div>

            <div className="bg-white p-3 rounded border border-rose-200 shadow-xs">
              <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-600" /> Overdue & Urgent
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-rose-600">{overdueCount}</span>
                <span className="text-[11px] text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.2 rounded">
                  {urgentCount} urgent
                </span>
              </div>
              <div className="mt-2 text-[10px] text-rose-600">
                {overdueCount > 0 ? `${overdueCount} task(s) past due date` : 'No overdue tasks'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. KANBAN BOARD CANVAS: COLUMNS OR SWIMLANES */}
      {/* ========================================================================= */}
      <DragDropContext onDragEnd={handleDragEnd}>
        {activeGroupBy === 'none' ? (
          /* STANDARD KANBAN COLUMNS VIEW */
          <div className="flex items-start gap-3.5 overflow-x-auto pb-6 pt-1">
            {lists.map((list) => {
              const listCards = (list.cardIds || [])
                .map((id) => cards[id])
                .filter(Boolean)
                .filter(filterCard);

              return (
                <div
                  key={list.id}
                  className="w-72 bg-[#F4F5F7] rounded-[4px] p-2.5 flex flex-col min-h-[460px] shadow-xs shrink-0 select-none transition-colors border border-transparent"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 px-1 text-xs font-semibold text-[#5E6C84] relative">
                    {editingListId === list.id ? (
                      <div className="flex items-center gap-1 w-full">
                        <input
                          type="text"
                          value={editingListTitle}
                          onChange={(e) => setEditingListTitle(e.target.value)}
                          onBlur={() => handleUpdateListTitle(list.id)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdateListTitle(list.id)}
                          className="text-xs p-1 bg-white border border-[#4C9AFF] rounded w-full font-semibold"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <span
                        onClick={() => {
                          setEditingListId(list.id);
                          setEditingListTitle(list.title);
                        }}
                        className="cursor-pointer hover:text-[#172B4D] flex items-center gap-1.5 uppercase tracking-wider text-[11px]"
                      >
                        <span>{list.title}</span>
                        <span className="font-bold text-[#6B778C] bg-white/80 px-1.5 py-0.2 rounded-full text-[11px] shadow-2xs">
                          {listCards.length}
                        </span>
                      </span>
                    )}

                    {/* Column Options Menu */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveListMenu(activeListMenu === list.id ? null : list.id)
                        }
                        className="p-1 rounded hover:bg-[#EBECF0] text-[#6B778C] hover:text-[#172B4D] cursor-pointer"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>

                      {activeListMenu === list.id && (
                        <div className="absolute right-0 top-6 w-36 bg-white border border-[#DFE1E6] rounded shadow-lg py-1 z-30 text-xs font-normal">
                          <button
                            onClick={() => {
                              setEditingListId(list.id);
                              setEditingListTitle(list.title);
                              setActiveListMenu(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-[#FAFBFC] flex items-center gap-2 text-[#172B4D] cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3 text-[#6B778C]" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={() => handleDeleteList(list.id)}
                            className="w-full text-left px-3 py-1.5 hover:bg-red-50 flex items-center gap-2 text-[#DE350B] cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3 text-[#DE350B]" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column Droppable Area */}
                  <Droppable droppableId={list.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 flex-1 min-h-[140px] rounded p-0.5 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-[#DEEBFF]/30' : ''
                        }`}
                      >
                        {listCards.map((card, index) => renderCardItem(card, index))}
                        {provided.placeholder}

                        {/* Inline Create Card Form */}
                        {addingToCol === list.id ? (
                          <div className="bg-white p-2.5 rounded-[3px] border border-[#4C9AFF] shadow-sm space-y-2">
                            <textarea
                              value={newCardTitle}
                              onChange={(e) => setNewCardTitle(e.target.value)}
                              placeholder="What needs to be done?"
                              className="w-full text-xs p-1 border-none focus:outline-none resize-none"
                              rows={2}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddCard(list.id);
                                }
                              }}
                            />
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setAddingToCol(null)}
                                className="px-2 py-1 text-[11px] text-[#5E6C84] hover:text-[#172B4D] cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleAddCard(list.id)}
                                className="px-2.5 py-1 bg-[#0052CC] hover:bg-[#0065FF] text-white text-[11px] font-semibold rounded-[3px] cursor-pointer shadow-xs"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAddingToCol(list.id)}
                            className="w-full py-2 border border-dashed border-[#C1C7D0] hover:border-[#0052CC] hover:bg-white/60 rounded-[3px] flex items-center justify-center text-[#6B778C] hover:text-[#0052CC] transition-colors cursor-pointer text-xs gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create issue</span>
                          </button>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        ) : (
          /* SWIMLANES VIEW (GROUP BY ASSIGNEE OR EPIC) */
          <div className="space-y-4 pb-6">
            {getSwimlanes().map((swimlane) => {
              const isCollapsed = collapsedSwimlanes[swimlane.id];
              const swimlaneCards = Object.values(cards).filter(swimlane.filterFn);
              const visibleSwimlaneCards = swimlaneCards.filter(filterCard);

              return (
                <div key={swimlane.id} className="border border-[#DFE1E6] rounded-lg bg-[#FAFBFC] overflow-hidden shadow-xs">
                  {/* Swimlane Header */}
                  <div
                    onClick={() =>
                      setCollapsedSwimlanes((prev) => ({
                        ...prev,
                        [swimlane.id]: !prev[swimlane.id],
                      }))
                    }
                    className="px-4 py-2.5 bg-white border-b border-[#DFE1E6] flex items-center justify-between cursor-pointer hover:bg-[#FAFBFC] select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-[#6B778C]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#6B778C]" />
                      )}
                      {swimlane.initials && (
                        <div className="w-5 h-5 rounded-full bg-[#0052CC] text-white font-bold text-[9px] flex items-center justify-center">
                          {swimlane.initials}
                        </div>
                      )}
                      <span className="font-bold text-sm text-[#172B4D]">
                        {swimlane.title}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${swimlane.badgeColor}`}>
                        {visibleSwimlaneCards.length} issues
                      </span>
                    </div>
                  </div>

                  {/* Swimlane Columns Content */}
                  {!isCollapsed && (
                    <div className="p-3 flex items-start gap-3.5 overflow-x-auto">
                      {lists.map((list) => {
                        const listCards = (list.cardIds || [])
                          .map((id) => cards[id])
                          .filter(Boolean)
                          .filter(swimlane.filterFn)
                          .filter(filterCard);

                        return (
                          <div
                            key={`${swimlane.id}_${list.id}`}
                            className="w-72 bg-[#F4F5F7] rounded p-2.5 flex flex-col min-h-[220px] shrink-0"
                          >
                            <div className="flex items-center justify-between pb-2 px-1 text-xs font-semibold text-[#5E6C84]">
                              <span className="uppercase text-[11px]">{list.title}</span>
                              <span className="bg-white px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                                {listCards.length}
                              </span>
                            </div>

                            <Droppable droppableId={`${swimlane.id}__${list.id}`}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className="space-y-2 flex-1"
                                >
                                  {listCards.map((card, index) => renderCardItem(card, index))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DragDropContext>
    </div>
  );
};

export default KanbanBoardEngine;
