import List from '../models/List.js';
import Card from '../models/Card.js';
import Board from '../models/Board.js';
import { delCachePattern } from '../config/redis.js';

export const createList = async (req, res, next) => {
  try {
    const { title, boardId } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'List title is required' });
    }

    let targetBoardId = boardId;
    if (!targetBoardId) {
      const defaultBoard = await Board.findOne();
      targetBoardId = defaultBoard?.id || 'board_kanban_1';
    }

    const count = await List.countDocuments({ boardId: targetBoardId });
    const newList = await List.create({
      id: `list_${Date.now()}`,
      boardId: targetBoardId,
      title: title.trim(),
      order: count,
      cardIds: [],
    });

    await delCachePattern('board:');

    return res.status(201).json(newList);
  } catch (error) {
    next(error);
  }
};

export const updateList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const list = await List.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    );

    if (!list) {
      return res.status(404).json({ message: `List not found: ${id}` });
    }

    await delCachePattern('board:');

    return res.json(list);
  } catch (error) {
    next(error);
  }
};

export const deleteList = async (req, res, next) => {
  try {
    const { id } = req.params;

    const list = await List.findOne({ id });
    if (!list) {
      return res.status(404).json({ message: `List not found: ${id}` });
    }

    // Delete cards that belong to this list
    await Card.deleteMany({ listId: id });

    // Delete the list itself
    await List.deleteOne({ id });

    await delCachePattern('board:');

    return res.json({ success: true, deletedListId: id });
  } catch (error) {
    next(error);
  }
};
