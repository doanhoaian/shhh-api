const db = require('../../configs/database');

const userModel = {

    async getAuthUser(data) {
        const result = await db.query(`
            select * from get_user_auth($1);
        `, [data.id]);

        return result.rows[0];
    },

    async findOrCreateUserAndReturn(data) {
        const result = await db.query(`
            select * from find_or_create_user_and_return($1, $2, $3, $4);
        `, [
            data.id,
            data.email,
            data.password_hash,
            data.login_method
        ]);

        return result.rows[0];
    },

    async recordUserLogin(data) {
        const result = await db.query(`
            select * from record_user_login($1, $2, $3, $4, $5);
        `, [
            data.user_id,
            data.ip_address,
            data.user_agent,
            data.device_info,
            data.platform
        ]);

        return result.rows[0];
    },

    async checkEmailExists(data) {
        const result = await db.query(`
            select 1 from users where email = $1 limit 1
        `, [data.email]);
        return result.rowCount === 1;
    },

    async getAllAliases() {
        const result = await db.query(`
            select * from view_aliases_user_ranking;
        `);
        return result.rows;
    },

    async getAllSchools() {
        const result = await db.query(`
            select * from view_schools_user_ranking;
        `);
        return result.rows;
    },

    async updateUserPassword({ email, password_hash }) {
        const result = await db.query(`
            select * from update_user_password($1, $2);
        `, [email, password_hash]);
        return result.rows[0]?.update_user_password === true;
    },

    async updateUserAlias({ user_id, alias_id }) {
        const result = await db.query(`
            select * from update_user_alias($1, $2);
        `, [user_id, alias_id]);
        return result.rows[0]?.update_user_alias;
    },

    async updateUserSchool({ user_id, school_id }) {
        const result = await db.query(`
            select * from update_user_school($1, $2);
        `, [user_id, school_id]);
        return result.rows[0]?.update_user_school === true;
    }
}

module.exports = userModel;