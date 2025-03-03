const authControllers = require('../controllers/authController');
const router = require('express').Router();

// Register a new user
router.post('/register', authControllers.register_user);
// Login an existing user
router.post('/login', authControllers.login_user);

module.exports = router;