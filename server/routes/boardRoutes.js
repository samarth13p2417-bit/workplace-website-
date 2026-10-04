import express from 'express';
import { getBoardData, createBoard } from '../controllers/boardController.js';

const router = express.Router();

router.get('/:id/full', getBoardData);
router.get('/', getBoardData);
router.post('/', createBoard);

export default router;
