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
            case 'createRequest':
                const result = await databases.createDocument(
                    'reliefbridge_db',
                    'requests',
                    data.id,
                    data
                );
                return res.json({ success: true, data: result });

            case 'updateRequest':
                const updated = await databases.updateDocument(
                    'reliefbridge_db',
                    'requests',
                    data.id,
                    data
                );
                return res.json({ success: true, data: updated });

            case 'getRequest':
                const request = await databases.getDocument(
                    'reliefbridge_db',
                    'requests',
                    data.id
                );
                return res.json({ success: true, data: request });

            case 'listRequests':
                const requests = await databases.listDocuments(
                    'reliefbridge_db',
                    'requests'
                );
                return res.json({ success: true, data: requests });

            default:
                throw new Error('Invalid action');
        }
    } catch (error) {
        return res.json({ success: false, error: error.message }, 500);
    }
};