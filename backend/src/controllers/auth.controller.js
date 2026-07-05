const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../db/supabase');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  saveRefreshToken,
  deleteRefreshToken,
  findRefreshToken,
} = require('../utils/jwt');

const REFRESH_TOKEN_EXPIRES_DAYS = 7;

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'patient', phone } = req.body;

    // Check existing user
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabase
      .from('users')
      .insert({ name, email, password_hash, role, phone })
      .select('id, name, email, role, phone, avatar_url, created_at')
      .single();

    if (error) throw error;

    // If registering as doctor, create doctor profile
    if (role === 'doctor') {
      await supabase.from('doctors').insert({ user_id: user.id, specialization: 'General' });
    }

    // Generate tokens
    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);
    await saveRefreshToken(user.id, refreshToken, expiresAt.toISOString());

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user, accessToken },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, phone, avatar_url, password_hash, is_active')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);
    await saveRefreshToken(user.id, refreshToken, expiresAt.toISOString());

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    });

    const { password_hash, ...userData } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: userData, accessToken },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    const decoded = verifyRefreshToken(token);
    const storedToken = await findRefreshToken(token);

    if (!storedToken || new Date(storedToken.expires_at) < new Date()) {
      return res.status(401).json({ success: false, message: 'Refresh token invalid or expired' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', decoded.id)
      .single();

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    await deleteRefreshToken(token);

    const newAccessToken = generateAccessToken({ id: user.id, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user.id });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);
    await saveRefreshToken(user.id, newRefreshToken, expiresAt.toISOString());

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, data: { accessToken: newAccessToken } });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await deleteRefreshToken(token);
    }
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

module.exports = { register, login, refresh, logout, getMe };
