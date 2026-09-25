/**
 * REST APIs for Workspaces, Boards, Lists, and Cards CRUD Operations
 * Connects to Node.js / Express backend with MongoDB persistence.
 * Includes local store synchronization for seamless offline and optimistic updates.
 */

import {
  INITIAL_WORKSPACE,
  INITIAL_BOARD,
  INITIAL_LISTS,
  INITIAL_CARDS,
  INITIAL_USER,
} from './dataModels';
import { emitCardUpdate } from './socket';

const DB_KEY = 'jira_kanban_store_v1';

// Get local cache
const getStore = () => {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse localStorage store:', e);
  }

  const initialStore = {
    user: INITIAL_USER,
    workspace: INITIAL_WORKSPACE,
    board: INITIAL_BOARD,
    lists: INITIAL_LISTS,
    cards: INITIAL_CARDS,
  };
  saveStore(initialStore);
  return initialStore;
};

const saveStore = (store) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to persist store:', e);
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('jira_auth_token_v1');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const kanbanApi = {
  /**
   * Reset store to initial seed data
   */
  async resetDatabase() {
    localStorage.removeItem(DB_KEY);
    return getStore();
  },

  // =========================================================================
  // WORKSPACE CRUD
  // =========================================================================

  async createWorkspace({ name, key, category, type, description, ownerId }) {
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, key, category, type, description, ownerId }),
      });
      if (res.ok) {
        const workspace = await res.json();
        const store = getStore();
        store.workspace = workspace;
        saveStore(store);
        return workspace;
      }
    } catch (e) {
      console.warn('[kanbanApi] Backend unavailable, using local fallback:', e.message);
    }

    // Local fallback
    const store = getStore();
    const newWorkspace = {
      id: `ws_${Date.now()}`,
      name: name.trim(),
      key: key ? key.trim().toUpperCase() : name.trim().substring(0, 3).toUpperCase(),
      category: category || 'Software',
      type: type || 'Team-managed',
      description: description || '',
      plan: 'Standard',
      createdAt: new Date().toISOString(),
      ownerId: ownerId || store.user?.id || 'usr_samarth_1',
      members: [
        {
          id: `mem_${Date.now()}`,
          name: store.user?.name || 'Owner',
          email: store.user?.email || 'owner@workspace.com',
          role: 'Admin',
          initials: store.user?.initials || 'OW',
          avatarColor: '#FF8B00',
          status: 'Active',
        },
      ],
    };
    store.workspace = newWorkspace;
    saveStore(store);
    return newWorkspace;
  },

  async getWorkspaces() {
    try {
      const res = await fetch('/api/workspaces', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) return data;
      }
    } catch (e) {
      console.warn('[kanbanApi] Backend unavailable for getWorkspaces:', e.message);
    }
    const store = getStore();
    return [store.workspace];
  },

  async getWorkspace(workspaceId) {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}`, { headers: getAuthHeaders() });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[kanbanApi] Backend unavailable for getWorkspace:', e.message);
    }
    const store = getStore();
    return store.workspace;
  },

  async inviteMember(workspaceId = 'ws_default_1', { email, role = 'Member' }) {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, role }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[kanbanApi] Backend inviteMember fallback:', e.message);
    }
    return {
      id: `mem_${Date.now()}`,
      name: email.split('@')[0],
      email,
      role,
      status: 'Active',
      joinedAt: new Date().toISOString(),
    };
  },

  async updateMemberRole(workspaceId = 'ws_default_1', memberId, role) {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[kanbanApi] Backend updateMemberRole fallback:', e.message);
    }
    return { success: true };
  },

  async removeMember(workspaceId = 'ws_default_1', memberId) {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[kanbanApi] Backend removeMember fallback:', e.message);
    }
    return { success: true };
  },

  // =========================================================================
  // BOARDS & FULL BOARD DATA
  // =========================================================================

  async getBoardData(boardId = 'board_kanban_1') {
    try {
      const res = await fetch(`/api/boards/${boardId}/full`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        // Update local cache
        const store = getStore();
        store.workspace = data.workspace || store.workspace;
        store.board = data.board || store.board;
        store.lists = data.lists || store.lists;
        store.cards = data.cards || store.cards;
        saveStore(store);
        return data;
      }
    } catch (e) {
      console.warn('[kanbanApi] Backend unavailable for getBoardData, loading local cache:', e.message);
    }

    const store = getStore();
    return {
      workspace: store.workspace,
      board: store.board,
      lists: store.lists,
      cards: store.cards,
    };
  },

  // =========================================================================
  // LISTS CRUD (Columns)
  // =========================================================================

  async createList(title) {
    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const newList = await res.json();
        const store = getStore();
        store.lists.push(newList);
        saveStore(store);
        return newList;
      }
    } catch (e) {
      console.warn('[kanbanApi] Backend unavailable for createList:', e.message);
    }

    const store = getStore();
    const newList = {
      id: `list_${Date.now()}`,
      boardId: store.board.id,
      title: title.trim(),
      order: store.lists.length,
      cardIds: [],
    };
    store.lists.push(newList);
    saveStore(store);
    return newList;
  },

  async updateList(listId, updates) {
    try {
      const res = await fetch(`/api/lists/${listId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        const store = getStore();
        const idx = store.lists.findIndex((l) => l.id === listId);
        if (idx !== -1) store.lists[idx] = updated;
        saveStore(store);
        return updated;
      }
    } catch (e) {
      console.warn('[kanbanApi] Backend unavailable for updateList:', e.message);
    }

    const store = getStore();
    const idx = store.lists.findIndex((l) => l.id === listId);
    if (idx !== -1) {
      store.lists[idx] = { ...store.lists[idx], ...updates };
      saveStore(store);
      return store.lists[idx];
    }
    return updates;
  },

  async deleteList(listId) {
    try {
      const res = await fetch(`/api/lists/${listId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const store = getStore();
        const target = store.lists.find((l) => l.id === listId);
        if (target) {
          target.cardIds.forEach((cid) => delete store.cards[cid]);
        }
        store.lists = store.lists.filter((l) => l.id !== listId);
        saveStore(store);
        return { success: true, deletedListId: listId };
      }
    } catch (e) {
      console.warn('[kanbanApi] Backend unavailable for deleteList:', e.message);
    }

    const store = getStore();
    const target = store.lists.find((l) => l.id === listId);
    if (target) {
      target.cardIds.forEach((cid) => delete store.cards[cid]);
    }
    store.lists = store.lists.filter((l) => l.id !== listId);
    saveStore(store);
    return { success: true, deletedListId: listId };
  },

  // =========================================================================
  // CARDS CRUD (Issues / Tasks)
  // =========================================================================

  async createCard(listId, cardInput) {
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ listId, ...cardInput }),
      });
      if (res.ok) {
        const createdCard = await res.json();
        const store = getStore();
        store.cards[createdCard.id] = createdCard;
        const list = store.lists.find((l) => l.id === listId);
        if (list && !list.cardIds.includes(createdCard.id)) {
          list.cardIds.push(createdCard.id);
        }
        saveStore(store);
        return createdCard;
      }
    } catch (e) {
      console.warn('[kanbanApi] Backend unavailable for createCard:', e.message);
    }

    // Local fallback
    const store = getStore();
    const listIndex = store.lists.findIndex((l) => l.id === listId);
    const nextNumber = Object.keys(store.cards).length + 1;
    const cardId = `KAN-${nextNumber}`;
    const targetList = listIndex !== -1 ? store.lists[listIndex] : { title: 'To Do', cardIds: [] };

    const newCard = {
      id: cardId,
      key: cardId,
      listId,
      title: cardInput.title || 'Untitled Task',
      description: cardInput.description || '',
      status: targetList.title,
      iconType: cardInput.iconType || (listId === 'list_todo' ? 'check' : 'story'),
      dueDate: cardInput.dueDate || 'Oct 20, 2026',
      startDate: cardInput.startDate || '',
      priority: cardInput.priority || 'None',
      parent: cardInput.parent || '',
      team: cardInput.team || '',
      labels: cardInput.labels || [],
      assignedTo: cardInput.assignedTo || null,
      reporter: cardInput.reporter || {
        name: store.user.name,
        initials: store.user.initials,
      },
      subtasks: cardInput.subtasks || [],
      attachments: cardInput.attachments || [],
      comments: cardInput.comments || [],
      watchers: 1,
      order: targetList.cardIds.length,
      createdAt: new Date().toISOString(),
    };

    store.cards[cardId] = newCard;
    if (listIndex !== -1) store.lists[listIndex].cardIds.push(cardId);
    saveStore(store);
    return newCard;
  },

  async getCard(cardId) {
    try {
      const res = await fetch(`/api/cards/${cardId}`, { headers: getAuthHeaders() });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[kanbanApi] Backend unavailable for getCard:', e.message);
    }
    const store = getStore();
    return store.cards[cardId];
  },

  async updateCard(cardId, updates) {
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        const store = getStore();
        store.cards[cardId] = updated;
        saveStore(store);
        emitCardUpdate(updated);
        return updated;
      }
    } catch (e) {
      console.warn('[kanbanApi] Backend unavailable for updateCard:', e.message);
    }

    const store = getStore();
    if (store.cards[cardId]) {
      store.cards[cardId] = {
        ...store.cards[cardId],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveStore(store);
      return store.cards[cardId];
    }
    return updates;
  },

  async deleteCard(cardId) {
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const store = getStore();
        const card = store.cards[cardId];
        if (card) {
          const list = store.lists.find((l) => l.id === card.listId);
          if (list) list.cardIds = list.cardIds.filter((id) => id !== cardId);
        }
        delete store.cards[cardId];
        saveStore(store);
        return { success: true, deletedCardId: cardId };
      }
    } catch (e) {
      console.warn('[kanbanApi] Backend unavailable for deleteCard:', e.message);
    }

    const store = getStore();
    const card = store.cards[cardId];
    if (card) {
      const list = store.lists.find((l) => l.id === card.listId);
      if (list) list.cardIds = list.cardIds.filter((id) => id !== cardId);
    }
    delete store.cards[cardId];
    saveStore(store);
    return { success: true, deletedCardId: cardId };
  },

  // =========================================================================
  // DRAG & DROP REORDER
  // =========================================================================

  async moveCard({
    cardId,
    sourceListId,
    destinationListId,
    sourceIndex,
    destinationIndex,
  }) {
    try {
      const res = await fetch('/api/cards/reorder', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          cardId,
          sourceListId,
          destinationListId,
          sourceIndex,
          destinationIndex,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const store = getStore();
        if (store.cards[cardId]) {
          store.cards[cardId].listId = destinationListId;
          store.cards[cardId].status = data.destinationList?.title || store.cards[cardId].status;
        }
        saveStore(store);
        return data;
      }
    } catch (e) {
      console.warn('[kanbanApi] Backend unavailable for moveCard:', e.message);
    }

    // Local fallback
    const store = getStore();
    const card = store.cards[cardId];
    const sourceList = store.lists.find((l) => l.id === sourceListId);
    const destinationList = store.lists.find((l) => l.id === destinationListId);

    if (sourceList && destinationList && card) {
      sourceList.cardIds.splice(sourceIndex, 1);
      destinationList.cardIds.splice(destinationIndex, 0, cardId);
      card.listId = destinationListId;
      card.status = destinationList.title;
      saveStore(store);
    }

    return { success: true, card, sourceList, destinationList };
  },

  // =========================================================================
  // WORKSPACE SETTINGS & MEMBERS
  // =========================================================================

  async updateWorkspace(workspaceId, updates) {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        const store = getStore();
        store.workspace = { ...store.workspace, ...updated };
        saveStore(store);
        return updated;
      }
    } catch (e) {
      console.warn('[kanbanApi] Backend unavailable for updateWorkspace:', e.message);
    }

    const store = getStore();
    store.workspace = { ...store.workspace, ...updates };
    saveStore(store);
    return store.workspace;
  },

  async inviteMember(workspaceId, { email, role = 'Member' }) {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, role }),
      });
      if (res.ok) {
        const newMember = await res.json();
        const store = getStore();
        store.workspace.members.push(newMember);
        saveStore(store);
        return newMember;
      }
    } catch (e) {
      console.warn('[kanbanApi] Backend unavailable for inviteMember:', e.message);
    }

    // Local fallback
    const store = getStore();
    const name = email.split('@')[0].replace(/[._]/g, ' ');
    const newMember = {
      id: `mem_${Date.now()}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: email.trim(),
      role,
      initials: name.substring(0, 2).toUpperCase() || 'US',
      avatarColor: ['#0052CC', '#36B37E', '#FF8B00', '#6554C0'][store.workspace.members.length % 4],
      status: 'Active',
      joinedAt: new Date().toISOString(),
    };
    store.workspace.members.push(newMember);
    saveStore(store);
    return newMember;
  },

  async removeMember(workspaceId, memberId) {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const store = getStore();
        store.workspace.members = store.workspace.members.filter((m) => m.id !== memberId);
        saveStore(store);
        return { success: true, removedMemberId: memberId };
      }
    } catch (e) {
      console.warn('[kanbanApi] Backend unavailable for removeMember:', e.message);
    }

    const store = getStore();
    store.workspace.members = store.workspace.members.filter((m) => m.id !== memberId);
    saveStore(store);
    return { success: true, removedMemberId: memberId };
  },

  // =========================================================================
  // TASK SEARCH ENGINE (Week 4 Day 1-2 & Redis Optimization)
  // =========================================================================
  async searchCards(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.q) queryParams.set('q', params.q);
      if (params.status && params.status !== 'all') queryParams.set('status', params.status);
      if (params.priority && params.priority !== 'all') queryParams.set('priority', params.priority);
      if (params.assignee && params.assignee !== 'all') queryParams.set('assignee', params.assignee);
      if (params.label && params.label !== 'all') queryParams.set('label', params.label);
      if (params.limit) queryParams.set('limit', params.limit);

      const res = await fetch(`/api/cards/search?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[kanbanApi] Backend search failed, falling back to local search:', e.message);
    }

    // Fallback in-memory search over local store
    const store = getStore();
    const allCards = Object.values(store.cards || {});
    const q = (params.q || '').toLowerCase().trim();

    const filtered = allCards.filter((card) => {
      const matchesQ =
        !q ||
        card.key.toLowerCase().includes(q) ||
        card.title.toLowerCase().includes(q) ||
        (card.description && card.description.toLowerCase().includes(q)) ||
        (card.assignedTo?.name && card.assignedTo.name.toLowerCase().includes(q));

      const matchesStatus = !params.status || params.status === 'all' || card.status === params.status;
      const matchesPriority = !params.priority || params.priority === 'all' || card.priority === params.priority;

      return matchesQ && matchesStatus && matchesPriority;
    });

    return {
      query: params.q,
      totalMatches: filtered.length,
      count: filtered.length,
      cards: filtered,
      _fromCache: false,
    };
  },

  // =========================================================================
  // CARD COMMENTS (Week 3 Day 6-7)
  // =========================================================================
  async addCardComment(cardId, commentData) {
    try {
      const res = await fetch(`/api/cards/${cardId}/comments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(commentData),
      });
      if (res.ok) {
        const data = await res.json();
        // Update local store
        const store = getStore();
        if (store.cards[cardId]) {
          store.cards[cardId].comments = data.card.comments;
          saveStore(store);
        }
        return data;
      }
    } catch (e) {
      console.warn('[kanbanApi] Comment backend API error, saving locally:', e.message);
    }

    // Local fallback
    const store = getStore();
    if (store.cards[cardId]) {
      const newComment = {
        id: Date.now(),
        author: commentData.author || 'Samarth Choudhary',
        initials: commentData.initials || 'SC',
        time: 'Just now',
        text: commentData.text,
      };
      if (!store.cards[cardId].comments) store.cards[cardId].comments = [];
      store.cards[cardId].comments.push(newComment);
      saveStore(store);
      return { success: true, comment: newComment, card: store.cards[cardId] };
    }
    return null;
  },

  async deleteCardComment(cardId, commentId) {
    try {
      const res = await fetch(`/api/cards/${cardId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const store = getStore();
        if (store.cards[cardId]) {
          store.cards[cardId].comments = data.card.comments;
          saveStore(store);
        }
        return data;
      }
    } catch (e) {
      console.warn('[kanbanApi] Delete comment error:', e.message);
    }

    const store = getStore();
    if (store.cards[cardId] && store.cards[cardId].comments) {
      store.cards[cardId].comments = store.cards[cardId].comments.filter((c) => c.id !== commentId);
      saveStore(store);
    }
    return { success: true };
  },

  // =========================================================================
  // NOTIFICATIONS (Week 4 Day 1-2)
  // =========================================================================
  async getNotifications(unreadOnly = false) {
    try {
      const res = await fetch(`/api/notifications${unreadOnly ? '?unread=true' : ''}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[kanbanApi] Failed to fetch notifications:', e.message);
    }
    return { notifications: [], unreadCount: 0 };
  },

  async markNotificationRead(id) {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[kanbanApi] Failed to mark notification read:', e.message);
    }
    return null;
  },

  async markAllNotificationsRead() {
    try {
      const res = await fetch(`/api/notifications/read-all`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[kanbanApi] Failed to mark all notifications read:', e.message);
    }
    return { success: true };
  },

  // =========================================================================
  // CACHE & PERFORMANCE METRICS (Week 4 Day 3-7)
  // =========================================================================
  async getCacheStats() {
    try {
      const res = await fetch(`/api/cache/stats`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[kanbanApi] Failed to fetch cache stats:', e.message);
    }
    return null;
  },

  async getSystemMetrics() {
    try {
      const res = await fetch(`/api/system/metrics`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[kanbanApi] Failed to fetch system metrics:', e.message);
    }
    return null;
  },
};

export default kanbanApi;
