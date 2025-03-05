const Imap = require('imap');
const { simpleParser } = require('mailparser');
const IMAPAccountModel = require('../models/IMAPAccountModel');
const activeConnections = new Map();
const { elasticClient } = require('../config/elasticConfig');

const indexName = 'emails';

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

            // if (IMAPAccount.isActiveConnection) {
            //     console.log("IMAP Account is already connected");
            //     return resolve(`IMAP connection already active for ${IMAPAccount.email}`);
            // }
        
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

const startIDLE = (email, userId, onNewMail) => {
    if (!activeConnections.has(email)) {
        console.error( `IMAP connection not active for ${email}`);
        return;
    }
    const imapClient = activeConnections.get(email);
    imapClient.openBox("INBOX", false, (err, mailbox) => {
        if (err) {
            console.error("Error opening mailbox: ", err);
            return;
        }
        imapClient.once("mail", (numNewMsgs) => {
            console.log(`New email detected (${numNewMsgs} new) for ${email}. Fetching latest email...`);
            fetchLatestEmail(imapClient, userId, onNewMail);
        });
        console.log(`IDLE started for ${email}`);

    });
}

const fetchLatestEmail = (imapClient, userId, onNewMail) => {

    imapClient.search(["UNSEEN"], (err, results) => {
        if (err || results.length === 0) return;
        const latestUID = Math.max(...results);

        const fetch = imapClient.fetch([latestUID], { bodies: "", markSeen: true });

        fetch.on("message", (msg) => {
            msg.on("body", (stream) => {
                simpleParser(stream, async (err, parsed) => {
                    if (err) return console.error("Parsing error:", err);

                    const newEmail = {
                        id: latestUID,
                        folder: "INBOX",
                        date: parsed.date,
                        from: parsed.from.text,
                        to: parsed.to.text,
                        subject: parsed.subject,
                        text: parsed.text,
                        html: parsed.html,
                    };
                    // Store the new email in ElasticSearch
                    await elasticClient.index({
                        index: indexName,
                        id: newEmail.id,
                        body: {...newEmail, userId: userId},
                    });
                    console.log(`New Email Received: ${parsed.subject}`);
                    onNewMail(newEmail);
                });
            });
        });

        fetch.once("end", () => {
            console.log("Processed new email...");
        });
    });
}

module.exports = { 
    activeConnections,
    connectToIMAP, 
    disconnectFromIMAP, 
    retrieveIMAPStatus,
    startIDLE,
    fetchLatestEmail,
};