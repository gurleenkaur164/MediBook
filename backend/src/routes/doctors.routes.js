const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getDoctors, getDoctorById, updateDoctorProfile, getMyDoctorProfile, getSpecializations } = require('../controllers/doctors.controller');
const { getAvailability, setAvailability, generateSlots, getSlots } = require('../controllers/availability.controller');
const { getDoctorReviews } = require('../controllers/reviews.controller');

router.get('/', getDoctors);
router.get('/specializations', getSpecializations);
router.get('/me', authenticate, authorize('doctor'), getMyDoctorProfile);
router.put('/profile', authenticate, authorize('doctor'), updateDoctorProfile);
router.post('/availability', authenticate, authorize('doctor'), setAvailability);
router.post('/:doctorId/slots/generate', authenticate, authorize('doctor', 'admin'), generateSlots);
router.get('/:id', getDoctorById);
router.get('/:doctorId/slots', getSlots);
router.get('/:doctorId/availability', getAvailability);
router.get('/:doctorId/reviews', getDoctorReviews);

module.exports = router;
