const express = require('express');
const dotenv = require('dotenv');
const connect_to_mongodb = require('./config/mongoDB');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
const app = express();
app.use(express.json());

connect_to_mongodb();

app.use('/app/users', authRoutes);


const PORT = process.env.PORT || 8086;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});