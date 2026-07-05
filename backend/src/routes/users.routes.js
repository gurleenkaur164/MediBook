const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getProfile, updateProfile, changePassword, getAllUsers, toggleUserStatus } = require('../controllers/users.controller');

router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, updateProfile);
router.put('/me/password', authenticate, changePassword);
router.get('/', authenticate, authorize('admin'), getAllUsers);
router.patch('/:id/status', authenticate, authorize('admin'), toggleUserStatus);

module.exports = router;
