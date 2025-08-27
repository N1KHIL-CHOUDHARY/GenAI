const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { AppError } = require('../middlewares/errorHandler');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Using DB-backed OTP stored on the user document

// Helper: build nodemailer transporter
const buildTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false otherwise
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();
    console.log('✅ SMTP transporter ready');
    return transporter;
  }

  // Dev fallback: Ethereal account
  const testAccount = await nodemailer.createTestAccount();
  console.log('📩 Using Ethereal test account');
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
};

// @desc Begin registration: generate OTP and temp signup token
// @route POST /api/auth/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email }).select('+password');
  if (existing && existing.isVerified) throw new AppError('User already exists', 400);

  const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  let user;
  if (existing) {
    // Update unverified user
    existing.name = name;
    existing.password = password; // will be hashed by pre-save
    existing.otp = String(otp);
    existing.otpExpires = otpExpires;
    user = await existing.save();
  } else {
    user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      otp: String(otp),
      otpExpires,
    });
  }

  const transporter = await buildTransporter();
  
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || "AI DocAnalyzer <no-reply@example.com>",
    to: email,
    subject: "🔐 Your OTP Code - AI DocAnalyzer",
    html: `
    <div style="font-family: Arial, sans-serif; background: #f4f6f8; padding: 20px;">
      <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        
        <h2 style="text-align: center; color: #4F46E5;">AI DocAnalyzer</h2>
        <p style="font-size: 16px; color: #333;">Hi <b>${email}</b>,</p>
        <p style="font-size: 16px; color: #333;">
          Use the following One-Time Password (OTP) to complete your verification:
        </p>
        
        <div style="text-align: center; margin: 20px 0;">
          <span style="display: inline-block; background: #4F46E5; color: #fff; font-size: 24px; letter-spacing: 5px; padding: 12px 20px; border-radius: 8px; font-weight: bold;">
            ${otp}
          </span>
        </div>
        
        <p style="font-size: 14px; color: #555;">
          This OTP is valid for <b>10 minutes</b>. Please do not share it with anyone.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          © ${new Date().getFullYear()} AI DocAnalyzer. All rights reserved.
        </p>
      </div>
    </div>
    `
  });
  

  if (process.env.NODE_ENV !== 'production') {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('Ethereal preview URL:', preview);
  }

  res.status(201).json({
    success: true,
    message: 'OTP sent to email. Please verify.',
    ...(process.env.NODE_ENV === 'development' ? { devOtp: otp } : {}),
  });
});

// @desc Verify OTP and create user
// @route POST /api/auth/verify-otp
// @access Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('User not found', 404);
  if (user.isVerified) {
    return res.json({ success: true, data: { _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) } });
  }

  const storedOtp = String(user.otp || '');
  const receivedOtp = String(otp || '');
  const expired = !user.otpExpires || user.otpExpires.getTime() < Date.now();
  console.log('[OTP DEBUG] stored:', storedOtp, 'received:', receivedOtp, 'expired:', expired, 'expiresAt:', user.otpExpires);

  if (expired) throw new AppError('OTP expired', 400);
  if (storedOtp !== receivedOtp) throw new AppError('Invalid OTP', 400);

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    },
  });
});

// @desc Authenticate user & get token
// @route POST /api/auth/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid credentials', 401);
  }

  user.lastLogin = Date.now();
  await user.save();

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    },
  });
});

// @desc Google Login (idToken method)
// @route POST /api/auth/google-login
// @access Public
const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();

  if (!payload || !payload.email) throw new AppError('Google authentication failed', 400);

  const { email, name, sub: googleId } = payload;
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: name || email.split('@')[0],
      email,
      password: crypto.randomBytes(16).toString('hex'),
      googleId,
      isVerified: true,
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    user.isVerified = true;
    await user.save();
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    },
  });
});

// @desc Google OAuth callback
// @route GET /api/auth/google/callback
// @access Public
const googleCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:5000/api/auth/google/callback'
  );

  const { tokens } = await client.getToken({ code, redirect_uri: 'http://localhost:5000/api/auth/google/callback' });
  const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();

  if (!payload || !payload.email) throw new AppError('Google authentication failed', 400);

  const { email, name, sub: googleId } = payload;
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: name || email.split('@')[0],
      email,
      password: crypto.randomBytes(16).toString('hex'),
      googleId,
      isVerified: true,
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    user.isVerified = true;
    await user.save();
  }

  const token = generateToken(user._id);
  const redirectUrl = (process.env.FRONTEND_GOOGLE_REDIRECT || 'http://localhost:3000/login') + `#token=${token}`;
  res.redirect(302, redirectUrl);
});

// @desc Get current user
// @route GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user });
});

// @desc Update user profile
// @route PUT /api/auth/me
// @access Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError('User not found', 404);

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  if (req.body.password) user.password = req.body.password;

  const updatedUser = await user.save();
  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      token: generateToken(updatedUser._id),
    },
  });
});

// @desc Forgot password (generate reset token)
// @route POST /api/auth/forgot-password
// @access Public
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new AppError('No user found with that email', 404);

  const resetToken = user.createPasswordResetToken();
  await user.save();

  res.json({
    success: true,
    message: 'Reset token generated (send via email in prod)',
    resetToken,
  });
});

// @desc Reset password
// @route PUT /api/auth/reset-password/:token
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  const user = await User.findOne({
    passwordResetToken: crypto.createHash('sha256').update(token).digest('hex'),
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new AppError('Invalid or expired reset token', 400);

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful',
    token: generateToken(user._id),
  });
});

module.exports = {
  registerUser,
  verifyOtp,
  loginUser,
  googleLogin,
  googleCallback,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
};
