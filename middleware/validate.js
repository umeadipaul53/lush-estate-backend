const AppError = require("../utils/AppError");
const sanitize = require("mongo-sanitize");

const validate = (schema = null, property = "body") => {
  return (req, res, next) => {
    // Use provided schema or fallback to req.validationSchema
    const activeSchema = schema || req.validationSchema;

    if (!activeSchema) {
      return next(new AppError("No validation schema provided", 500));
    }

    const sanitizedInput = sanitize(req[property]);

    const { error, value } = activeSchema.validate(sanitizedInput, {
      abortEarly: false, // collect all errors
      stripUnknown: true, // remove unknown fields
      convert: true, // auto-convert types (e.g., "123" → 123)
    });

    if (error) {
      // Format Joi errors into cleaner messages
      const formattedErrors = error.details.map((err) => ({
        field: err.path.join("."),
        message: err.message.replace(/["]/g, ""),
      }));

      return next(new AppError("Validation failed", 400, formattedErrors));
    }

    // ✅ replace raw input with validated/cleaned data
    req[property] = value;

    next();
  };
};

module.exports = validate;
