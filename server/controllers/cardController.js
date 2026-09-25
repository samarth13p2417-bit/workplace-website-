import Card from '../models/Card.js';
import List from '../models/List.js';
import { getCache, setCache, delCachePattern } from '../config/redis.js';
import { createNotificationHelper } from './notificationController.js';
import { broadcastToBoard } from '../sockets/socketHandler.js';

export const createCard = async (req, res, next) => {
  try {
    const { listId, ...cardInput } = req.body;

    if (!listId) {
      return res.status(400).json({ message: 'listId is required to create a card' });
    }

    const list = await List.findOne({ id: listId });
    if (!list) {
      return res.status(404).json({ message: `List not found: ${listId}` });
    }

    const totalCount = await Card.countDocuments();
    const cardId = `KAN-${totalCount + 1}`;

    const newCard = await Card.create({
      id: cardId,
      key: cardId,
      listId,
      title: cardInput.title || 'Untitled Task',
      description: cardInput.description || '',
      status: list.title,
      iconType: cardInput.iconType || (listId.includes('todo') ? 'check' : 'story'),
      dueDate: cardInput.dueDate || 'Oct 20, 2026',
      startDate: cardInput.startDate || '',
      priority: cardInput.priority || 'None',
      parent: cardInput.parent || '',
      team: cardInput.team || '',
      labels: cardInput.labels || [],
      assignedTo: cardInput.assignedTo || null,
      reporter: cardInput.reporter || {
        name: req.user?.name || 'Workspace User',
        initials: (req.user?.name || 'WU').substring(0, 2).toUpperCase(),
      },
      subtasks: cardInput.subtasks || [],
      attachments: cardInput.attachments || [],
      comments: cardInput.comments || [],
      watchers: 1,
      order: list.cardIds.length,
    });

    list.cardIds.push(cardId);
    await list.save();

    // Invalidate Redis query & search caches
    await delCachePattern('board:');
    await delCachePattern('search:');

    // Broadcast card creation to board
    broadcastToBoard('board_kanban_1', 'card:created', newCard);

    // Notify if assigned to someone
    if (newCard.assignedTo?.email) {
      createNotificationHelper({
        recipientEmail: newCard.assignedTo.email,
        sender: {
          name: req.user?.name || 'Teammate',
          initials: (req.user?.name || 'TM').substring(0, 2).toUpperCase(),
          email: req.user?.email || '',
        },
        type: 'assigned',
        title: 'New Task Assigned',
        message: `You were assigned to ${cardId}: "${newCard.title}"`,
        cardId: newCard.id,
        cardKey: newCard.key,
      });
    }

    return res.status(201).json(newCard);
  } catch (error) {
    next(error);
  }
};

export const getCardById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const card = await Card.findOne({ id });

    if (!card) {
      return res.status(404).json({ message: `Card not found: ${id}` });
    }

    return res.json(card);
  } catch (error) {
    next(error);
  }
};

export const updateCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const oldCard = await Card.findOne({ id });
    if (!oldCard) {
      return res.status(404).json({ message: `Card not found: ${id}` });
    }

    const card = await Card.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    );

    // Invalidate Redis query cache
    await delCachePattern('board:');
    await delCachePattern('search:');

    // Broadcast update
    broadcastToBoard('board_kanban_1', 'card:updated', card);

    // Check if assignee changed
    if (
      updates.assignedTo?.email &&
      updates.assignedTo.email !== oldCard.assignedTo?.email
    ) {
      createNotificationHelper({
        recipientEmail: updates.assignedTo.email,
        sender: {
          name: req.user?.name || 'Workspace User',
          initials: (req.user?.name || 'WU').substring(0, 2).toUpperCase(),
          email: req.user?.email || '',
        },
        type: 'assigned',
        title: 'Task Assigned To You',
        message: `You were assigned to ${card.key}: "${card.title}"`,
        cardId: card.id,
        cardKey: card.key,
      });
    }

    return res.json(card);
  } catch (error) {
    next(error);
  }
};

export const deleteCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const card = await Card.findOne({ id });

    if (!card) {
      return res.status(404).json({ message: `Card not found: ${id}` });
    }

    // Remove card ID from list's cardIds array
    const list = await List.findOne({ id: card.listId });
    if (list) {
      list.cardIds = list.cardIds.filter((cid) => cid !== id);
      await list.save();
    }

    await Card.deleteOne({ id });

    // Invalidate Redis query cache
    await delCachePattern('board:');
    await delCachePattern('search:');

    // Broadcast deletion
    broadcastToBoard('board_kanban_1', 'card:deleted', id);

    return res.json({ success: true, deletedCardId: id });
  } catch (error) {
    next(error);
  }
};

