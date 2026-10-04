import express from 'express';
import {
  register,
  login,
  loginSocial,
  getMe,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/login/social', loginSocial);
router.get('/me', protect, getMe);
router.post('/logout', logout);

export default router;
