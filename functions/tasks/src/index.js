const sdk = require('node-appwrite');

module.exports = async function(req, res) {
    const client = new sdk.Client();
    const databases = new sdk.Databases(client);

    client
        .setEndpoint('https://cloud.appwrite.io/v1')
        .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    const action = req.path.split('/')[1]; // claim, complete, available
    const requestId = req.path.split('/')[2];

    try {
        const userId = req.headers['x-appwrite-user-id'];
        if (!userId) {
            throw new Error('Authentication required');
        }

        // Get user role
        const user = await databases.getDocument(
            process.env.DATABASE_ID,
            'users',
            userId
        );

        if (user.role !== 'volunteer') {
            throw new Error('Only volunteers can perform this action');
        }

        switch (action) {
            case 'claim':
                if (!requestId) throw new Error('Request ID is required');
                await databases.updateDocument(
                    process.env.DATABASE_ID,
                    'help_requests',
                    requestId,
                    {
                        status: 'claimed',
                        volunteer_id: userId,
                        volunteer_name: user.name,
                        claimed_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                );
                return res.json({ message: 'Task claimed successfully' });

            case 'complete':
                if (!requestId) throw new Error('Request ID is required');
                await databases.updateDocument(
                    process.env.DATABASE_ID,
                    'help_requests',
                    requestId,
                    {
                        status: 'completed',
                        completed_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                );
                return res.json({ message: 'Task marked as completed' });

            case 'available':
                const pending = await databases.listDocuments(
                    process.env.DATABASE_ID,
                    'help_requests',
                    [sdk.Query.equal('status', 'pending')]
                );
                return res.json(pending);

            default:
                throw new Error('Invalid action');
        }
    } catch (error) {
        return res.json({ error: error.message }, 500);
    }
};