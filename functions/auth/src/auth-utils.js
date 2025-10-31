function checkRole(session, role) {
    if (!session || !session.role) {
        throw new Error('Authentication required');
    }
    
    if (role && session.role !== role) {
        throw new Error('Access denied');
    }
    
    return true;
}

function checkAdmin(session) {
    if (!session || !session.role || !['admin', 'coordinator'].includes(session.role)) {
        throw new Error('Admin access required');
    }
    
    return true;
}

module.exports = {
    checkRole,
    checkAdmin
};