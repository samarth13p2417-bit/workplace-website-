import express from 'express';
import {
  register,
  login,
  loginSocial,
  googleLogin,
  getMe,
  logout,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/login/social', loginSocial);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.post('/profile', updateProfile);
router.post('/logout', logout);

export default router;
