import createPostValidator from '../validators/createPostValidator.js';
import { Post } from '../models/Post.js';

export const requestPost = (req, res) => {
  try {
    console.log('POST /api/posts/create - req.body:', req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('POST /api/posts/create - request body is empty');
    }

    const { title, content, authorUsername, imageUrl } = req.body;
    const { error, value } = createPostValidator.validate({
      title,
      content,
      authorUsername,
      imageUrl,
    });

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const post = new Post(value);

    return res.status(200).json({
      message: 'Post data received successfully',
      post,
    });
  } catch (err) {
    console.error('Error creating post:', err);
    return res.status(500).json({ error: 'An error occurred while creating the post' });
  }
};
