const Imap = require("imap");
const { simpleParser } = require("mailparser");
const { activeConnections, connectToIMAP } = require("./imapClient");
const { elasticClient } = require("../config/elasticConfig");
const queue = require("../config/queueConfig");

const indexName = "emails";
const retrieveAllFolders = async (account) => {
    try {
        // Check IMAP Conenction
        if (!account.isActiveConnection) {
            console.log("IMAP connection not active for ", account.email, " \nReconnecting...");
            const connectionResult = await connectToIMAP(account);
            console.log(connectionResult);
        }
    
        const imapClient = activeConnections.get(account.email);
        return new Promise((resolve, reject) => {
            imapClient.getBoxes((err, mailboxes) => {
                if (err) {
                    reject(`Error fetching folders: ${err.message}`);
                }
                const allFolders = Object.keys(mailboxes);
                const updatedFolders = allFolders.map((folder) => {
                    if (folder === '[Gmail]') {
                        return [
                            '[Gmail]/Important',
                            '[Gmail]/Spam',
                            '[Gmail]/Sent Mail',
                            '[Gmail]/Drafts',
                            '[Gmail]/Trash',
                            '[Gmail]/Starred', 
                        ];
                    }
                    return [folder];
                })
                resolve(updatedFolders.flat());
            })
        })

    } catch (error) {
        
        throw new Error(`Failed to fetch folders: ${error.message}`);

    }
}   

const fetchEmailsFromFolders = async (account, folders, days = 30) => {
    try {
        if (!account.isActiveConnection) {
            console.log("IMAP connection not active for ", account.email, " \nReconnecting...");
            const connectionResult = await connectToIMAP(account);
            console.log(connectionResult);
        }

        const imapClient = activeConnections.get(account.email);
        let allEmails = [];
        for (const folder of folders) {
            const folderEmails = await fetchEmailsFromIMAPForSpecificFolder(imapClient, folder, days);
            allEmails = allEmails.concat(folderEmails);
        }
        // Store all the emails in ElasticSearch in bulk
        for (const email of allEmails) {
            const updatedEmail = {...email, userId: account.userId};
            await queue.add('processEmail', updatedEmail);
        }   
        return allEmails;

    } catch (error) {
        
        throw new Error(`Failed to fetch emails: ${error.message}`);

    }
}
const fetchEmailsFromIMAPForSpecificFolder = async (imapClient, folder, days) => {
    try {
        return new Promise((resolve, reject) => {
            imapClient.openBox(folder, false, (err, mailbox) => {
                if (err) {
                    reject(`Error opening mailbox: ${err.message}`);
                }
                console.log(`Opened ${folder} mailbox with ${mailbox.messages.total} messages`);
                const sinceDate = new Date();
                sinceDate.setDate(sinceDate.getDate() - days);
                const formattedSinceDate = `${sinceDate.getFullYear()}-${String(sinceDate.getMonth() + 1).padStart(2, '0')}-${String(sinceDate.getDate()).padStart(2, '0')}`;
                const searchCriteria = [['SINCE', formattedSinceDate]];
                const fetchOptions = {
                    bodies: "",
                    struct: true,
                    markSeen: false,
                };
                imapClient.search(searchCriteria, (err, searchResults) => {
                    if (err) {
                        reject(`Error searching mailbox: ${err.message}`);
                    }
                    if (searchResults.length === 0) {
                        resolve([]);
                    }
                    // console.log(searchResults);
                    const emailPromises = searchResults.map((messageId) => {
                        return new Promise((resolve, reject) => {
                            const fetch = imapClient.fetch(messageId, fetchOptions);
                            fetch.on("message", (msg) => {
                                let email = {};
                                msg.on("body", (stream) => {
                                    simpleParser(stream)
                                        .then((parsedEmail) => {
                                            email = {
                                                id: messageId,
                                                folder: folder,
                                                date: parsedEmail.date,
                                                from: parsedEmail.from.text,
                                                to: parsedEmail.to.text,
                                                subject: parsedEmail.subject,
                                                text: parsedEmail.text,
                                                html: parsedEmail.html,
                                            }                                           
                                            resolve(email);
                                        })
                                        .catch((error) => {
                                            reject(`Error parsing email: ${error.message}`);
                                        })
                                })
                                msg.once("end", () => {
                                    // console.log("Finished processing email: ", email);
                                })
                            })
                            fetch.once("error", (error) => {
                                reject(`Fetch error: ${error.message}`);
                            });
                        })
                    })
                    Promise.all(emailPromises)
                        .then((emails) => {
                            resolve(emails);
                        })
                        .catch((error) => {
                            reject(`Error fetching emails: ${error.message}`);
                        })
                })
            })
        })
    } catch (error) {

        throw new Error(`Failed to fetch emails: ${error.message}`);
        
    }
}

module.exports = {
    retrieveAllFolders,
    fetchEmailsFromFolders,
    fetchEmailsFromIMAPForSpecificFolder,
}