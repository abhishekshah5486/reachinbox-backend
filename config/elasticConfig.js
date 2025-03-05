const { Client } = require('@elastic/elasticsearch');
const dotenv = require('dotenv');
dotenv.config();

const elasticClient = new Client({
    node: process.env.ELASTICSEARCH_URI || 'http://localhost:9200',
})

const checkElasticConnection = async () => {
    try {

        const elasticNodeHealth = await elasticClient.cluster.health({});
        console.log("Elasticsearch Connected: ", elasticNodeHealth.s);

    } catch (error) {

        console.error("Elasticsearch Connection Error: ", error.message);
        
    }
}

module.exports = { elasticClient, checkElasticConnection };