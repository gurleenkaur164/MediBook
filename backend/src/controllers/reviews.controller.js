const supabase = require('../db/supabase');

// POST /api/reviews
const createReview = async (req, res, next) => {
  try {
    const { appointment_id, rating, comment } = req.body;
    const patient_id = req.user.id;

    const { data: appt } = await supabase
      .from('appointments')
      .select('id, patient_id, doctor_id, status')
      .eq('id', appointment_id)
      .single();

    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appt.patient_id !== patient_id) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (appt.status !== 'completed') return res.status(400).json({ success: false, message: 'Can only review completed appointments' });

    const { data, error } = await supabase
      .from('reviews')
      .insert({ appointment_id, patient_id, doctor_id: appt.doctor_id, rating, comment })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data: { review: data } });
  } catch (err) {
    next(err);
  }
};

// GET /api/doctors/:doctorId/reviews
const getDoctorReviews = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('reviews')
      .select(
        `id, rating, comment, created_at, patient:users!reviews_patient_id_fkey(id, name, avatar_url)`,
        { count: 'exact' }
      )
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) throw error;
    res.json({ success: true, data: { reviews: data, total: count } });
  } catch (err) {
    next(err);
  }
};

module.exports = { createReview, getDoctorReviews };
