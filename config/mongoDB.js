const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connect_to_mongodb = async () => {
    try {
        const mongo_uri = process.env.MONGO_URI;
        await mongoose.connect(mongo_uri);
        console.log("Database Connected...");
    } catch (err) {
        console.log(err.message);
    }
}

module.exports = connect_to_mongodb;