const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getAppointments, getAppointmentById, bookAppointment, updateStatus } = require('../controllers/appointments.controller');

router.get('/', authenticate, getAppointments);
router.get('/:id', authenticate, getAppointmentById);
router.post('/', authenticate, authorize('patient'), bookAppointment);
router.patch('/:id/status', authenticate, updateStatus);

module.exports = router;
