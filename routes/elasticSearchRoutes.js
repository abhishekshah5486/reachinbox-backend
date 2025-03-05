const express = require('express');
const router = express.Router();
const elasticSearchControllers = require('../controllers/elasticSearchController');

// Route to search for emails by query for a userId
router.post('/search/:userId', elasticSearchControllers.searchEmailsByQuery);
// Route to search for emails by date range for a userId
router.post('/search/date/range/:userId', elasticSearchControllers.searchEmailsByDateRange);

module.exports = router;