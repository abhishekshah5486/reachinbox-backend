const { elasticClient } = require('../config/elasticConfig');

const indexName = 'emails';

const createElasticIndex = async () => {
    try {
        const indexExists = await elasticClient.indices.exists({index: indexName});

        if (!indexExists.body) {
            await elasticClient.indices.create({
                index: indexName,
                body: {
                    mappings: {
                        properties: {
                            id: { type: 'keyword' },
                            userId: { type: 'keyword' },
                            folder: { type: 'keyword' },
                            date: { type: 'date' },
                            from: { type: 'text' },
                            to: { type: 'text' },
                            subject: { type: 'text' },
                            text: { type: 'text' },
                            html: { type: 'text'},
                        }
                    }
                }
            });
        }   
    } catch (error) {

        throw new Error(`Failed to create index: ${error.message}`);
        
    }
}

const searchEmailsByQuery = async (query, userId) => {
    if (!query) {
        return [];
    }
    const searchQuery = {
        index: indexName,
        body: {
            query: {
                bool: {
                    must: [
                        {
                            multi_match: {
                                query: query,
                                fields: ['subject', 'text']
                            }
                        }
                    ],
                    filter: [{term: { userId: userId }}]
                }
            }
        }
    }

    const { hits } = await elasticClient.search(searchQuery);
    return hits.hits.map(hit => hit._source);
}

const searchEmailsByDateRange = async (userId, startDate, endDate) => {
    if (!startDate && !endDate) {
        return [];
    }
    else if (!startDate) {
        const endDateObj = new Date(endDate);
        // Set start date 30 days before enddate
        endDateObj.setDate(endDateObj.getDate() - 30);
        startDate = endDateObj.toISOString().split('T')[0];
    }
    else if (!endDate) {
        // Set enddate to current date
        endDate = new Date().toISOString().split('T')[0];
    }
    const searchQuery = {
        index: indexName,
        body: {
            query: {
                bool: {
                    filter: [
                        {term: { userId: userId }},
                        {range: {
                            date: {
                                gte: startDate,
                                lte: endDate
                            }
                        }}
                    ],
                }
            },
            sort: {
                date: {
                    order: 'desc'
                }
            }
        }
    }

    const { hits } = await elasticClient.search(searchQuery);
    return hits.hits.map(hit => hit._source);
}

const filterEmailsByFolderAndAccount = async (userId, folder, email) => {
    const mustClauses = [];
    const filterClauses = [{ term: { userId: userId } }];
    if (folder) {
        filterClauses.push({ term: { folder } });
    }
    if (email) {
        mustClauses.push({ match: { from: email } });
    }
    const searchQuery = {
        index: indexName,
        body: {
            query: {
                bool: {
                    must: mustClauses,
                    filter: filterClauses
                }
            }
        }
    }
    const { hits } = await elasticClient.search(searchQuery);
    return hits.hits.map(hit => hit._source);
}

const filterEmailsByFolder = async (userId, folder) => {
    const searchQuery = {
        index: indexName,
        body: {
            query: {
                bool: {
                    filter: [
                        {term: { userId: userId }},
                        {term: { folder }},
                    ]
                }
            }
        }
    }
    const { hits } = await elasticClient.search(searchQuery);
    return hits.hits.map(hit => hit._source);
}

const filterEmailsByAccount = async (userId, email) => {
    const searchQuery = {
        index: indexName,
        body: {
            query: {
                bool: {
                    filter: [{term: { userId: userId }}],
                    must: [{match: { from: email }}],
                }
            }
        }
    }
    const { hits } = await elasticClient.search(searchQuery);
    return hits.hits.map(hit => hit._source);
}

module.exports = { 
    createElasticIndex,
    searchEmailsByDateRange,
    searchEmailsByQuery,
    filterEmailsByFolderAndAccount,
    filterEmailsByFolder,
    filterEmailsByAccount,
};