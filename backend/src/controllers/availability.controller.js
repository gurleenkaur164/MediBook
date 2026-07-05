const supabase = require('../db/supabase');
const { addMinutes, format, addDays } = require('date-fns');

// GET /api/doctors/:doctorId/availability
const getAvailability = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('day_of_week');
    if (error) throw error;
    res.json({ success: true, data: { availability: data } });
  } catch (err) {
    next(err);
  }
};

// POST /api/doctors/availability
const setAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;

    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Delete existing and re-insert
    await supabase.from('availability').delete().eq('doctor_id', doctor.id);

    const entries = availability.map((a) => ({
      doctor_id: doctor.id,
      day_of_week: a.day_of_week,
      start_time: a.start_time,
      end_time: a.end_time,
      slot_duration_mins: a.slot_duration_mins || 30,
    }));

    const { data, error } = await supabase
      .from('availability')
      .insert(entries)
      .select();

    if (error) throw error;
    res.json({ success: true, data: { availability: data } });
  } catch (err) {
    next(err);
  }
};

// POST /api/doctors/:doctorId/slots/generate
const generateSlots = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { days = 14 } = req.body;

    const { data: avail, error: availErr } = await supabase
      .from('availability')
      .select('*')
      .eq('doctor_id', doctorId);
    if (availErr) throw availErr;
    if (!avail.length) {
      return res.status(400).json({ success: false, message: 'No availability set for this doctor' });
    }

    const slots = [];
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const date = addDays(today, i);
      const dayOfWeek = date.getDay();
      const availForDay = avail.find((a) => a.day_of_week === dayOfWeek);
      if (!availForDay) continue;

      const dateStr = format(date, 'yyyy-MM-dd');
      const [startHour, startMin] = availForDay.start_time.split(':').map(Number);
      const [endHour, endMin] = availForDay.end_time.split(':').map(Number);

      let current = new Date(date);
      current.setHours(startHour, startMin, 0, 0);
      const endTime = new Date(date);
      endTime.setHours(endHour, endMin, 0, 0);

      while (current < endTime) {
        const slotEnd = addMinutes(current, availForDay.slot_duration_mins);
        if (slotEnd > endTime) break;
        slots.push({
          doctor_id: doctorId,
          date: dateStr,
          start_time: format(current, 'HH:mm:ss'),
          end_time: format(slotEnd, 'HH:mm:ss'),
          is_booked: false,
        });
        current = slotEnd;
      }
    }

    const { data, error } = await supabase
      .from('time_slots')
      .upsert(slots, { onConflict: 'doctor_id,date,start_time', ignoreDuplicates: true })
      .select();

    if (error) throw error;
    res.json({ success: true, message: `Generated ${slots.length} slots`, data: { slots } });
  } catch (err) {
    next(err);
  }
};

// GET /api/doctors/:doctorId/slots?date=YYYY-MM-DD
const getSlots = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    let query = supabase
      .from('time_slots')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('is_booked', false)
      .gte('date', date || format(new Date(), 'yyyy-MM-dd'))
      .order('date')
      .order('start_time');

    if (date) query = query.eq('date', date);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data: { slots: data } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAvailability, setAvailability, generateSlots, getSlots };
