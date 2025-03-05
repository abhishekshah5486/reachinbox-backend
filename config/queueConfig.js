const { Queue } = require('bullmq');
const { Redis } = require('ioredis');

let queue = null;
const redisClient = new Redis({
    port: 6379,
    host: 'localhost',
    maxRetriesPerRequest: null
})

const checkRedisConnection = () => {
    return new Promise((resolve, reject) => {
        redisClient.on('connect', () => {
            console.log('Redis connected successfully.');
            resolve();
        });
        redisClient.on('error', (error) => {
            console.error('Redis connection failed: ', error.message);
            reject();
        });
    });
}

checkRedisConnection().then(() => {
    queue = new Queue('emailQueue', {
        connection: redisClient,
    });
}).catch(() => {
    console.error('Failed to connect to Redis.');
});

const getQueue = async () => {
    if (!queue) {
        await checkRedisConnection();
    }
    return queue;
}

module.exports = { getQueue, redisClient };