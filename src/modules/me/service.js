const createError = require("../../utils/createError");
const meModel = require("./model");
const { fetchAndCache } = require('../../utils/redisHelper')

const meService = {

    async getUserInteractions({ userId, postIds }) {
        try {
            const interactions = await fetchAndCache(
                postIds.map(id => `interaction:${userId}:${id}`),
                key => key.split(':')[2],
                async (missingIds) => {
                    const dbRows = await meModel.getUserInteractionsForPosts({ userId, postIds: missingIds });
                    return dbRows.map(row => ({
                        id: row.post_id,
                        is_liked: row.is_liked,
                        is_disliked: row.is_disliked
                    }));
                },
                900
            );
            return interactions;

        } catch (err) {
            throw createError(500, `Failed to get user interactions: ${err.message}`);
        }
    }
};

module.exports = meService;