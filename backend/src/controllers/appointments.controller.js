const supabase = require('../db/supabase');

// GET /api/appointments
const getAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const user = req.user;

    let doctorId = null;
    if (user.role === 'doctor') {
      const { data: doc } = await supabase.from('doctors').select('id').eq('user_id', user.id).single();
      if (doc) doctorId = doc.id;
    }

    let query = supabase
      .from('appointments')
      .select(
        `id, status, type, notes, meet_link, created_at, updated_at,
        time_slots(date, start_time, end_time),
        patient:users!appointments_patient_id_fkey(id, name, email, avatar_url, phone),
        doctor:doctors!appointments_doctor_id_fkey(id, specialization, fee, users(id, name, email, avatar_url))`,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (user.role === 'patient') query = query.eq('patient_id', user.id);
    else if (user.role === 'doctor' && doctorId) query = query.eq('doctor_id', doctorId);

    if (status) query = query.eq('status', status);

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({
      success: true,
      data: { appointments: data, total: count, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/appointments/:id
const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('appointments')
      .select(
        `id, status, type, notes, meet_link, created_at, updated_at,
        time_slots(date, start_time, end_time),
        patient:users!appointments_patient_id_fkey(id, name, email, avatar_url, phone),
        doctor:doctors!appointments_doctor_id_fkey(id, specialization, fee, users(id, name, email, avatar_url))`
      )
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const user = req.user;
    if (
      (user.role === 'patient' && data.patient?.id !== user.id) ||
      (user.role === 'doctor' && data.doctor?.users?.id !== user.id)
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: { appointment: data } });
  } catch (err) {
    next(err);
  }
};

// POST /api/appointments
const bookAppointment = async (req, res, next) => {
  try {
    const { doctor_id, slot_id, type = 'in-person', notes } = req.body;
    const patient_id = req.user.id;

    const { data: slot, error: slotErr } = await supabase
      .from('time_slots')
      .select('*')
      .eq('id', slot_id)
      .eq('doctor_id', doctor_id)
      .eq('is_booked', false)
      .single();

    if (slotErr || !slot) {
      return res.status(409).json({ success: false, message: 'Slot is not available' });
    }

    const { data: appointment, error: apptErr } = await supabase
      .from('appointments')
      .insert({ patient_id, doctor_id, slot_id, type, notes, status: 'pending' })
      .select(
        `id, status, type, notes, created_at,
        time_slots(date, start_time, end_time),
        doctor:doctors!appointments_doctor_id_fkey(id, specialization, users(name, email))`
      )
      .single();

    if (apptErr) throw apptErr;

    await supabase.from('time_slots').update({ is_booked: true }).eq('id', slot_id);

    const { data: docUser } = await supabase
      .from('doctors')
      .select('user_id')
      .eq('id', doctor_id)
      .single();
    if (docUser) {
      await supabase.from('notifications').insert({
        user_id: docUser.user_id,
        title: 'New Appointment Request',
        message: `You have a new appointment request from ${req.user.name}.`,
        type: 'appointment',
      });
    }

    res.status(201).json({ success: true, message: 'Appointment booked', data: { appointment } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/appointments/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, meet_link } = req.body;
    const user = req.user;

    const { data: appt } = await supabase
      .from('appointments')
      .select('id, status, patient_id, doctor_id, slot_id, doctors!appointments_doctor_id_fkey(user_id)')
      .eq('id', id)
      .single();

    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const doctorStatuses = ['confirmed', 'rejected', 'completed'];
    const patientStatuses = ['cancelled'];

    if (user.role === 'doctor') {
      if (appt.doctors?.user_id !== user.id) {
        return res.status(403).json({ success: false, message: 'Not your appointment' });
      }
      if (!doctorStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status for doctor' });
      }
    } else if (user.role === 'patient') {
      if (appt.patient_id !== user.id) {
        return res.status(403).json({ success: false, message: 'Not your appointment' });
      }
      if (!patientStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status for patient' });
      }
    }

    const updateData = { status };
    if (meet_link) updateData.meet_link = meet_link;

    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (['cancelled', 'rejected'].includes(status)) {
      await supabase.from('time_slots').update({ is_booked: false }).eq('id', appt.slot_id);
    }

    const messages = {
      confirmed: 'Your appointment has been confirmed!',
      rejected: 'Your appointment has been rejected.',
      cancelled: 'Your appointment has been cancelled.',
      completed: 'Your appointment has been marked as completed.',
    };
    await supabase.from('notifications').insert({
      user_id: appt.patient_id,
      title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: messages[status] || `Appointment status updated to ${status}`,
      type: 'appointment',
    });

    res.json({ success: true, data: { appointment: data } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAppointments, getAppointmentById, bookAppointment, updateStatus };
