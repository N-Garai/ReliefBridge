const sdk = require('node-appwrite');

module.exports = async function(req, res) {
    const client = new sdk.Client();
    const databases = new sdk.Databases(client);

    client
        .setEndpoint('https://cloud.appwrite.io/v1')
        .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    try {
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

        // Get all requests
        const allRequests = await databases.listDocuments(
            process.env.DATABASE_ID,
            'help_requests'
        );

        let response = {
            role: user.role,
            all_requests: allRequests.documents
        };

        if (user.role === 'victim') {
            // Get user's requests
            const myRequests = await databases.listDocuments(
                process.env.DATABASE_ID,
                'help_requests',
                [sdk.Query.equal('user_id', userId)]
            );
            response.my_requests = myRequests.documents;
        }
        else if (user.role === 'volunteer') {
            // Get pending requests
            const pendingRequests = await databases.listDocuments(
                process.env.DATABASE_ID,
                'help_requests',
                [sdk.Query.equal('status', 'pending')]
            );

            // Get volunteer's claimed requests
            const myClaimed = await databases.listDocuments(
                process.env.DATABASE_ID,
                'help_requests',
                [sdk.Query.equal('volunteer_id', userId)]
            );

            response.pending_requests = pendingRequests.documents;
            response.my_claimed = myClaimed.documents;
        }
        else {
            // Admin view
            const pendingRequests = await databases.listDocuments(
                process.env.DATABASE_ID,
                'help_requests',
                [sdk.Query.equal('status', 'pending')]
            );

            const claimedRequests = await databases.listDocuments(
                process.env.DATABASE_ID,
                'help_requests',
                [sdk.Query.equal('status', 'claimed')]
            );

            response.pending_requests = pendingRequests.documents;
            response.claimed_requests = claimedRequests.documents;
        }

        return res.json(response);
    } catch (error) {
        return res.json({ error: error.message }, 500);
    }
};