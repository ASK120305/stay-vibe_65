import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  updatePassword,
  getProfile,
  updateProfile,
  deleteAccount,
  verifyEmail,
  resendVerificationEmail
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// Protected routes
router.use(protect); // All routes below this middleware are protected

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/update-password', updatePassword);
router.delete('/delete-account', deleteAccount);

export default router;