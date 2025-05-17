require("dotenv").config();
const admin = require("../configs/firebase");
const createError = require("../utils/createError");

const authMid = () => {
    return async (req, res, next) => {
        if (process.env.USE_FIREBASE_AUTH === "false") {
            // For local testing without Firebase
            req.user = { uid: "test-user", role: "user" };
            return next();
        }
        try {
            const authHeader = req.headers.authorization || "";
            const token = authHeader.replace("Bearer ", "").trim();

            if (!token) {
                throw createError(401, "Missing token");
            }

            const decoded = await admin.auth().verifyIdToken(token);

            req.user = {
                uid: decoded.uid,
                role: decoded.role || "user"
            };

            next();
        } catch (err) {
            next(err);
        }
    }
};

module.exports = authMid;