const bcrypt = require('bcryptjs');
const supabase = require('../db/supabase');

// GET /api/users/me
const getProfile = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, phone, avatar_url, created_at')
      .eq('id', req.user.id)
      .single();
    if (error) throw error;
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar_url } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (avatar_url) updateData.avatar_url = avatar_url;

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select('id, name, email, role, phone, avatar_url')
      .single();
    if (error) throw error;
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me/password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.id)
      .single();
    if (error) throw error;

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const password_hash = await bcrypt.hash(newPassword, 12);
    await supabase.from('users').update({ password_hash }).eq('id', req.user.id);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /api/users (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select('id, name, email, role, phone, is_active, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (role) query = query.eq('role', role);

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({
      success: true,
      data: { users: data, total: count, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id/status (Admin only)
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: user } = await supabase.from('users').select('is_active').eq('id', id).single();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { data: updated } = await supabase
      .from('users')
      .update({ is_active: !user.is_active })
      .eq('id', id)
      .select('id, name, email, is_active')
      .single();

    res.json({ success: true, data: { user: updated } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, changePassword, getAllUsers, toggleUserStatus };
