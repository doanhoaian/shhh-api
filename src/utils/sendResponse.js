const sendResponse = (res, code, message, data = null) => {
    res.status(200).json({
        code,
        message,
        data
    });
};

module.exports = sendResponse;  