const express = require('express');
const router = express.Router();
const elasticSearchControllers = require('../controllers/elasticSearchController');

// Route to search for emails by query for a userId
router.post('/search/:userId', elasticSearchControllers.searchEmailsByQuery);

module.exports = router;