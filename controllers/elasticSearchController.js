const { searchEmailsByQuery, searchEmailsByDateRange,  filterEmailsByFolderAndAccount, filterEmailsByAccount, filterEmailsByFolder} = require('../services/elasticService');

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

exports.filterEmailsByFolderAndAccount = async (req, res) => {
    try {
        
        const { folder, email } = req.query;
        const { userId } = req.params;

        const searchResults = await filterEmailsByFolderAndAccount(userId, folder, email);
        res.status(200).json({
            success: true,
            message: "Filtered emails retrieved.",
            searchResults: searchResults
        })

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Error filtering emails. Please try again later.",
            error: error.message
        });
        
    }
}

exports.filterEmailsByAccount = async (req, res) => {
    try {

        const { email } = req.query;
        const { userId } = req.params;

        const searchResults = await filterEmailsByAccount(userId, email);
        res.status(200).json({
            success: true,
            message: "Filtered emails retrieved.",
            searchResults: searchResults
        })
        
    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Error filtering emails. Please try again later.",
            error: error.message
        });
        
    }
}

exports.filterEmailsByFolder = async (req, res) => {
    try {
        
        const { folder } = req.query;
        const { userId } = req.params;

        const searchResults = await filterEmailsByFolder(userId, folder);
        res.status(200).json({
            success: true,
            message: "Filtered emails retrieved.",
            searchResults: searchResults
        })

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Error filtering emails. Please try again later.",
            error: error.message
        });
        
    }
}