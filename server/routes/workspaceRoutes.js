import express from 'express';
import {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  inviteMember,
  removeMember,
} from '../controllers/workspaceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getWorkspaces);
router.get('/:id', getWorkspaceById);
router.post('/', createWorkspace);
router.put('/:id', updateWorkspace);
router.post('/:id/members', inviteMember);
router.delete('/:id/members/:memberId', removeMember);

export default router;
