const { ZodError } = require("zod");
const createError = require("../utils/createError");

const validateMid = (schema, property = "body") => {
  return (req, res, next) => {
    try {
      console.log('Request body:', req.body);
      schema.parse(req[property]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw createError(422);
      }
      next(error);
    }
  };
};

module.exports = validateMid;