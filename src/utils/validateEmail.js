require("dotenv").config();
const dns = require('dns').promises;
const validator = require('validator');
const redisClient = require('../configs/redis');
const disposableDomains = require('disposable-email-domains');

const whitelistDomains = require('../res/whitelistDomains.json');

/**
 * Kiểm tra định dạng email có hợp lệ không
 * @param {string} email - Địa chỉ email cần kiểm tra
 * @returns {boolean} - True nếu email hợp lệ, false nếu không
 */
function isValidEmailFormat(email) {
  return email.length <= 254 &&
    email.split('@')[0].length <= 64 &&
    validator.isEmail(email, { allow_utf8_local_part: true });
}

/**
 * Trích xuất domain từ email
 * @param {string} email - Địa chỉ email
 * @returns {string|undefined} - Domain của email hoặc undefined nếu email không hợp lệ
 */
function getDomain(email) {
  return email.split('@')[1]?.toLowerCase();
}

/**
 * Kiểm tra email thuộc danh sách trắng
 * @param {string} email - Địa chỉ email cần kiểm tra
 * @returns {boolean} - True nếu domain nằm trong whitelist
 */
function isWhitelistedEmail(email) {
  const domain = getDomain(email);
  return whitelistDomains.includes(domain);
}

/**
 * Kiểm tra email có phải là email dùng một lần
 * @param {string} email - Địa chỉ email cần kiểm tra
 * @returns {boolean} - True nếu domain là disposable
 */
function isDisposableEmail(email) {
  const domain = getDomain(email);
  return disposableDomains.includes(domain);
}

/**
 * Kiểm tra domain có bản ghi MX hợp lệ
 * @param {string} domain - Domain cần kiểm tra
 * @returns {Promise<boolean>} - True nếu domain có MX record hợp lệ
 */
async function hasValidMxRecord(domain) {
  const cacheKey = `mx:${domain}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached !== null) return cached === 'true';
  } catch (err) {
    if (process.env.NODE_ENV === 'dev') {
      console.error(`Redis error for ${cacheKey}:`, err);
    }
  }

  try {
    const records = await dns.resolveMx(domain);
    const valid = Array.isArray(records) && records.length > 0;
    try {
      await redisClient.setEx(cacheKey, 86400, valid ? 'true' : 'false');
    } catch (err) {
      if (process.env.NODE_ENV === 'dev') {
        console.error(`Failed to cache MX record for ${domain}:`, err);
      }
    }
    return valid;
  } catch {
    try {
      await redisClient.setEx(cacheKey, 86400, 'false');
    } catch (err) {
      if (process.env.NODE_ENV === 'dev') {
        console.error(`Failed to cache MX record for ${domain}:`, err);
      }
    }
    return false;
  }
}

/**
 * Kiểm tra tính hợp lệ của email (định dạng, disposable, MX record)
 * @param {string} email - Địa chỉ email cần kiểm tra
 * @returns {Promise<boolean>} - True nếu email hợp lệ
 */
async function validateEmail(email) {
  if (!isValidEmailFormat(email)) return false;

  const domain = getDomain(email);

  if (isWhitelistedEmail(email)) return true;
  if (isDisposableEmail(email)) return false;

  return await hasValidMxRecord(domain);
}

module.exports = {
  isValidEmailFormat,
  isDisposableEmail,
  isWhitelistedEmail,
  validateEmail,
  hasValidMxRecord
};