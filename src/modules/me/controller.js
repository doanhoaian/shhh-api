const createError = require("../../utils/createError");
const sendResponse = require("../../utils/sendResponse");
const meService = require("./service");

exports.getUserInteractions = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const postIds = req.body.post_ids;
        if (!Array.isArray(postIds) || postIds.length === 0) {
            throw createError(400, 'Missing or invalid Post Ids');
        }
        const map = await meService.getUserInteractions({ userId, postIds });
        return sendResponse(res, 200, 'Success', map);
    } catch (err) {
        next(err);
    }
};