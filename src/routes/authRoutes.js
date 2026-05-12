const express = require('express');
const router = express.Router();

const { register, login, me } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../validators/authValidators');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, me);

module.exports = router;
