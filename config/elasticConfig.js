const { Client } = require('@elastic/elasticsearch');
const dotenv = require('dotenv');
dotenv.config();

const elasticClient = new Client({
    node: process.env.ELASTICSEARCH_URI || 'http://localhost:9200',
})

const checkElasticSearchConnection = async (retries = 5, delay = 5000) => {
    for (let idx=0; idx<retries; idx++) 
    {
        try {

            const elasticNodeHealth = await elasticClient.cluster.health({});
            console.log("Elasticsearch Connected: ", elasticNodeHealth.status);
            return true;
    
        } catch (error) {
    
            console.error("Elasticsearch Connection Error: ", error.message);
            if (idx < retries - 1) {
                console.log(`Retrying Elasticsearch connection in ${delay} ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
}

module.exports = { elasticClient, checkElasticSearchConnection };