const db = require("../../configs/database");

const imageModel = {
    async createImage({ id, base_url, format, width, height, size }) {
        const result = await db.query(
            `INSERT INTO images (id, base_url, format, width, height, size)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [id, base_url, format, width, height, size]
        );
        return result.rows[0];
    }
};

module.exports = imageModel;