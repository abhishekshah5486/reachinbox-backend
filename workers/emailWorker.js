const { Worker } = require('bullmq');
const { categorizeEmail } = require('../services/emailCategorizer');
const { elasticClient } = require('../config/elasticConfig');
const { redisClient } = require('../config/queueConfig');
const { sendSlackNotification } = require('../services/slackNotifier');
const { triggerWebhook } = require('../services/webhookNotifier');

let allEmails = [];
const bulkLimit = 50;
const indexName = 'emails';

const emailWorker = new Worker('emailQueue', async (job) => {
    const email = job.data;
    console.log(`Processing email: ${email.subject}`);

    const category = await categorizeEmail(email);
    email.category = category;
    console.log(`Email category: ${category}`);

    if (category.toUpperCase() === 'INTERESTED' && (email.isNewMail && email.isNewMail === true)) {
        try {
            sendSlackNotification(email);
            triggerWebhook(email);
        } catch (error) {
            console.log(`Error sending slack notification: ${error.message}`);
        }
    }
    allEmails.push(email);

    if (allEmails.length >= bulkLimit) {
        try {
            await elasticClient.bulk({
                index: indexName,
                body: allEmails.flatMap(email => [
                    { index: { _id: email.id } },
                    email
                ])
            });
            console.log(`Bulk indexed ${allEmails.length} emails to ElasticSearch`);
            allEmails = [];
        } catch (error) {
            console.error(`Error indexing emails to ElasticSearch: ${error.message}`);    
        }
    }

}, {
    connection: redisClient,
    limiter: {
        groupKey: 'emailQueue',
        max: 100,
        duration: 1000
    }
});

setInterval(async () => {
    if (allEmails.length > 0) {
        try {
            await elasticClient.bulk({
                index: indexName,
                body: allEmails.flatMap(email => [
                    { index: { _id: email.id } },
                    email
                ])
            });
            console.log(`Bulk indexed ${allEmails.length} emails to ElasticSearch`);
            allEmails = [];
        } catch (error) {
            console.error(`Error indexing emails to ElasticSearch: ${error.message}`);    
        }
    }
}, 10000);

module.exports = { emailWorker };