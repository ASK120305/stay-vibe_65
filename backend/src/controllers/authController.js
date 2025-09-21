import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import { sendEmail } from '../utils/email.js';

// Generate JWT token and set cookie
const sendTokenResponse = async (user, statusCode, res) => {
  // Create token
  const token = user.generateToken();
  const refreshToken = user.generateRefreshToken();
  
  // Add refresh token to user
  await user.addRefreshToken(refreshToken);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .cookie('refreshToken', refreshToken, { ...options, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
    .json({
      status: 'success',
      token,
      refreshToken,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    // Send verification email
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      await sendEmail({
        email: user.email,
        subject: 'Email Verification - Stay Vibe Plan',
        template: 'emailVerification',
        data: {
          name: user.firstName,
          verificationUrl
        }
      });
    } catch (error) {
      logger.error('Email sending failed:', error);
      // Don't fail registration if email fails
    }

    logger.info(`New user registered: ${user.email}`);
    sendTokenResponse(user, 201, res);
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Update last login
    await user.updateLastLogin();

    logger.info(`User logged in: ${user.email}`);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Find user and remove refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user) {
        await user.removeRefreshToken(refreshToken);
      }
    }

    res
      .cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
      })
      .cookie('refreshToken', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
      })
      .status(200)
      .json({
        status: 'success',
        message: 'Logged out successfully'
      });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies || req.body;

    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'No refresh token provided'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Get user and check if refresh token exists
    const user = await User.findById(decoded.id);
    
    if (!user || !user.refreshTokens.some(tokenObj => tokenObj.token === refreshToken)) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newToken = user.generateToken();
    const newRefreshToken = user.generateRefreshToken();

    // Remove old refresh token and add new one
    await user.removeRefreshToken(refreshToken);
    await user.addRefreshToken(newRefreshToken);

    const options = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res
      .cookie('token', newToken, options)
      .cookie('refreshToken', newRefreshToken, { ...options, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
      .json({
        status: 'success',
        token: newToken,
        refreshToken: newRefreshToken
      });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid refresh token'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      preferences: req.body.preferences
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    logger.info(`Password updated for user: ${user.email}`);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error('Update password error:', error);
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with that email'
      });
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset - Stay Vibe Plan',
        template: 'passwordReset',
        data: {
          name: user.firstName,
          resetUrl
        }
      });

      res.status(200).json({
        status: 'success',
        message: 'Email sent'
      });
    } catch (error) {
      logger.error('Email sending failed:', error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({
        status: 'error',
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    logger.info(`Password reset for user: ${user.email}`);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error('Reset password error:', error);
    next(error);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    // Get hashed token
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired verification token'
      });
    }

    // Verify email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    logger.info(`Email verified for user: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    next(error);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerificationEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with that email'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification - Stay Vibe Plan',
        template: 'emailVerification',
        data: {
          name: user.firstName,
          verificationUrl
        }
      });

      res.status(200).json({
        status: 'success',
        message: 'Verification email sent'
      });
    } catch (error) {
      logger.error('Email sending failed:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    logger.error('Resend verification error:', error);
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/delete-account
// @access  Private
export const deleteAccount = async (req, res, next) => {
  try {
    // Soft delete - deactivate account
    await User.findByIdAndUpdate(req.user.id, { isActive: false });

    logger.info(`Account deactivated for user: ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    logger.error('Delete account error:', error);
    next(error);
  }
};