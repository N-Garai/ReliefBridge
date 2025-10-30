const { Client, Realtime } = require('node-appwrite');

module.exports = async function(req, res) {
    const client = new Client()
        .setEndpoint('https://cloud.appwrite.io/v1')
        .setProject('68f0dbb6003952b7e1c7')
        .setKey(req.variables['APPWRITE_API_KEY']);

    const realtime = new Realtime(client);
    
    const { action, ...data } = JSON.parse(req.body);

    try {
        switch(action) {
            case 'subscribe':
                const subscription = realtime.subscribe(['databases.reliefbridge_db.collections.requests.documents'], 
                    response => {
                        return res.json({ success: true, data: response });
                    }
                );
                break;

            default:
                throw new Error('Invalid action');
        }
    } catch (error) {
        return res.json({ success: false, error: error.message }, 500);
    }
};