const { searchEmailsByQuery, searchEmailsByDateRange } = require('../services/elasticService');

exports.searchEmailsByQuery = async (req, res) => {
    try {
        const { query } = req.query;
        const { userId } = req.params;

        const searchResults = await searchEmailsByQuery(query, userId);
        res.status(200).json({
            success: true,
            message: "Search results retrieved.",
            searchResults: searchResults
        })
    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Error searching emails. Please try again later.",
            error: error.message
        });
        
    }
}

exports.searchEmailsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const { userId } = req.params;

        const searchResults = await searchEmailsByDateRange(startDate, endDate, userId);
        res.status(200).json({
            success: true,
            message: "Search results retrieved.",
            searchResults: searchResults
        })

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Error searching emails. Please try again later.",
            error: error.message
        });
        
    }
}