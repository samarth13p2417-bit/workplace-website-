import express from 'express';
import {
  createCard,
  getCardById,
  updateCard,
  deleteCard,
  moveCard,
} from '../controllers/cardController.js';

const router = express.Router();

router.post('/', createCard);
router.post('/reorder', moveCard);
router.get('/:id', getCardById);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);

export default router;
