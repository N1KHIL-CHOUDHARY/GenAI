const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyOtp,
  googleLogin,
  googleCallback,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);
router.post('/google-login', googleLogin);
router.get('/google/callback', googleCallback);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;
