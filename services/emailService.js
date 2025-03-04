const Imap = require("imap");
const { simpleParser } = require("mailparser");
const { activeConnections, connectToIMAP } = require("./imapClient");

const retrieveAllFolders = async (account) => {
    try {

        // Check IMAP Conenction
        if (!activeConnections.has(account.email)) {
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
                resolve(Object.keys(mailboxes));
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
        const folderPromises = folders.map((folder) => {
            return fetchEmailsFromIMAPForSpecificFolder(imapClient, folder, days);
        })
        const folderEmails = await Promise.all(folderPromises);
        return folderEmails.flat();
    
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
                const sinceDate = new Date();
                sinceDate.setDate(sinceDate.getDate() - days);
                const searchCriteria = [["SINCE", sinceDate.toISOString()]];
                const fetchOptions = {
                    bodies: "",
                    struct: true,
                };
                
                imapClient.search(searchCriteria, (err, searchResults) => {
                    if (err) {
                        reject(`Error searching mailbox: ${err.message}`);
                    }
                    if (searchResults.length === 0) {
                        resolve([]);
                    }
                    
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
                                        })
                                        .catch((error) => {
                                            reject(`Error parsing email: ${error.message}`);
                                        })
                                })
                                msg.once("end", () => {
                                    resolve(email);
                                })
                            })
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