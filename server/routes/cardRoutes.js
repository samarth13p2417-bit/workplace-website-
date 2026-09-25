import express from 'express';
import {
  createCard,
  getCardById,
  updateCard,
  deleteCard,
  moveCard,
  searchCards,
  addCardComment,
  deleteCardComment,
} from '../controllers/cardController.js';

const router = express.Router();

// Search endpoint (placed before /:id)
router.get('/search', searchCards);

// Card CRUD & reorder
router.post('/', createCard);
router.post('/reorder', moveCard);
router.get('/:id', getCardById);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);

// Card comments
router.post('/:id/comments', addCardComment);
router.delete('/:id/comments/:commentId', deleteCardComment);

export default router;
