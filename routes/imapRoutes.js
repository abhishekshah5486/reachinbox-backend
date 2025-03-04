const express = require('express');
const router = express.Router();
const imapControllers = require('../controllers/imapController');  

router.post('/:userId/imap-accounts', imapControllers.addIMAPAccount);
router.post('/connect/all/:userId', imapControllers.connectAllIMAPAccounts);
// Email Id is passed as a query param
router.post('/connect/:userId', imapControllers.connectIMAPAccount);
router.post('/disconnect/:userId', imapControllers.disconnectIMAPAccount);
// Retrieve IMAP status
router.get('/status', imapControllers.retrieveIMAPStatus);

module.exports = router;

