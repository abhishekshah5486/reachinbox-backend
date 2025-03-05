const { elasticClient } = require('../config/elasticConfig');

const indexName = 'emails';

const createElasticIndex = async () => {
    try {
        const indexExists = await elasticClient.indices.exists({index: indexName});

        if (!indexExists) {
            await elasticClient.indices.create({
                index: indexName,
                body: {
                    mappings: {
                        properties: {
                            id: { type: 'keyword' },
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

module.exports = { createElasticIndex };