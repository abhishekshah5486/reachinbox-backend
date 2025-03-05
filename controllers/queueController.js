const { clearQueue } = require("../services/queueService");

exports.clearBullMQQueue = async (req, res) => {
    try {
        
        await clearQueue();
        res.status(200).json({
            success: true,
            message: "Queue cleared successfully."
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to clear queue.",
            error: error.message
        });
        
    }
}