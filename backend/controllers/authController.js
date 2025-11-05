import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import sendEmail from '../utils/sendEmail.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Login controller
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Forgot password controller (send reset code via email)
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'Email not found' });

    const resetCode = Math.floor(100000 + Math.random() * 900000); // 6-digit code
    user.resetCode = resetCode;
    user.resetCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

const message = `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
      <h2 style="color: #1a73e8; text-align: center;">Tailor Management - Password Reset</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password. Use the code below to reset it:</p>
      <p style="text-align: center; font-size: 24px; font-weight: bold; color: #d32f2f; margin: 20px 0;">
        ${resetCode}
      </p>
      <p>This code will expire in <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888; text-align: center;">
        Tailor Management &copy; ${new Date().getFullYear()}. All rights reserved.
      </p>
    </div>
  </div>
`;

    await sendEmail(email, 'Tailor Management - Password Reset Code', message);

    console.log(`Reset code for ${email}: ${resetCode}`); // optional debug
    res.json({ success: true, message: 'Reset code sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reset password using code
export const resetPassword = async (req, res) => {
  const { email, resetCode, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.resetCode || !user.resetCodeExpires) {
      return res.status(400).json({ success: false, message: 'No reset request found' });
    }

    if (user.resetCode !== Number(resetCode)) {
      return res.status(400).json({ success: false, message: 'Invalid reset code' });
    }

    if (user.resetCodeExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Reset code expired' });
    }

    user.password = newPassword; // will be hashed automatically
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // exclude password
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Change password controller
export const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update language controller
export const updateLanguage = async (req, res) => {
  const { email, language } = req.body;

  if (!email || !language) {
    return res.status(400).json({ success: false, message: 'Email and language are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.language = language;
    await user.save();

    res.json({ success: true, message: 'Language updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
