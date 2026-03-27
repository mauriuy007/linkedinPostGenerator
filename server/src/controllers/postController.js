import createPostValidator from '../validators/createPostValidator.js';
import { Post } from '../models/Post.js';

export const requestPost = (req, res) => {
    try {
        const { title, content, authorUsername, imageUrl } = req.body;
        const { error } = createPostValidator.validate({ title, content, authorUsername, imageUrl });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        //PENDING REQUEST TO OPENAI AND POST TO LINKEDIN TO SAVE IN DB

    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ error: 'An error occurred while creating the post' });
    }
}