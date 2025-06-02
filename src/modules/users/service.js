const createError = require('../../utils/createError');
const userModel = require('./model');
const admin = require('../../configs/firebase');
const redisClient = require('../../configs/redis');

const userService = {


    /**
    * Lấy thông tin User dạng Auth mới nhất
    *
    * @async
    * @function
    * @name loginUser
    * @memberof userService
    *
    * @param {Object} userData - { email, user_name, alias_id, school_id }
    * @param {Object} userRequest - { ip_address, user_agent }
    *
    * @returns {Promise<Object>} Trả về thông tin người dùng nếu xác thực thành công.
    *
    * @throws {createError(422)} Nếu thiếu dữ liệu cần thiết.
    * @throws {createError(404)} Nếu không tìm thấy người dùng.
    * @throws {createError(403)} Nếu email không khớp với thông tin người dùng trong hệ thống.
    *
    * @example
    * const user = await userService.getAuthUser(userData, userRequest);
    */
    async getAuthUser(userData) {
        if (!userData) throw createError(422);

        const { id, email } = userData;

        const user = await userModel.getAuthUser({ id: id });

        if (!user) throw createError(404);

        if (user.email.toLowerCase() !== email.toLowerCase()) throw createError(403);

        return user;
    },

    /**
     * Đăng nhập hoặc đăng ký tài khoản bằng email (Google Sign-In, social login).
     * Nếu user chưa tồn tại thì tạo mới, nếu đã có thì trả về user.
     *
     * @param {Object} userData - { email, user_name, alias_id, school_id }
     * @param {Object} userRequest - { ip_address, user_agent }
     * @returns {Promise<Object>} Thông tin user
     */
    async loginOrReigisterUser(userData, userRequest) {
        if (!userData) throw createError(422);

        const { id, email, password_hash, login_method, device_info, platform } = userData;
        const { ip_address, user_agent } = userRequest;

        const user = await userModel.findOrCreateUserAndReturn({
            id: id,
            email: email,
            password_hash: password_hash,
            login_method: login_method
        });

        if (!user) throw createError(500);

        // Ghi lại lịch sử đăng nhập
        userModel.recordUserLogin({
            user_id: user.id,
            ip_address: ip_address,
            user_agent: user_agent,
            device_info: device_info,
            platform: platform
        }).catch(() => { });

        return user;
    },

    async checkEmailExists(email) {
        if (!email || typeof email !== 'string' || email.trim().length === 0) {
            throw createError(422);
        }

        try {
            const userRecord = await admin.auth().getUserByEmail(email.trim());
            // Lấy danh sách providerId từ providerData
            const providers = (userRecord.providerData || []).map(p => p.providerId);
            return { is_exists: true, providers };
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                return { is_exists: false, providers: [] };
            }
            throw createError(500);
        }
    },

    async getAllAliases() {
        return await userModel.getAllAliases();
    },

    async getAllSchools() {
        return await userModel.getAllSchools();
    },

    async resetPassword({ email, password, password_hash }) {
        if (!email || !password || !password_hash) throw createError(422);

        // Kiểm tra flag xác thực OTP trong Redis
        const verifiedKey = `otp_verified:${email}:reset_password`;
        const verified = await redisClient.get(verifiedKey);
        if (!verified) throw createError(403, 'OTP not verified for reset password');


        const userRecord = await admin.auth().getUserByEmail(email);
        await admin.auth().updateUser(userRecord.uid, { password });

        // Cập nhật mật khẩu trong database
        userModel.updateUserPassword({ email, password_hash }).catch(() => { });

        // Xóa flag xác thực sau khi đổi mật khẩu thành công
        await redisClient.del(verifiedKey);

        return true;
    },

    async updateUserAlias({ user_id, alias_id }) {
        if (!user_id || !alias_id) throw createError(422);
        const alias_index = await userModel.updateUserAlias({ user_id, alias_id });
        if (alias_index === null) throw createError(404, 'User or alias not found');
        return alias_index;
    },

    async updateUserSchool({ user_id, school_id }) {
        if (!user_id || !school_id) throw createError(422);
        const ok = await userModel.updateUserSchool({ user_id, school_id });
        if (!ok) throw createError(404, 'User or school not found');
        return true;
    }

}

module.exports = userService;