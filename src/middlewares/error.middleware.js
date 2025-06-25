require("dotenv").config();
const sendResponse = require("../utils/sendResponse");

const errorMid = (err, req, res, next) => {
  const code = err.statusCode || 500;
  const defaultMessages = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    429: 'Too Many Requests',
    422: 'Unprocessable Entity',
    500: 'Internal Server Error',
  };

  const message = err.message || defaultMessages[code] || 'Error';

  if (process.env.NODE_ENV === 'dev') {
    console.error('Error stack:', err.stack);
  }

  return sendResponse(
    res,
    code,
    message,
    process.env.NODE_ENV === 'dev' ? { stack: err.stack } : null
  );
};

module.exports = errorMid;