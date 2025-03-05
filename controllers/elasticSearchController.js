const { searchEmailsByQuery } = require('../services/elasticService');

exports.searchEmailsByQuery = async (req, res) => {
    try {
        const { query } = req.body;
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