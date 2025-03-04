// const bcrypt = require('bcryptjs');
const IMAPAccountModel = require('../models/IMAPAccountModel');
const { connectToIMAP } = require('../services/imapClient');

exports.addIMAPAccount = async (req, res) => {
    try {
        const userId = req.params.userId;
        const {email, imapHost, imapPort, imapPassword, imapUsername, tls} = req.body;
        const existingAccount = await IMAPAccountModel.findOne({email: email});

        // const saltRounds = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(imapPassword, saltRounds);
        // req.body.imapPassword = hashedPassword;

        if (existingAccount) {
            
            return res.status(400).json({
                success: false,
                message: "Email account already exists.",
            })
        }
        const providerMap = {
            'imap.gmail.com': { provider: 'GMAIL', smtpHost: 'smtp.gmail.com', imapPort: 993, smtpPort: 465 },
            'outlook.office365.com': { provider: 'OUTLOOK', smtpHost: 'smtp.office365.com', imapPort: 993, smtpPort: 587 },
            'imap.mail.yahoo.com': { provider: 'YAHOO', smtpHost: 'smtp.mail.yahoo.com', imapPort: 993, smtpPort: 465 },
        };
        const defaults = providerMap[imapHost];

        const newIMAPAccount = new IMAPAccountModel({
            userId: userId,
            email: email,
            imapHost: imapHost,
            provider: defaults.provider,
            imapPort: imapPort || defaults.imapPort,
            imapPassword: req.body.imapPassword,
            imapUsername: imapUsername || email,
            tls: (tls !== undefined) ? tls : true,
            authMethod: 'PASSWORD'
        })
        const savedIMAPAccount = await newIMAPAccount.save();
        return res.status(201).json({
            success: true,
            message: "IMAP Account added successfully.",
            data: savedIMAPAccount
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Internal Server Error. Please try again later.",
            error: error.message
        });
        
    }
}

// Connect all IMAP accounts for a user
exports.connectAllIMAPAccounts = async (req, res) => {
    try {
        
        const { userId } = req.params;
        const imapAccounts = await IMAPAccountModel.find({userId: userId});
        console.log(imapAccounts);
        if (!imapAccounts.length) {
            return res.status(400).json({
                success: false,
                message: "No IMAP accounts found for this user."
            })
        }
        const connectionPromises = imapAccounts.map((imapAccount) => connectToIMAP(imapAccount));
        const connectionResults = await Promise.all(connectionPromises);
        console.log(connectionResults);

        res.status(200).json({
            success: true,
            message: "IMAP connections established for all accounts."
        })

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: "Error connecting IMAP accounts. Please try again later.",
            error: err.message
        });
        
    }
}