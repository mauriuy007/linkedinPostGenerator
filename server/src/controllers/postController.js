import createPostValidator from '../validators/createPostValidator.js';
import { Post } from '../models/Post.js';
import { generatePost } from '../services/gemini/gemini.service.js';
import { createLinkedinPost } from '../services/linkedin/post/createLinkedinPost.js';
import { getLinkedinSessionFromRequest } from '../services/linkedin/auth/linkedinAuth.service.js';

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

    const post = new Post({
      ...value,
      content: generatedContent,
      imageUrl: value.imageUrl
        ?? (value.imageBase64 && value.imageMimeType
          ? `data:${value.imageMimeType};base64,${value.imageBase64}`
          : undefined),
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

export const publishPost = async (req, res) => {
  try {
    const session = getLinkedinSessionFromRequest(req);

    if (!session) {
      return res.status(401).json({
        error: 'No LinkedIn session available to publish the post'
      });
    }

    const { post } = req.body ?? {};

    if (!post?.content?.trim()) {
      return res.status(400).json({
        error: 'Post content is required to publish on LinkedIn'
      });
    }

    console.log('POST /api/posts/publish - publishing post:', {
      title: post.title,
      authorUsername: post.authorUsername,
      hasImage: Boolean(post.imageUrl),
      memberUrn: session.memberUrn
    });

    const publishResult = await createLinkedinPost({
      accessToken: session.accessToken,
      memberUrn: session.memberUrn,
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl
    });

    console.log('POST /api/posts/publish - LinkedIn response:', publishResult);

    return res.status(200).json({
      message: 'Post published successfully on LinkedIn',
      linkedinPostId: publishResult.postId
    });
  } catch (err) {
    console.error('Error publishing post on LinkedIn:', err);
    return res.status(500).json({
      error: err.message ?? 'An error occurred while publishing the post'
    });
  }
};
