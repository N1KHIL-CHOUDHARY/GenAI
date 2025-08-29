const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { AppError } = require('../middlewares/errorHandler');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  matchPassword,
  createPasswordResetToken
} = require('../services/userService');
const { getFirestore } = require('../config/db');

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

  const existing = await findUserByEmail(email);
  if (existing && existing.isVerified) throw new AppError('User already exists', 400);

  const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
  
  console.log('🔐 Registration Debug:');
  console.log('Generated OTP:', otp);
  console.log('Hashed OTP:', hashedOtp);
  console.log('OTP Expires:', otpExpires);
  console.log('Existing user:', existing ? 'Yes' : 'No');

  let user;
  if (existing) {
    console.log('Updating existing user with hashed OTP');
    user = await updateUser(existing._id, {
      name,
      password,
      otp: hashedOtp,
      otpExpires,
    });
  } else {
    console.log('Creating new user with hashed OTP');
    user = await createUser({
      name,
      email,
      password,
      isVerified: false,
      otp: hashedOtp,
      otpExpires,
    });
  }
  
  console.log('User saved with hashed OTP');

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
    message: 'OTP sent to email. Please check your inbox and verify.',
  });
});

// @desc Verify OTP and create user
// @route POST /api/auth/verify-otp
// @access Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  
  console.log('🔍 OTP Verification Debug:');
  console.log('Email received:', email);
  console.log('OTP received:', otp);
  
  const user = await findUserByEmail(email);
  if (!user) throw new AppError('User not found', 404);
  
  console.log('User found:', user._id);
  console.log('User OTP field:', user.otp);
  console.log('User OTP type:', typeof user.otp);
  console.log('User OTP expires:', user.otpExpires);
  
  if (user.isVerified) {
    return res.json({ success: true, data: { _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) } });
  }

  if (!user.otp || !user.otpExpires) {
    throw new AppError('No OTP found. Please request a new one.', 400);
  }

  const hashedReceivedOtp = crypto.createHash('sha256').update(String(otp)).digest('hex');
  const storedOtp = user.otp;
  const expired = user.otpExpires.getTime() < Date.now();
  
  console.log('[OTP DEBUG] stored hash:', storedOtp);
  console.log('[OTP DEBUG] received hash:', hashedReceivedOtp);
  console.log('[OTP DEBUG] expired:', expired, 'expiresAt:', user.otpExpires);
  console.log('OTP match:', storedOtp === hashedReceivedOtp);

  if (expired) throw new AppError('OTP has expired. Please request a new one.', 400);
  if (storedOtp !== hashedReceivedOtp) throw new AppError('Invalid OTP. Please check your email and try again.', 400);

  await updateUser(user._id, {
    isVerified: true,
    otp: undefined,
    otpExpires: undefined,
  });

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
  const user = await findUserByEmail(email);

  if (!user || !(await matchPassword(user.password, password))) {
    throw new AppError('Invalid credentials', 401);
  }

  await updateUser(user._id, { lastLogin: new Date() });

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
  
  console.log('🔍 Google Login Debug:');
  console.log('Expected Client ID:', process.env.GOOGLE_CLIENT_ID);
  console.log('Received idToken length:', idToken ? idToken.length : 'undefined');
  
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  
  try {
    const ticket = await client.verifyIdToken({ 
      idToken, 
      audience: process.env.GOOGLE_CLIENT_ID 
    });
    const payload = ticket.getPayload();
    
    console.log('✅ Token verified successfully');
    console.log('Token audience:', payload.aud);
    console.log('Token issuer:', payload.iss);
    console.log('User email:', payload.email);

    if (!payload || !payload.email) throw new AppError('Google authentication failed', 400);

    const { email, name, sub: googleId } = payload;
    let user = await findUserByEmail(email);

    if (!user) {
      user = await createUser({
        name: name || email.split('@')[0],
        email,
        password: crypto.randomBytes(16).toString('hex'),
        googleId,
        isVerified: true,
      });
    } else if (!user.googleId) {
      user = await updateUser(user._id, {
        googleId,
        isVerified: true,
      });
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
  } catch (error) {
    console.error('❌ Google OAuth Error:', error.message);
    console.error('Full error:', error);
    throw new AppError(`Google authentication failed: ${error.message}`, 400);
  }
});

// @desc Google OAuth callback
// @route GET /api/auth/google/callback
// @access Public
const googleCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;
  
  console.log('🔍 Google Callback Debug:');
  console.log('Received authorization code:', code ? 'Yes' : 'No');
  console.log('Client ID:', process.env.GOOGLE_CLIENT_ID);
  console.log('Client Secret length:', process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.length : 'undefined');
  
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:5000/api/auth/google/callback'
  );

  try {
    const { tokens } = await client.getToken({ 
      code, 
      redirect_uri: 'http://localhost:5000/api/auth/google/callback' 
    });
    
    console.log('✅ Tokens received successfully');
    console.log('Access token length:', tokens.access_token ? tokens.access_token.length : 'undefined');
    console.log('ID token length:', tokens.id_token ? tokens.id_token.length : 'undefined');
    
    const ticket = await client.verifyIdToken({ 
      idToken: tokens.id_token, 
      audience: process.env.GOOGLE_CLIENT_ID 
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) throw new AppError('Google authentication failed', 400);

    const { email, name, sub: googleId } = payload;
    let user = await findUserByEmail(email);

    if (!user) {
      user = await createUser({
        name: name || email.split('@')[0],
        email,
        password: crypto.randomBytes(16).toString('hex'),
        googleId,
        isVerified: true,
      });
    } else if (!user.googleId) {
      user = await updateUser(user._id, {
        googleId,
        isVerified: true,
      });
    }

    const token = generateToken(user._id);
    const redirectUrl = (process.env.FRONTEND_GOOGLE_REDIRECT || 'http://localhost:8080/dashboard') + `#token=${token}`;
    res.redirect(302, redirectUrl);
  } catch (error) {
    console.error('❌ Google Callback Error:', error.message);
    console.error('Full error:', error);
    throw new AppError(`Google authentication failed: ${error.message}`, 400);
  }
});

// @desc Get current user
// @route GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user._id);
  res.json({ success: true, data: user });
});

// @desc Update user profile
// @route PUT /api/auth/me
// @access Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user._id);
  if (!user) throw new AppError('User not found', 404);

  const updateData = {};
  if (req.body.name) updateData.name = req.body.name;
  if (req.body.email) updateData.email = req.body.email;
  if (req.body.password) updateData.password = req.body.password;

  const updatedUser = await updateUser(user._id, updateData);
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
  const user = await findUserByEmail(req.body.email);
  if (!user) throw new AppError('No user found with that email', 404);

  const { resetToken, hashedToken, expiresAt } = createPasswordResetToken();
  await updateUser(user._id, {
    passwordResetToken: hashedToken,
    passwordResetExpires: expiresAt,
  });

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

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  const db = getFirestore();
  const snapshot = await db.collection('users')
    .where('passwordResetToken', '==', hashedToken)
    .where('passwordResetExpires', '>', new Date())
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  const userDoc = snapshot.docs[0];
  await updateUser(userDoc.id, {
    password,
    passwordResetToken: undefined,
    passwordResetExpires: undefined,
  });

  res.json({
    success: true,
    message: 'Password reset successful',
    token: generateToken(userDoc.id),
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
