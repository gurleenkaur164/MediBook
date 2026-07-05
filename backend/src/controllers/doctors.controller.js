const supabase = require('../db/supabase');

// GET /api/doctors
const getDoctors = async (req, res, next) => {
  try {
    const { specialization, location, minFee, maxFee, search, page = 1, limit = 12, sortBy = 'rating' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('doctors')
      .select(
        `id, specialization, bio, location, fee, experience_yrs, rating, total_reviews, is_active,
        users!inner(id, name, email, avatar_url)`,
        { count: 'exact' }
      )
      .eq('is_active', true)
      .range(offset, offset + Number(limit) - 1);

    if (specialization) query = query.ilike('specialization', `%${specialization}%`);
    if (location) query = query.ilike('location', `%${location}%`);
    if (minFee) query = query.gte('fee', minFee);
    if (maxFee) query = query.lte('fee', maxFee);
    if (search) {
      query = query.or(`specialization.ilike.%${search}%,location.ilike.%${search}%`);
    }

    if (sortBy === 'rating') query = query.order('rating', { ascending: false });
    else if (sortBy === 'fee_asc') query = query.order('fee', { ascending: true });
    else if (sortBy === 'fee_desc') query = query.order('fee', { ascending: false });
    else if (sortBy === 'experience') query = query.order('experience_yrs', { ascending: false });

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({
      success: true,
      data: { doctors: data, total: count, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/doctors/:id
const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('doctors')
      .select(
        `id, specialization, bio, location, fee, experience_yrs, rating, total_reviews,
        users!inner(id, name, email, avatar_url, phone),
        availability(id, day_of_week, start_time, end_time, slot_duration_mins)`
      )
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, data: { doctor: data } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/doctors/profile
const updateDoctorProfile = async (req, res, next) => {
  try {
    const { specialization, bio, location, fee, experience_yrs } = req.body;

    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const updateData = {};
    if (specialization) updateData.specialization = specialization;
    if (bio !== undefined) updateData.bio = bio;
    if (location) updateData.location = location;
    if (fee !== undefined) updateData.fee = fee;
    if (experience_yrs !== undefined) updateData.experience_yrs = experience_yrs;

    const { data, error } = await supabase
      .from('doctors')
      .update(updateData)
      .eq('id', doctor.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data: { doctor: data } });
  } catch (err) {
    next(err);
  }
};

// GET /api/doctors/me
const getMyDoctorProfile = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select(
        `id, specialization, bio, location, fee, experience_yrs, rating, total_reviews, is_active,
        availability(id, day_of_week, start_time, end_time, slot_duration_mins)`
      )
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }
    res.json({ success: true, data: { doctor: data } });
  } catch (err) {
    next(err);
  }
};

// GET /api/doctors/specializations
const getSpecializations = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('specialization')
      .eq('is_active', true);
    if (error) throw error;
    const unique = [...new Set(data.map((d) => d.specialization))].sort();
    res.json({ success: true, data: { specializations: unique } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  updateDoctorProfile,
  getMyDoctorProfile,
  getSpecializations,
};
