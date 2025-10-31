const { Client } = require('node-appwrite');

function createAppwriteClient(req) {
    const client = new Client();
    client
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(req.variables['APPWRITE_API_KEY']);
    
    return client;
}

module.exports = { createAppwriteClient };