const express = require('express');
const router = express.Router();
const elasticSearchControllers = require('../controllers/elasticSearchController');

// Route to search for emails by query for a userId
router.post('/search/:userId', elasticSearchControllers.searchEmailsByQuery);
// Route to search for emails by date range for a userId
router.post('/search/date/range/:userId', elasticSearchControllers.searchEmailsByDateRange);
// Route to filter emails by folder for a userId
router.post('/filter/folder/:userId', elasticSearchControllers.filterEmailsByFolder);
// Route to filter emails by account for a userId
router.post('/search/account/:userId', elasticSearchControllers.filterEmailsByAccount);
// Route to filter emails by folder and account for a userId
router.post('/filter/folder/account/:userId', elasticSearchControllers.filterEmailsByFolderAndAccount);
// Route to delete emails from elastic search for a userId
router.delete('/delete/:userId', elasticSearchControllers.deleteEmailsFromElasticSearchByUserId);

module.exports = router;