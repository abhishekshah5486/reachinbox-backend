const express = require('express');
const dotenv = require('dotenv');
const connect_to_mongodb = require('./config/mongoDB');
const { checkElasticSearchConnection } = require('./config/elasticConfig');
const { createElasticIndex } = require('./services/elasticService');
const authRoutes = require('./routes/authRoutes');
const imapRoutes = require('./routes/imapRoutes');
const emailRoutes = require('./routes/emailRoutes');
const elasticSearchRoutes = require('./routes/elasticSearchRoutes');

dotenv.config();
const app = express();
app.use(express.json());

connect_to_mongodb();
checkElasticSearchConnection()
.then(() => {
    createElasticIndex();
});

app.use('/api/users', authRoutes);
app.use('/api/imap', imapRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/es', elasticSearchRoutes);


const PORT = process.env.PORT || 8086;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});