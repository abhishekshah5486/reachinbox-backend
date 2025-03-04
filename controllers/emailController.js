const IMAPAccountModel = require("../models/IMAPAccountModel");
const { retrieveAllFolders, fetchEmailsFromFolders } = require('../services/emailService');
const { connectToIMAP } = require('../services/imapClient');

// Retrieve last 30 days emails from IMAP for all accounts
exports.fetchEmailsForAllAccounts = async (req, res) => {
    try {
        const { userId } = req.params;
        const { folders, days } = req.body;

        const IMAPAccounts = await IMAPAccountModel.find({userId: userId, isActiveConnection: true});
        if (!IMAPAccounts) {
            return res.status(400).json({
                success: false,
                message: "No active IMAP accounts found."
            })
        }
        // if folders is not passed in the request, fetch emails from all folders
        let emailResults = null;
        if (!folders) {
           const folderPromises = IMAPAccounts.map((account) => {
               return retrieveAllFolders(account);
           })
           
           const folderResults = await Promise.all(folderPromises);
           emailResults = await Promise.all(IMAPAccounts.map((IMAPAccount, index) => {
               return fetchEmailsFromFolders(IMAPAccount, folderResults[index], days || 30);
           }));
        }
        else {
            emailResults = await Promise.all(IMAPAccounts.map((IMAPAccount) => {
                return fetchEmailsFromFolders(IMAPAccount, folders, days || 30);
            }));
        }

        return res.status(200).json({
            success: true,
            message: "Emails fetched successfully.",
            data: emailResults.flat()
        })

    } catch (error) {
        
        return res.status(500).json({
            success: false,
            message: "Error fetching emails. Please try again later.",
            error: error.message
        });

    }
}

exports.retrieveAllFolders = async (req, res) => {
    try {
        const { userId } = req.params;
        const { email } = req.query;

        const IMAPAccount = await IMAPAccountModel.findOne({email: email, userId: userId});
        if (!IMAPAccount) {
            return res.status(400).json({
                success: false,
                message: "IMAP account not found."
            })
        }
        if (!IMAPAccount.isActiveConnection) {
            console.log(`IMAP not connected for ${email}, connecting...`);
            await connectToIMAP(IMAPAccount);
        }
        const folders = await retrieveAllFolders(IMAPAccount);
        res.status(200).json({
            success: true,
            message: "Folders fetched successfully.",
            data: folders
        })

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Error fetching folders. Please try again later.",
            error: error.message
        });
        
    }
}
