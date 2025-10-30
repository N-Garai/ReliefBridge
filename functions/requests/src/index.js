const sdk = require('node-appwrite');

module.exports = async function(req, res) {
    const client = new sdk.Client();
    const databases = new sdk.Databases(client);

    client
        .setEndpoint('https://cloud.appwrite.io/v1')
        .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    try {
        if (req.method === 'GET') {
            // Get all requests for live map
            const requests = await databases.listDocuments(
                process.env.DATABASE_ID,
                'help_requests'
            );
            return res.json(requests);
        }

        if (req.method === 'POST') {
            const userId = req.headers['x-appwrite-user-id'];
            if (!userId) {
                throw new Error('Authentication required');
            }

            // Get user details
            const user = await databases.getDocument(
                process.env.DATABASE_ID,
                'users',
                userId
            );

            const { latitude, longitude, request_type, description, priority, location, contact_phone } = req.body;

            // Validate coordinates
            if (!latitude || !longitude || 
                latitude < -90 || latitude > 90 || 
                longitude < -180 || longitude > 180) {
                throw new Error('Invalid coordinates');
            }

            // Create help request
            const request = await databases.createDocument(
                process.env.DATABASE_ID,
                'help_requests',
                sdk.ID.unique(),
                {
                    user_id: userId,
                    user_name: user.name,
                    request_type,
                    description,
                    priority,
                    location,
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    contact_phone,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            );

            return res.json(request);
        }

        throw new Error('Method not allowed');
    } catch (error) {
        return res.json({ error: error.message }, 500);
    }
};