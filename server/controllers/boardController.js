import Board from '../models/Board.js';
import Workspace from '../models/Workspace.js';
import List from '../models/List.js';
import Card from '../models/Card.js';
import { getCache, setCache } from '../config/redis.js';

export const getBoardData = async (req, res, next) => {
  try {
    const { id } = req.params;
    let boardId = id && id !== 'undefined' && id !== 'default' ? id : null;

    // Check Redis cache first
    const cacheKey = `board:${boardId || 'default'}:full`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.json({
        ...cachedData,
        _fromCache: true,
      });
    }

    let board = null;
    if (boardId) {
      board = await Board.findOne({ id: boardId });
    }
    if (!board) {
      board = await Board.findOne();
    }

    if (!board) {
      return res.status(404).json({ message: 'No boards found' });
    }

    const workspace = (await Workspace.findOne({ id: board.workspaceId })) || (await Workspace.findOne());
    const lists = await List.find({ boardId: board.id }).sort({ order: 1 });
    const allCards = await Card.find({});

    const cardsMap = {};
    allCards.forEach((card) => {
      cardsMap[card.id] = card;
    });

    const responseData = {
      workspace,
      board,
      lists,
      cards: cardsMap,
    };

    // Cache in Redis for 120 seconds
    await setCache(cacheKey, responseData, 120);

    return res.json(responseData);
  } catch (error) {
    next(error);
  }
};

export const createBoard = async (req, res, next) => {
  try {
    const { workspaceId, name, type } = req.body;
    const boardId = `board_${Date.now()}`;

    const newBoard = await Board.create({
      id: boardId,
      workspaceId,
      name: name || 'Kanban Board',
      type: type || 'kanban',
      filter: 'all',
    });

    return res.status(201).json(newBoard);
  } catch (error) {
    next(error);
  }
};
