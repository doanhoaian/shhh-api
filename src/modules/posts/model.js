const db = require("../../configs/database");

const postModel = {
    async getAllTopics(data) {
        const result = await db.query(`
            SELECT id, label FROM topics
        `);
        return result.rows;
    },

    async createPost(data) {
        const result = await db.query(`
            SELECT * FROM create_confession
            (
                $1, $2, $3, $4::bigint[], $5::numeric[], $6::varchar[]
            )`, [
            data.user_id,
            data.school_id,
            data.content,
            data.topic_ids,
            data.topic_scores,
            data.image_ids
        ]);
        return result.rows[0];
    },

    async getPostIdsForFeed({ school_id, topic_value = null, limit = 15, offset = 0 }) {
        const result = await db.query(
            `select * from get_post_ids_for_feed($1, $2, $3, $4)`,
            [school_id, topic_value, limit, offset]
        );
        return result.rows.map(row => row.id);
    },

    async getPostIdsForFeedCursor({ school_id, topic_value = null, limit = 15, last_post_id = null, last_score = null }) {
        const result = await db.query(
            `select * from get_post_ids_for_feed_cursor($1, $2, $3, $4, $5)`,
            [school_id, topic_value, limit, last_score, last_post_id]
        );
        return result.rows.map(row => ({
            id: row.id,
            score: Number(row.final_score)
        }));
    },

    async getPostsByIds({ post_ids }) {
        const result = await db.query(
            `select * from get_posts_by_ids($1)`,
            [post_ids]
        );
        return result.rows;
    },

    async getPostCountersByIds({ post_ids }) {
        const result = await db.query(
            `select * from get_post_counters_by_ids($1)`,
            [post_ids]
        );
        return result.rows;
    },
};

module.exports = postModel;