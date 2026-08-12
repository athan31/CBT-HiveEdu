const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyPassword } = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.post('/verify-password', requireAuth, verifyPassword);

module.exports = router;
