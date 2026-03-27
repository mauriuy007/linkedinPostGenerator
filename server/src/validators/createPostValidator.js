import {joi} from 'joi';

const createPostValidator = Joi.object({
    title: Joi.string().min(5).max(100).required(),
    content: Joi.string().min(20).max(1000).required(),
    authorUsername: Joi.string().min(3).max(100).required(),
    createdAt: Joi.date().default(() => new Date()),
    published: Joi.boolean().default(false),
    imageUrl: Joi.string().uri().optional()
})