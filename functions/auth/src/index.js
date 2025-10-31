const { Client, ID, Account, Users } = require('node-appwrite');const { Client, Databases, ID, Query } = require('node-appwrite');

const { createAppwriteClient } = require('./appwrite-client');

const { checkRole, checkAdmin } = require('./auth-utils');module.exports = async function (req, res) {

    // Init Appwrite client

module.exports = async function(req, res) {    const client = new Client()

    const client = createAppwriteClient(req);        .setEndpoint('https://cloud.appwrite.io/v1')

    const account = new Account(client);        .setProject('68f0dbb6003952b7e1c7')

    const users = new Users(client);        .setKey(req.variables.APPWRITE_API_KEY);



    try {    const databases = new Databases(client);

        const { action, email, password, name, userType } = JSON.parse(req.body);

        if (req.method === 'POST') {

        switch(action) {        try {

            case 'login':            const data = JSON.parse(req.body);

                const session = await account.createEmailSession(email, password);            

                const user = await users.get(session.userId);            // Check user credentials

                return res.json({            const users = await databases.listDocuments(

                    success: true,                'reliefbridge_db',

                    data: {                'users',

                        userId: user.$id,                [Query.equal('email', data.email)]

                        email: user.email,            );

                        name: user.name,

                        role: user.userType            if (users.total > 0) {

                    }                const user = users.documents[0];

                });                if (user.password_hash === data.password) {

                                    return res.json({

            case 'register':                        success: true,

                const newUser = await users.create(                        user: {

                    ID.unique(),                            id: user.$id,

                    email,                            name: user.name,

                    undefined,                            role: user.role,

                    password,                            email: user.email

                    name                        }

                );                    });

                                }

                await users.updatePrefs(newUser.$id, {            }

                    userType: userType            

                });            return res.json({

                                success: false,

                return res.json({                message: 'Invalid credentials'

                    success: true,            });

                    data: {        } catch (error) {

                        userId: newUser.$id,            return res.json({

                        email: newUser.email,                success: false,

                        name: newUser.name                message: error.message

                    }            });

                });        }

    }

            case 'logout':

                const currentSession = req.headers['x-appwrite-session'];    return res.json({

                if (currentSession) {        success: false,

                    await account.deleteSession(currentSession);        message: 'Method not allowed'

                }    });

                return res.json({ success: true });};
                
            case 'getCurrentUser':
                try {
                    const currentUser = await account.get();
                    const userPrefs = await users.getPrefs(currentUser.$id);
                    return res.json({
                        success: true,
                        data: {
                            userId: currentUser.$id,
                            email: currentUser.email,
                            name: currentUser.name,
                            role: userPrefs.userType
                        }
                    });
                } catch (error) {
                    return res.json({
                        success: false,
                        error: 'Not authenticated'
                    }, 401);
                }
                
            default:
                throw new Error('Invalid action');
        }
    } catch (error) {
        console.error('Auth Error:', error);
        return res.json({
            success: false,
            error: error.message
        }, error.code || 500);
    }
};