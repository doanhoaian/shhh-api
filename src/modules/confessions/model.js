const db = require("../../configs/database");

const confessionModel = {
    async getAllTopics(data) {
        const result = await db.query(`
            SELECT id, label FROM topics
        `);
        return result.rows;
    },

    async createConfession(data) {
        const result = await db.query(`
            SELECT * FROM create_confession($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            data.user_id, 
            data.school_id, 
            data.content, 
            data.topic_ids, 
            data.topic_scores,
            data.image_ids, 
            data.status, 
            data.hidden_reason
        ]);
        return result.rows[0];
    },
};

module.exports = confessionModel;