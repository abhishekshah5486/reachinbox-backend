const Imap = require('imap');
const { simpleParser } = require('mailparser');
const IMAPAccountModel = require('../models/IMAPAccountModel');
const activeConnections = new Map();

const connectToIMAP = async (IMAPAccount) => {

    const imapClient = new Imap({
        user: IMAPAccount.imapUsername,
        password: IMAPAccount.imapPassword,
        host: IMAPAccount.imapHost,
        port: IMAPAccount.imapPort,
        tls: IMAPAccount.tls,
        tlsOptions: { rejectUnauthorized: false },
    });

    const IMAPPromise = new Promise((resolve, reject) => {
        try {

            if (IMAPAccount.isActiveConnection) {
                console.log("IMAP Account is already connected");
                return resolve(`IMAP connection already active for ${IMAPAccount.email}`);
            }
        
            imapClient.once("ready", async () => {
                console.log("IMAP active for ", IMAPAccount.email);
                IMAPAccount.isActiveConnection = true;
                await IMAPAccountModel.updateOne({email: IMAPAccount.email}, {isActiveConnection: true});
                activeConnections.set(IMAPAccount.email, imapClient);
                resolve(`IMAP connection established for ${IMAPAccount.email}`);
            })  
            
            imapClient.once("error", async (error) => {
                console.log(`IMAP error ${IMAPAccount.email}: `, error);
                await IMAPAccountModel.updateOne({email: IMAPAccount.email}, {isActiveConnection: false});
                reject(`IMAP connection failed for ${IMAPAccount.email}`);
            })
    
            imapClient.once("end", async () => {
                console.log(`IMAP connection closed: ${IMAPAccount.email}`);
                await IMAPAccountModel.updateOne({email: IMAPAccount.email}, {isActiveConnection: false});
                activeConnections.delete(IMAPAccount.email);
            })
            imapClient.connect();

        } catch (error) {
            reject(error.message);
        }
    }) 
    return IMAPPromise;
}

const disconnectFromIMAP = async (IMAPAccount) => {
    try {

        if (!IMAPAccount.isActiveConnection) {
            return `IMAP connection already inactive for ${IMAPAccount.email}`;
        }
        const imapClient = activeConnections.get(IMAPAccount.email);
        imapClient.end();
        await IMAPAccountModel.updateOne({email: IMAPAccount.email}, {isActiveConnection: false});
        activeConnections.delete(IMAPAccount.email);

        console.log(`IMAP connection closed for ${IMAPAccount.email}`);
        return `IMAP connection closed for ${IMAPAccount.email}`;

    } catch (error) {

        return error.message;
        
    }
}

const retrieveIMAPStatus = async (email, userId) => {
    try {
        const IMAPAccount = await IMAPAccountModel.findOne({email: email, userId: userId});
        if (!IMAPAccount) {
            return "IMAP account not found.";
        }
        return IMAPAccount.isActiveConnection;
    } catch (error) {
        return error.message;
    }
}

module.exports = { 
    activeConnections,
    connectToIMAP, 
    disconnectFromIMAP, 
    retrieveIMAPStatus,
};