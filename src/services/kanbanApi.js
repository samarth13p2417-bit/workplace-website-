/**
 * Week 2: Day 1-3 - REST APIs for Lists and Cards CRUD Operations
 * Client-side REST Service with LocalStorage persistence and asynchronous promises.
 * Includes optimistic update snapshotting and rollback support (Week 2: Day 7).
 */

import {
  INITIAL_WORKSPACE,
  INITIAL_BOARD,
  INITIAL_LISTS,
  INITIAL_CARDS,
  INITIAL_USER,
} from './dataModels';

const DB_KEY = 'jira_kanban_store_v1';

// Helper to get database from storage or initialize
const getStore = () => {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
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

// Helper to save store
const saveStore = (store) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to persist store:', e);
  }
};

// Artificial network delay simulator
const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export const kanbanApi = {
  /**
   * Reset store to initial seed data
   */
  async resetDatabase() {
    await delay(100);
    localStorage.removeItem(DB_KEY);
    return getStore();
  },

  // =========================================================================
  // WORKSPACE CRUD (Week 1: Day 3-5)
  // =========================================================================

  /**
   * POST /api/workspaces
   * Create a new workspace
   */
  async createWorkspace({ name, key, category, type, description, ownerId }) {
    await delay(200);
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

    // Update the active workspace in the store
    store.workspace = newWorkspace;
    saveStore(store);
    return newWorkspace;
  },

  /**
   * GET /api/workspaces
   * List all workspaces (returns the current workspace for client-side simulation)
   */
  async getWorkspaces() {
    await delay(100);
    const store = getStore();
    return [store.workspace];
  },

  /**
   * GET /api/workspaces/:id
   * Fetch a single workspace by ID
   */
  async getWorkspace(workspaceId) {
    await delay(80);
    const store = getStore();
    if (store.workspace.id === workspaceId || !workspaceId) {
      return store.workspace;
    }
    throw new Error(`Workspace not found: ${workspaceId}`);
  },

  /**
   * GET /api/boards/:id/full
   * Fetches the board, its ordered lists, and populated cards
   */
  async getBoardData(boardId = 'board_kanban_1') {
    await delay(120);
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

  /**
   * POST /api/lists
   * Create a new column/list
   */
  async createList(title) {
    await delay(150);
    const store = getStore();
    const newListId = `list_${Date.now()}`;
    const newList = {
      id: newListId,
      boardId: store.board.id,
      title: title.trim(),
      order: store.lists.length,
      cardIds: [],
    };

    store.lists.push(newList);
    saveStore(store);
    return newList;
  },

  /**
   * PUT /api/lists/:id
   * Update column title or order
   */
  async updateList(listId, updates) {
    await delay(120);
    const store = getStore();
    const index = store.lists.findIndex((l) => l.id === listId);
    if (index === -1) throw new Error(`List not found: ${listId}`);

    store.lists[index] = { ...store.lists[index], ...updates };
    saveStore(store);
    return store.lists[index];
  },

  /**
   * DELETE /api/lists/:id
   * Delete column and its cards
   */
  async deleteList(listId) {
    await delay(150);
    const store = getStore();
    const targetList = store.lists.find((l) => l.id === listId);
    if (!targetList) throw new Error(`List not found: ${listId}`);

    // Remove cards belonging to this list
    targetList.cardIds.forEach((cardId) => {
      delete store.cards[cardId];
    });

    // Remove the list
    store.lists = store.lists.filter((l) => l.id !== listId);
    saveStore(store);
    return { success: true, deletedListId: listId };
  },

  // =========================================================================
  // CARDS CRUD (Issues / Tasks)
  // =========================================================================

  /**
   * POST /api/cards
   * Create a new card in a list
   */
  async createCard(listId, cardInput) {
    await delay(150);
    const store = getStore();
    const listIndex = store.lists.findIndex((l) => l.id === listId);
    if (listIndex === -1) throw new Error(`List not found: ${listId}`);

    const nextNumber = Object.keys(store.cards).length + 1;
    const cardId = `KAN-${nextNumber}`;
    const targetList = store.lists[listIndex];

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
    targetList.cardIds.push(cardId);
    saveStore(store);

    return newCard;
  },

  /**
   * GET /api/cards/:id
   * Fetch single card details
   */
  async getCard(cardId) {
    await delay(80);
    const store = getStore();
    const card = store.cards[cardId];
    if (!card) throw new Error(`Card not found: ${cardId}`);
    return card;
  },

  /**
   * PUT /api/cards/:id
   * Update card details (title, description, status, priority, etc.)
   */
  async updateCard(cardId, updates) {
    await delay(120);
    const store = getStore();
    if (!store.cards[cardId]) throw new Error(`Card not found: ${cardId}`);

    store.cards[cardId] = {
      ...store.cards[cardId],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    saveStore(store);
    return store.cards[cardId];
  },

  /**
   * DELETE /api/cards/:id
   * Delete card
   */
  async deleteCard(cardId) {
    await delay(120);
    const store = getStore();
    const card = store.cards[cardId];
    if (!card) throw new Error(`Card not found: ${cardId}`);

    // Remove from its list's cardIds
    const list = store.lists.find((l) => l.id === card.listId);
    if (list) {
      list.cardIds = list.cardIds.filter((id) => id !== cardId);
    }

    delete store.cards[cardId];
    saveStore(store);
    return { success: true, deletedCardId: cardId };
  },

  // =========================================================================
  // DRAG & DROP REORDER (Week 2: Day 4-6)
  // =========================================================================

  /**
   * POST /api/cards/reorder
   * Move card within same list or across lists
   */
  async moveCard({
    cardId,
    sourceListId,
    destinationListId,
    sourceIndex,
    destinationIndex,
  }) {
    await delay(100);
    const store = getStore();
    const card = store.cards[cardId];
    if (!card) throw new Error(`Card not found: ${cardId}`);

    const sourceList = store.lists.find((l) => l.id === sourceListId);
    const destinationList = store.lists.find((l) => l.id === destinationListId);

    if (!sourceList || !destinationList) {
      throw new Error('Source or destination list not found');
    }

    // Remove from source list
    sourceList.cardIds.splice(sourceIndex, 1);

    // Insert into destination list
    destinationList.cardIds.splice(destinationIndex, 0, cardId);

    // Update card's listId and status
    card.listId = destinationListId;
    card.status = destinationList.title;

    saveStore(store);

    return {
      success: true,
      card,
      sourceList,
      destinationList,
    };
  },

  // =========================================================================
  // WORKSPACE SETTINGS & MEMBERS (Week 1: Day 3-5, 6-7)
  // =========================================================================

  /**
   * PUT /api/workspaces/:id
   * Update workspace settings
   */
  async updateWorkspace(workspaceId, updates) {
    await delay(150);
    const store = getStore();
    store.workspace = { ...store.workspace, ...updates };
    saveStore(store);
    return store.workspace;
  },

  /**
   * POST /api/workspaces/:id/members
   * Invite new workspace member
   */
  async inviteMember(workspaceId, { email, role = 'Member' }) {
    await delay(200);
    const store = getStore();
    const existing = store.workspace.members.find(
      (m) => m.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      throw new Error(`Member with email ${email} is already in this workspace.`);
    }

    const name = email.split('@')[0].replace(/[._]/g, ' ');
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newMember = {
      id: `mem_${Date.now()}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: email.trim(),
      role,
      initials: initials || 'US',
      avatarColor: ['#0052CC', '#36B37E', '#FF8B00', '#6554C0', '#00C7E6'][
        store.workspace.members.length % 5
      ],
      status: 'Active',
      joinedAt: new Date().toISOString(),
    };

    store.workspace.members.push(newMember);
    saveStore(store);
    return newMember;
  },

  /**
   * DELETE /api/workspaces/:id/members/:memberId
   */
  async removeMember(workspaceId, memberId) {
    await delay(150);
    const store = getStore();
    store.workspace.members = store.workspace.members.filter(
      (m) => m.id !== memberId
    );
    saveStore(store);
    return { success: true, removedMemberId: memberId };
  },
};

export default kanbanApi;
