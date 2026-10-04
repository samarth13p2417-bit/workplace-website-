import Card from '../models/Card.js';
import List from '../models/List.js';
import { delCachePattern } from '../config/redis.js';

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

    // Invalidate Redis query cache
    await delCachePattern('board:');

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

    const card = await Card.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({ message: `Card not found: ${id}` });
    }

    // Invalidate Redis query cache
    await delCachePattern('board:');

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
    card.listId = destinationListId;
    card.status = destList.title;

    await sourceList.save();
    if (sourceListId !== destinationListId) {
      await destList.save();
    }
    await card.save();

    // Invalidate Redis query cache
    await delCachePattern('board:');

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
