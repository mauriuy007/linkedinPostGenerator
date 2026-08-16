import Joi from 'joi';

const createPostValidator = Joi.object({
    title: Joi.string().min(5).max(100).required(),
    content: Joi.string().min(5).max(2000).required(),
    authorUsername: Joi.string().min(3).max(100).required(),
    createdAt: Joi.date().default(() => new Date()),
    published: Joi.boolean().default(false),
    imageUrl: Joi.string().uri().optional(),
    imageBase64: Joi.string().base64().optional(),
    imageMimeType: Joi.string().pattern(/^image\/[a-zA-Z0-9.+-]+$/).optional(),
    imageName: Joi.string().max(255).optional(),
    videoUrl: Joi.string().uri().optional()
});

export default createPostValidator;
