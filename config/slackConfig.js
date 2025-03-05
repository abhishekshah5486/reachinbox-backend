const dotenv = require('dotenv');
const path = require('path');
dotenv.config({path: path.join(__dirname, '../.env')});

module.exports = {
    SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
}