const dotenv = require('dotenv');
const path = require('path');
dotenv.config({path: path.join(__dirname, '../.env')});

module.exports = {
    WEBHOOK_URL: process.env.WEBHOOK_URL,
}