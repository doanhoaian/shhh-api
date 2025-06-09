const sendResponse = require("../../utils/sendResponse");
const confessionService = require("./service");

exports.createConfession = async (req, res, next) => {
    try {
        
        const data = req.body;
        const files = req.files || [];
        const result = await confessionService.createConfession(data, files);

        return sendResponse(res, 201, "Success", result);
    } catch (err) {
        next(err);
    }
};