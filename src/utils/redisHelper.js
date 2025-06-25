const redisClient = require('../configs/redis');

/**
 * Lấy và cache nhiều item dựa trên một danh sách các keys.
 * Lý tưởng cho việc lấy dữ liệu của nhiều bài viết, nhiều user...
 * Pattern: Cache-Aside cho bulk operations.
 * @param {string[]} keys - Mảng các cache keys cần lấy (e.g., ['post:content:1', 'post:content:2']).
 * @param {function(string): string} keyToIdFn - Hàm để trích xuất ID từ một cache key (e.g., key => key.split(':')[2]).
 * @param {function(string[]): Promise<Object[]>} fetcherFn - Hàm bất đồng bộ để lấy dữ liệu từ DB khi cache miss. Nó nhận vào một mảng các ID bị thiếu và PHẢI trả về một mảng các object, mỗi object BẮT BUỘC có thuộc tính `id`.
 * @param {number} ttl - Thời gian sống của cache (Time-To-Live) tính bằng giây.
 * @returns {Promise<Object<string, Object>>} Một object map từ ID đến dữ liệu của nó (e.g., { 'id1': {data}, 'id2': {data} }).
 * @example
 * const posts = await fetchAndCache(
 * postIds.map(id => `post:content:${id}`),
 * key => key.split(':')[2],
 * missingIds => postModel.getPostsByIdsV2({ post_ids: missingIds }),
 * 3600
 * );
 */
async function fetchAndCache(keys, keyToIdFn, fetcherFn, ttl) {
    const results = {};
    let missingIds = [];

    if (redisClient.isOpen) {
        const cachedResults = await redisClient.mGet(keys);
        const missingKeys = [];
        cachedResults.forEach((json, index) => {
            const id = keyToIdFn(keys[index]);
            if (json) {
                results[id] = JSON.parse(json);
            } else {
                missingKeys.push(keys[index]);
            }
        });
        missingIds = missingKeys.map(key => keyToIdFn(key));
    } else {
        missingIds = keys.map(key => keyToIdFn(key));
    }

    if (missingIds.length > 0) {
        const newItemsArray = await fetcherFn(missingIds);

        const multi = redisClient.isOpen ? redisClient.multi() : null;
        for (const item of newItemsArray) {
            // Đảm bảo item có id để làm key cho result object
            if (item && item.id) {
                results[item.id] = item;
                if (multi) {
                    const key = keys.find(k => keyToIdFn(k) === item.id);
                    if (key) {
                        multi.setEx(key, ttl, JSON.stringify(item));
                    }
                }
            }
        }
        if (multi) multi.exec().catch(err => console.error('Redis multi.exec error:', err));
    }

    return results;
}


/**
 * Lấy và cache một giá trị đơn lẻ từ một cache key duy nhất.
 * Lý tưởng cho việc cache kết quả của một truy vấn, một danh sách ID, một object cấu hình...
 * Pattern: Cache-Aside cho single value.
 * @param {string} cacheKey - Key duy nhất để lưu và lấy cache.
 * @param {function(): Promise<any>} fetcherFn - Hàm bất đồng bộ để lấy dữ liệu từ DB khi cache miss. Hàm này không nhận tham số.
 * @param {number} ttl - Thời gian sống của cache (Time-To-Live) tính bằng giây.
 * @returns {Promise<any>} Dữ liệu được cache hoặc vừa được lấy từ DB.
 * @example
 * const feedIds = await fetchAndCacheSingle(
 * `feedIds:school1:all:15:0`,
 * () => postModel.getPostIdsForFeed({ school_id: 1, ... }),
 * 120
 * );
 */
async function fetchAndCacheSingle(cacheKey, fetcherFn, ttl) {
    if (redisClient.isOpen) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
    }

    // Cache miss, hoặc Redis không hoạt động
    const data = await fetcherFn();

    if (redisClient.isOpen) {
        // Không cần await, để không block response trả về
        redisClient.setEx(cacheKey, ttl, JSON.stringify(data))
            .catch(err => console.error('Redis setEx error:', err));
    }

    return data;
}

module.exports = { 
    fetchAndCache,
    fetchAndCacheSingle 
};