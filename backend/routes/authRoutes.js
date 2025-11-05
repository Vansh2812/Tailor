import express from 'express';
import {
  loginUser,
  forgotPassword,
  resetPassword,
  getAllUsers,
  changePassword,
  updateLanguage
} from '../controllers/authController.js';

const router = express.Router();

router.get('/all', getAllUsers);

router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword); // NEW

router.post('/change-password', changePassword);
router.post('/update-language', updateLanguage);

export default router;
