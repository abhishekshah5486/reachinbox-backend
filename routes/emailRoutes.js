const express = require('express');
const router = express.Router();
const emailControllers = require('../controllers/emailController');

router.get('/fetch/all/:userId', emailControllers.fetchEmailsForAllAccounts);
// router.get('/fetch/:userId', );
router.get('/fetch/folders/:userId', emailControllers.retrieveAllFolders);

module.exports = router;