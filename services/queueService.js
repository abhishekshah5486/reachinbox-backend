const { getQueue } = require('../config/queueConfig');


const clearQueue = async () => {
    try {
        const queue = await getQueue();
        await queue.clean(0, 'completed');
        await queue.clean(0, 'wait');
        await queue.clean(0, 'active');
        await queue.clean(0, 'delayed');
        await queue.clean(0, 'failed');
        console.log("Queue cleared successfullly.");

    } catch (error) {
        console.error("Failed to clear queue: ", error.message);
    }
}

module.exports = { clearQueue };