const Imap = require('imap');
const { simpleParser } = require('mailparser');
const IMAPAccountModel = require('../models/IMAPAccountModel');

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
            })
            imapClient.connect();

        } catch (error) {
            reject(error.message);
        }
    }) 
    return IMAPPromise;
}

module.exports = { connectToIMAP };