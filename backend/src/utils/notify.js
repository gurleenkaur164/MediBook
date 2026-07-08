const supabase = require('../db/supabase');
const { emitToUser } = require('../socket');

/**
 * Create a notification: persist it to the DB and push it to the
 * target user in real time over Socket.IO (event: "notification").
 * Returns the inserted row (or null on failure — notifications are
 * best-effort and must never break the parent request).
 */
const createNotification = async ({ userId, title, message, type = 'appointment' }) => {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({ user_id: userId, title, message, type })
      .select()
      .single();

    if (error) throw error;

    emitToUser(userId, 'notification', data);
    return data;
  } catch (err) {
    console.error('createNotification failed:', err.message);
    return null;
  }
};

module.exports = { createNotification };