export const moveCard = async (req, res, next) => {
  try {
    const {
      cardId,
      sourceListId,
      destinationListId,
      sourceIndex,
      destinationIndex,
    } = req.body;

    const card = await Card.findOne({ id: cardId });
    if (!card) {
      return res.status(404).json({ message: `Card not found: ${cardId}` });
    }

    const sourceList = await List.findOne({ id: sourceListId });
    const destList = sourceListId === destinationListId ? sourceList : await List.findOne({ id: destinationListId });

    if (!sourceList || !destList) {
      return res.status(404).json({ message: 'Source or destination list not found' });
    }

    // Remove from source list
    sourceList.cardIds = sourceList.cardIds.filter((cid) => cid !== cardId);

    // Insert into destination list
    destList.cardIds.splice(destinationIndex, 0, cardId);

    // Update card reference and status
    const previousStatus = card.status;
    card.listId = destinationListId;
    card.status = destList.title;

    await sourceList.save();
    if (sourceListId !== destinationListId) {
      await destList.save();
    }
    await card.save();

    // Invalidate Redis query cache
    await delCachePattern('board:');
    await delCachePattern('search:');

    // Broadcast card move to board
    broadcastToBoard('board_kanban_1', 'card:moved', {
      cardId,
      sourceListId,
      destinationListId,
      sourceIndex,
      destinationIndex,
    });

    // Notify assignee if status changed
    if (card.assignedTo?.email && previousStatus !== card.status) {
      createNotificationHelper({
        recipientEmail: card.assignedTo.email,
        sender: {
          name: req.user?.name || 'Workspace User',
          initials: (req.user?.name || 'WU').substring(0, 2).toUpperCase(),
          email: req.user?.email || '',
        },
        type: 'status_change',
        title: 'Task Status Updated',
        message: `${card.key} moved from "${previousStatus}" to "${card.status}"`,
        cardId: card.id,
        cardKey: card.key,
      });
    }

    return res.json({
      success: true,
      card,
      sourceList,
      destinationList: destList,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// REAL-TIME COMMENTS (Week 3 Day 6-7)
// =========================================================================

export const addCardComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text, author, initials } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const card = await Card.findOne({ id });
    if (!card) {
      return res.status(404).json({ message: `Card not found: ${id}` });
    }

    const commentAuthor = author || req.user?.name || 'Workspace User';
    const commentInitials =
      initials ||
      (req.user?.name
        ? req.user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
        : 'WU');

    const newComment = {
      id: Date.now(),
      author: commentAuthor,
      initials: commentInitials,
      time: 'Just now',
      text: text.trim(),
    };

    card.comments.push(newComment);
    await card.save();

    // Invalidate caches
    await delCachePattern('board:');

    // Broadcast new comment to board & card room
    broadcastToBoard('board_kanban_1', 'card:comment:added', {
      cardId: card.id,
      comment: newComment,
    });

    // Notify card assignee if assignee is not the commenter
    if (card.assignedTo?.email && card.assignedTo.name !== commentAuthor) {
      createNotificationHelper({
        recipientEmail: card.assignedTo.email,
        sender: {
          name: commentAuthor,
          initials: commentInitials,
          email: req.user?.email || '',
        },
        type: 'comment',
        title: 'New Comment on Task',
        message: `${commentAuthor} commented on ${card.key}: "${text.trim().substring(0, 80)}${text.length > 80 ? '...' : ''}"`,
        cardId: card.id,
        cardKey: card.key,
      });
    }

    return res.status(201).json({
      success: true,
      comment: newComment,
      card,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCardComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;
    const card = await Card.findOne({ id });

    if (!card) {
      return res.status(404).json({ message: `Card not found: ${id}` });
    }

    card.comments = card.comments.filter((c) => String(c.id) !== String(commentId));
    await card.save();

    await delCachePattern('board:');

    return res.json({ success: true, card });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// SEARCH ENGINE (Week 4 Day 1-2 & Day 3-4 Redis Caching)
// =========================================================================

export const searchCards = async (req, res, next) => {
  try {
    const {
      q = '',
      status,
      priority,
      assignee,
      label,
      limit = 20,
    } = req.query;

    const cacheKey = `search:${JSON.stringify(req.query)}`;
    const cachedResults = await getCache(cacheKey);
    if (cachedResults) {
      return res.json({
        ...cachedResults,
        _fromCache: true,
      });
    }

    const filter = {};

    if (q && q.trim()) {
      const cleanQ = q.trim();
      const escaped = cleanQ.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');

      filter.$or = [
        { key: regex },
        { title: regex },
        { description: regex },
        { 'assignedTo.name': regex },
        { labels: regex },
      ];
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    if (assignee && assignee !== 'all') {
      if (assignee === 'unassigned') {
        filter.assignedTo = null;
      } else {
        filter['assignedTo.name'] = new RegExp(assignee, 'i');
      }
    }

    if (label && label !== 'all') {
      filter.labels = label;
    }

    const cards = await Card.find(filter)
      .sort({ updatedAt: -1 })
      .limit(Number(limit) || 20);

    const totalMatches = await Card.countDocuments(filter);

    const responsePayload = {
      query: q,
      totalMatches,
      count: cards.length,
      cards,
    };

    // Cache query results for 30s
    await setCache(cacheKey, responsePayload, 30);

    return res.json(responsePayload);
  } catch (error) {
    next(error);
  }
};
