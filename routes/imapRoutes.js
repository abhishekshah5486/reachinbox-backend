const express = require('express');
const router = express.Router();
const imapControllers = require('../controllers/imapController');  

router.post('/:userId/imap-accounts', imapControllers.addIMAPAccount);

module.exports = router;

