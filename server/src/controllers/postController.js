import createPostValidator from '../validators/createPostValidator.js';
import { Post } from '../models/Post.js';
import { generatePost } from '../services/gemini/gemini.service.js';

export const requestPost = async (req, res) => {
  try {
    console.log('POST /api/posts/create - req.body summary:', {
      ...req.body,
      imageBase64: req.body?.imageBase64 ? `[base64 length: ${req.body.imageBase64.length}]` : undefined,
    });

    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('POST /api/posts/create - request body is empty');
    }

    const { title, content, authorUsername, imageUrl, imageBase64, imageMimeType, imageName } = req.body;
    const { error, value } = createPostValidator.validate({
      title,
      content,
      authorUsername,
      imageUrl,
      imageBase64,
      imageMimeType,
      imageName,
    });

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const generatedContent = await generatePost({
      prompt: value.content,
      imageBase64: value.imageBase64,
      imageMimeType: value.imageMimeType,
    });

    console.log('POST /api/posts/create - Gemini returned:', generatedContent);

    const resolvedImageUrl = value.imageUrl
      ?? (value.imageBase64 && value.imageMimeType
        ? `data:${value.imageMimeType};base64,${value.imageBase64}`
        : undefined);

    const post = new Post({
      ...value,
      content: generatedContent,
      imageUrl: resolvedImageUrl,
    });

    console.log('POST /api/posts/create - response post:', {
      ...post,
      imageUrl: post.imageUrl ? `[imageUrl length: ${post.imageUrl.length}]` : undefined,
    });

    return res.status(200).json({
      message: 'Post generated successfully',
      post,
    });
  } catch (err) {
    console.error('Error creating post:', err);
    return res.status(500).json({ error: err.message ?? 'An error occurred while creating the post' });
  }
};
