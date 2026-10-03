import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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
  X
} from 'lucide-react';
import kanbanApi from '../services/kanbanApi';

export const KanbanBoardEngine = ({
  workspace,
  user,
  onSelectCard,
  showNotification,
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

  // Week 2: Day 7 - Optimistic State & Sync Status
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'saving', 'error'
  const stateSnapshotRef = useRef({ lists: [], cards: {} });

  const userInitials = user?.initials || (user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'SC');

  // Load initial board data from API
  useEffect(() => {
    loadBoardData();
  }, []);

  const loadBoardData = async () => {
    try {
      setIsLoading(true);
      const data = await kanbanApi.getBoardData();
      setLists(data.lists);
      setCards(data.cards);
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
  // WEEK 2: DAY 4-6 - DRAG AND DROP HANDLER
  // =========================================================================
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside or no movement
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    takeSnapshot();
    setSyncStatus('saving');

    const sourceList = lists.find((l) => l.id === source.droppableId);
    const destList = lists.find((l) => l.id === destination.droppableId);
    if (!sourceList || !destList) return;

    // 1. OPTIMISTIC UPDATE: Update local state instantly
    let newLists = [...lists];

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same column
      const newCardIds = Array.from(sourceList.cardIds);
      newCardIds.splice(source.index, 1);
      newCardIds.splice(destination.index, 0, draggableId);

      newLists = newLists.map((l) =>
        l.id === sourceList.id ? { ...l, cardIds: newCardIds } : l
      );

      setLists(newLists);
    } else {
      // Moving across different columns
      const sourceCardIds = Array.from(sourceList.cardIds);
      sourceCardIds.splice(source.index, 1);

      const destCardIds = Array.from(destList.cardIds);
      destCardIds.splice(destination.index, 0, draggableId);

      newLists = newLists.map((l) => {
        if (l.id === sourceList.id) return { ...l, cardIds: sourceCardIds };
        if (l.id === destList.id) return { ...l, cardIds: destCardIds };
        return l;
      });

      // Update card's status and listId optimistically
      const updatedCard = {
        ...cards[draggableId],
        listId: destList.id,
        status: destList.title,
      };

      setLists(newLists);
      setCards((prev) => ({ ...prev, [draggableId]: updatedCard }));
    }

    // 2. ASYNC SERVER CONFIRMATION
    try {
      await kanbanApi.moveCard({
        cardId: draggableId,
        sourceListId: source.droppableId,
        destinationListId: destination.droppableId,
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
  // WEEK 2: DAY 1-3 - CARDS CRUD OPERATIONS
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
        assignedTo: null,
      });

      // Update state with created card
      setCards((prev) => ({ ...prev, [createdCard.id]: createdCard }));
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId ? { ...l, cardIds: [...l.cardIds, createdCard.id] } : l
        )
      );

      setSyncStatus('synced');
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
  // WEEK 2: DAY 1-3 - LISTS CRUD OPERATIONS
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

  return (
    <div className="space-y-4">
      {/* Board Search, Filters, and Optimistic Sync Status */}
      <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
        {/* Left Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B778C]" />
            <input
              type="text"
              value={boardSearch}
              onChange={(e) => setBoardSearch(e.target.value)}
              placeholder="Search board"
              className="pl-8 pr-3 py-1 text-xs bg-white border border-[#DFE1E6] rounded-[3px] focus:border-[#4C9AFF] focus:ring-1 focus:ring-[#4C9AFF] w-44"
            />
          </div>

          {/* User avatar filter icon */}
          <div className="w-6 h-6 rounded-full bg-[#FF8B00] text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-transparent hover:ring-blue-400 cursor-pointer">
            {userInitials}
          </div>

          {/* Filter button */}
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#42526E] bg-white border border-[#DFE1E6] rounded-[3px] hover:bg-[#FAFBFC] cursor-pointer shadow-xs">
            <Filter className="w-3 h-3 text-[#6B778C]" />
            <span>Filter</span>
          </button>

          {/* Group button */}
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#42526E] bg-white border border-[#DFE1E6] rounded-[3px] hover:bg-[#FAFBFC] cursor-pointer shadow-xs">
            <Layers className="w-3 h-3 text-[#6B778C]" />
            <span>Group</span>
          </button>
        </div>

        {/* Right Controls: Sync State Indicator + Add Column Button */}
        <div className="flex items-center gap-3">
          {/* Week 2: Day 7 - Optimistic Sync Status Badge */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded border border-[#DFE1E6] bg-white shadow-xs">
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

      {/* Add New Column Inline Form */}
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

      {/* ===================================================================== */}
      {/* DRAG AND DROP CONTEXT (REACT BEAUTIFUL DND) */}
      {/* ===================================================================== */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex items-start gap-3.5 overflow-x-auto pb-4 pt-1">
          {lists.map((list) => {
            const listCards = list.cardIds
              .map((id) => cards[id])
              .filter(Boolean)
              .filter((c) =>
                c.title.toLowerCase().includes(boardSearch.toLowerCase())
              );

            return (
              <div
                key={list.id}
                className="w-72 bg-[#F4F5F7] rounded-[4px] p-2.5 flex flex-col min-h-[420px] shadow-xs shrink-0 select-none transition-colors border border-transparent"
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
                      className="cursor-pointer hover:text-[#172B4D] flex items-center gap-1.5"
                    >
                      <span>{list.title}</span>
                      <span className="font-normal text-[#6B778C] bg-white/70 px-1.5 py-0.2 rounded-full text-[11px]">
                        {listCards.length}
                      </span>
                    </span>
                  )}

                  {/* Column More Actions Dropdown */}
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
                          className="w-full text-left px-3 py-1.5 hover:bg-[#FAFBFC] flex items-center gap-2 text-[#172B4D]"
                        >
                          <Edit2 className="w-3 h-3 text-[#6B778C]" />
                          <span>Rename</span>
                        </button>
                        <button
                          onClick={() => handleDeleteList(list.id)}
                          className="w-full text-left px-3 py-1.5 hover:bg-red-50 flex items-center gap-2 text-[#DE350B]"
                        >
                          <Trash2 className="w-3 h-3 text-[#DE350B]" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* DROPPABLE LIST COLUMN */}
                <Droppable droppableId={list.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2 flex-1 min-h-[120px] rounded p-0.5 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-[#DEEBFF]/30' : ''
                      }`}
                    >
                      {listCards.map((card, index) => (
                        <Draggable
                          key={card.id}
                          draggableId={card.id}
                          index={index}
                        >
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              onClick={() => onSelectCard(card)}
                              className={`bg-white p-3 rounded-[3px] border transition-all cursor-pointer space-y-2 group select-none ${
                                dragSnapshot.isDragging
                                  ? 'shadow-2xl border-[#0052CC] ring-2 ring-[#0052CC]/30 rotate-1'
                                  : 'shadow-[0_1px_2px_rgba(9,30,66,0.2)] hover:shadow-md border-[#DFE1E6]/70 hover:border-[#0052CC]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <p className="text-[13px] font-medium text-[#172B4D] group-hover:text-[#0052CC] leading-snug">
                                  {card.title}
                                </p>
                              </div>

                              {card.dueDate && (
                                <p className="text-[11px] text-[#6B778C]">
                                  {card.dueDate}
                                </p>
                              )}

                              <div className="flex items-center justify-between pt-1 border-t border-[#F4F5F7]">
                                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5E6C84]">
                                  {card.iconType === 'check' ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-[#0052CC]" />
                                  ) : (
                                    <Bookmark className="w-3.5 h-3.5 text-[#36B37E]" />
                                  )}
                                  <span>{card.id}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                  {card.assignedTo ? (
                                    <div className="w-5 h-5 rounded-full bg-[#FF8B00] text-white flex items-center justify-center text-[10px] font-bold">
                                      {card.assignedTo.initials || 'SC'}
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-[#EBECF0] text-[#6B778C] flex items-center justify-center text-[10px]">
                                      <User className="w-3 h-3 text-[#6B778C]" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* Add Card Inline Form */}
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
      </DragDropContext>
    </div>
  );
};

export default KanbanBoardEngine;
