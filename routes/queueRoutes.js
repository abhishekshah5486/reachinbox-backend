const express = require('express');
const router = express.Router();
const queueControllers = require('../controllers/queueController');

router.delete('/clear', queueControllers.clearBullMQQueue);

module.exports = router;