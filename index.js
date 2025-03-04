const express = require('express');
const dotenv = require('dotenv');
const connect_to_mongodb = require('./config/mongoDB');
const authRoutes = require('./routes/authRoutes');
const imapRoutes = require('./routes/imapRoutes');

dotenv.config();
const app = express();
app.use(express.json());

connect_to_mongodb();

app.use('/api/users', authRoutes);
app.use('/api/imap', imapRoutes);


const PORT = process.env.PORT || 8086;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});