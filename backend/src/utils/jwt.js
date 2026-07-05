const jwt = require('jsonwebtoken');
const supabase = require('../db/supabase');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

const saveRefreshToken = async (userId, token, expiresAt) => {
  const { error } = await supabase
    .from('refresh_tokens')
    .insert({ user_id: userId, token, expires_at: expiresAt });
  if (error) throw error;
};

const deleteRefreshToken = async (token) => {
  const { error } = await supabase
    .from('refresh_tokens')
    .delete()
    .eq('token', token);
  if (error) throw error;
};

const findRefreshToken = async (token) => {
  const { data, error } = await supabase
    .from('refresh_tokens')
    .select('*')
    .eq('token', token)
    .single();
  if (error) return null;
  return data;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  saveRefreshToken,
  deleteRefreshToken,
  findRefreshToken,
};
