const express = require('express');
const router = express.Router();
const imapControllers = require('../controllers/imapController');  

router.post('/:userId/imap-accounts', imapControllers.addIMAPAccount);
router.post('/connect/all/:userId', imapControllers.connectAllIMAPAccounts);
// Email Id is passed as a query param
router.post('/connect/:userId', imapControllers.connectIMAPAccount);
// Email Id is passed as a query param
router.post('/disconnect/:userId', imapControllers.disconnectIMAPAccount);
// Retrieve IMAP status
// Email Id is passed as a query param
router.get('/status/:userId', imapControllers.retrieveIMAPStatus);

// Route for real time updates using IDLE for a specific account
// Email Id is passed as a query param
router.post('/idle/stream/:userId', imapControllers.enableRealTimeUpdates);

module.exports = router;

