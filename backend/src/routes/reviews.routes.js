const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { createReview } = require('../controllers/reviews.controller');

router.post('/', authenticate, authorize('patient'), createReview);

module.exports = router;
