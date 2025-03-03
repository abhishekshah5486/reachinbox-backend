const express = require('express');
const dotenv = require('dotenv');
const connect_to_mongodb = require('./config/mongoDB');

dotenv.config();
const app = express();
connect_to_mongodb();

const PORT = process.env.PORT || 8086;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});