const sendResponse = require('../../utils/sendResponse');
const userService = require('./service');

const { sanitizeUser } = require('./utils');


exports.getAuthUser = async (req, res, next) => {
  const userData = req.body;

  try {
    const result = await userService.getAuthUser(userData);

    return sendResponse(res, 200, 'Success', sanitizeUser(result));
  } catch (err) {
    next(err);
  }
}

exports.loginOrRegisterUser = async (req, res, next) => {
  const userData = req.body;
  const userRequest = {
    ip_address: req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress,
    user_agent: req.headers['user-agent'] || null
  };

  try {
    const result = await userService.loginOrReigisterUser(userData, userRequest);
    return sendResponse(res, 200, 'Success', sanitizeUser(result));
  } catch (err) {
    next(err);
  }
};

exports.checkEmailExists = async (req, res, next) => {
  const { email } = req.body;

  try {
    const result = await userService.checkEmailExists(email);

    return sendResponse(res, 200, 'Success', result);
  } catch (err) {
    next(err);
  }
};

exports.getAllAliases = async (req, res, next) => {
  try {
    const result = await userService.getAllAliases();
    return sendResponse(res, 200, 'Success', result);
  } catch (err) {
    next(err);
  }
};

exports.getAllSchools = async (req, res, next) => {
  try {
    const result = await userService.getAllSchools();
    return sendResponse(res, 200, 'Success', result);
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  const { email, password, password_hash } = req.body;
  try {
    await userService.resetPassword({ email, password, password_hash });
    return sendResponse(res, 200, 'Success');
  } catch (err) {
    next(err);
  }
};

exports.updateUserAlias = async (req, res, next) => {
  const { user_id, alias_id } = req.body;
  try {
    const alias_index = await userService.updateUserAlias({ user_id, alias_id });
    return sendResponse(res, 200, 'Success', { alias_index: alias_index });
  } catch (err) {
    next(err);
  }
};

exports.updateUserSchool = async (req, res, next) => {
  const { user_id, school_id } = req.body;
  try {
    await userService.updateUserSchool({ user_id, school_id });
    return sendResponse(res, 200, 'Success');
  } catch (err) {
    next(err);
  }
};