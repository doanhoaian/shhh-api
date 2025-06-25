const createError = require("../../utils/createError");
const sendResponse = require("../../utils/sendResponse");
const postService = require("./service");
const { sanitizePost } = require('./utils');

exports.createPost = async (req, res, next) => {
    try {
        
        const data = req.body;
        const files = req.files || [];
        const result = await postService.createPost(data, files);

        return sendResponse(res, 201, "Success", result);
    } catch (err) {
        next(err);
    }
};

exports.getFeedIds = async (req, res, next) => {
    try {
        const school_id = Number(req.query.school_id);
        const topic_value = req.query.topic_value || null;
        const limit = Number(req.query.limit) || 15;
        const last_post_id = req.query.last_post_id || null;
        const last_score = req.query.last_score ? Number(req.query.last_score) : null;

        if (!school_id) {
            throw createError(400, "Missing School");
        }

        const result = await postService.getFeedIds({
            school_id,
            topic_value,
            limit,
            last_post_id,
            last_score
        });

        return sendResponse(res, 200, 'Success', result);
    } catch (err) {
        next(err);
    }
};


exports.getFeedContent = async (req, res, next) => {
  try {
    const post_ids = req.body.post_ids;

    if (!Array.isArray(post_ids) || post_ids.length === 0) {
      throw createError(400, 'Missing or invalid Post Ids');
    }

    const posts = await postService.getFeedContent( {post_ids });

    const sanitized = posts.map(sanitizePost);

    return sendResponse(res, 200, 'Success', sanitized);
  } catch (err) {
    next(err);
  }
};