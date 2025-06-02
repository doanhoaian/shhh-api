const createError = require("../utils/createError");

const roleMid = ({ roles = [], allowOwner = false } = {}) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user) {
            return next(createError(401, "Authentication required"));
        }

        if (process.env.FIREBASE_AUTH_ROLE === "false") {
            return next();
        }

        const userId = user.uid;
        const userRole = user.role;
        const resourceId = req.body.user_id || req.params.id || req.body.id;

        const hasRole = roles.length === 0 || roles.includes(userRole);
        let isOwner = false;

        if (allowOwner && resourceId) {
            isOwner = String(resourceId) === String(userId);
        }

        if (!hasRole && !isOwner) {
            return next(createError(403, "Permission denied"));
        }

        next();
    };
};

module.exports = roleMid;