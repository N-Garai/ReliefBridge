const { Client, Databases, ID, Query } = require('node-appwrite');

module.exports = async function (req, res) {
    // Init Appwrite client
    const client = new Client()
        .setEndpoint('https://cloud.appwrite.io/v1')
        .setProject('68f0dbb6003952b7e1c7')
        .setKey(req.variables.APPWRITE_API_KEY);

    const databases = new Databases(client);

    if (req.method === 'POST') {
        try {
            const data = JSON.parse(req.body);
            
            // Check user credentials
            const users = await databases.listDocuments(
                'reliefbridge_db',
                'users',
                [Query.equal('email', data.email)]
            );

            if (users.total > 0) {
                const user = users.documents[0];
                if (user.password_hash === data.password) {
                    return res.json({
                        success: true,
                        user: {
                            id: user.$id,
                            name: user.name,
                            role: user.role,
                            email: user.email
                        }
                    });
                }
            }
            
            return res.json({
                success: false,
                message: 'Invalid credentials'
            });
        } catch (error) {
            return res.json({
                success: false,
                message: error.message
            });
        }
    }

    return res.json({
        success: false,
        message: 'Method not allowed'
    });
};