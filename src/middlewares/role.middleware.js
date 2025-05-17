const createError = require("../utils/createError");

const roleMid = ({ roles = [], allowOwner = false } = {}) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user) {
            throw createError(401, "Authentication required");
        }

        const userId = user.uid;
        const userRole = user.role;
        const resourceId = req.body.user_id || req.params.id || null;

        const hasRole = roles.length === 0 || roles.includes(userRole);
        let isOwner = false;

        if (allowOwner && resourceId) {
            isOwner = String(resourceId) === String(userId);
        }

        if (!hasRole && !isOwner) {
            throw createError(403, "Permission denied");
        }

        next();
    };
};

module.exports = roleMid;