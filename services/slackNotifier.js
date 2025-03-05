const axios = require('axios');
const { SLACK_WEBHOOK_URL } = require('../config/slackConfig');

const sendSlackNotification = async (email) => {
    try {

        const message = {
            text: `*New Interested Email!* \n\n📌 *Subject:* ${email.subject}\n *From:* ${email.from}\n *Received On:* ${email.date}\n\n *Message Preview:*\n${email.text.substring(0, 200)}...\n\n *Check the full email for details!*`,
        };
        await axios.post(SLACK_WEBHOOK_URL, message);
        console.log("Slack Notification Sent...");

    } catch (error) {

        console.error("Error sending slack notification: ", error.message);
        
    }
}

module.exports = { sendSlackNotification };