const { Queue } = require('bullmq');

const queue = new Queue('emailQueue', {
    redis: {
        host: 'localhost',
        port: 6379
    }    
});

module.exports = queue;