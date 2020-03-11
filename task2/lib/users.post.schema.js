const Joi = require('@hapi/joi');

module.exports = Joi.object({
    id: Joi.string().required(),
    login: Joi.string().required(),
    password: Joi.string().regex(/(?=.*[0-9])(?=.*[a-zA-Z])/).required(),
    age: Joi.number().integer().min(4).max(130).required(),
    isDeleted: Joi.boolean().required()
});
