import Joi from "joi";

export const postUsersSchemas = Joi.object({
    nome: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const postLoginSchemas = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const postRecordsSchemas = Joi.object({
    text: Joi.string().required(),
    value: Joi.number().positive(),
    type: Joi.string().required()
});