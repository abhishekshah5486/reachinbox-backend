const axios = require('axios');
const { WEBHOOK_URL } = require('../config/webhookConfig');

const triggerWebhook = async (email) => {
    try {
        
        const payload = {
            subject: email.subject,
            from: email.from,
            cateogry: email.cateogry,
            date: email.date,
            text: email.text,
        }

        await axios.post(WEBHOOK_URL, payload);
        console.log("Webhook triggered successfully...");

    } catch (error) {

        console.error(`Error triggering webhook: ${error.message}`);
        
    }
}

module.exports = { triggerWebhook };