const express = require('express');
const router = express.Router();
const imapControllers = require('../controllers/imapController');  

router.post('/:userId/imap-accounts', imapControllers.addIMAPAccount);
router.post('/connect/all/:userId', imapControllers.connectAllIMAPAccounts);

module.exports = router;

