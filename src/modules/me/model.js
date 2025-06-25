const db = require("../../configs/database");

const meModel = {

    async getUserInteractionsForPosts({ user_id, post_ids }) {
        const result = await db.query(
            `select * from get_user_interactions_for_posts($1, $2)`,
            [user_id, post_ids]
        );
        return result.rows;
    }
};

module.exports = meModel;