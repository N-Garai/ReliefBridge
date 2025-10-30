const { Client, Databases } = require('node-appwrite');

module.exports = async function(req, res) {
    const client = new Client()
        .setEndpoint('https://cloud.appwrite.io/v1')
        .setProject('68f0dbb6003952b7e1c7')
        .setKey(req.variables['APPWRITE_API_KEY']);

    const databases = new Databases(client);
    
    const { action, ...data } = JSON.parse(req.body);

    try {
        switch(action) {
            case 'updateLocation':
                const result = await databases.updateDocument(
                    'reliefbridge_db',
                    'locations',
                    data.id,
                    {
                        latitude: data.latitude,
                        longitude: data.longitude,
                        timestamp: new Date().toISOString()
                    }
                );
                return res.json({ success: true, data: result });

            case 'getLocation':
                const location = await databases.getDocument(
                    'reliefbridge_db',
                    'locations',
                    data.id
                );
                return res.json({ success: true, data: location });

            default:
                throw new Error('Invalid action');
        }
    } catch (error) {
        return res.json({ success: false, error: error.message }, 500);
    }
};