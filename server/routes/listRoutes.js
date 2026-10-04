import express from 'express';
import {
  createList,
  updateList,
  deleteList,
} from '../controllers/listController.js';

const router = express.Router();

router.post('/', createList);
router.put('/:id', updateList);
router.delete('/:id', deleteList);

export default router;
