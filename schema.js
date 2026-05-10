const Joi = require("joi");

module.exports.bookSchema = Joi.object({
  book: Joi.object({
    title: Joi.string().trim().max(100).required(),
    author: Joi.string().trim().max(50).required(),
    subject: Joi.string().trim().max(50).required(),
    category: Joi.string().trim().max(50).allow(""),
    
    status: Joi.string()
      .valid("available", "not_available")
      .insensitive()
      .required(),

    faculty: Joi.string().trim().max(10).allow(""),
    
    semester: Joi.number()
      .integer()
      .min(1)
      .max(8)
      .allow(""),

    isbn: Joi.string().trim().max(50).allow(""),
    description: Joi.string().trim().max(150).allow(""),
  }).required(),
});


module.exports.studentSchema = Joi.object({
  student: Joi.object({
    name: Joi.string().trim().max(30).required(),
    course: Joi.string().trim().max(20).allow(""),
    roll: Joi.string().trim().max(20).allow(""),

    email: Joi.string()
      .email()
      .lowercase()
      .trim()
      .max(60)
      .required(),

    username: Joi.string()
  .trim()
  .lowercase()
  .pattern(/^[a-z0-9._]+$/)
  .min(4)
  .max(30)
  .required()
  .messages({
    "string.pattern.base":
      "Username can contain only lowercase letters, numbers, dots and underscores (no spaces)",
    "string.min": "Username must be at least 4 characters long",
    "string.max": "Username must be at most 30 characters long",
    "string.empty": "Username is required",
  }),

    password: Joi.string()
      .min(4)
      .max(15)
      .required(),
  }).required(),
});


