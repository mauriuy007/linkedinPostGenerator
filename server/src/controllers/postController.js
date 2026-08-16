import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client';
import createPostValidator from '../validators/createPostValidator.js';
import { getLinkedinSessionFromRequest } from '../services/linkedin/auth/linkedinAuth.service.js';
import { getInstagramSessionFromRequest } from '../services/meta/instagram/auth/instagramAuth.service.js';
import {
  buildGeneratedPost,
  publishPostToLinkedin,
  publishPostToInstagram,
} from '../services/post/post.service.js';

export const requestPost = async (req, res) => {
  try {
    const { error, value } = createPostValidator.validate(req.body ?? {});

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const post = await buildGeneratedPost(value);

    return res.status(200).json({ message: 'Post generated successfully', post });
  } catch (err) {
    console.error('Error creating post:', err);
    return res.status(500).json({
      error: err.message ?? 'An error occurred while creating the post',
    });
  }
};

export const publishPost = async (req, res) => {
  try {
    const session = getLinkedinSessionFromRequest(req);

    if (!session) {
      return res.status(401).json({
        error: 'No LinkedIn session available to publish the post',
      });
    }

    const { post } = req.body ?? {};

    if (!post?.content?.trim()) {
      return res.status(400).json({
        error: 'Post content is required to publish on LinkedIn',
      });
    }

    const result = await publishPostToLinkedin({
      accessToken: session.accessToken,
      memberUrn:   session.memberUrn,
      post,
    });

    return res.status(200).json({
      message: 'Post published successfully on LinkedIn',
      linkedinPostId: result.postId,
    });
  } catch (err) {
    console.error('Error publishing post on LinkedIn:', err);
    return res.status(500).json({
      error: err.message ?? 'An error occurred while publishing the post',
    });
  }
};

// Issues a short-lived, scope-limited Vercel Blob token so the browser can
// upload a video file directly to storage, bypassing the serverless
// function's request body size limit. This is a plain authenticated JSON
// endpoint (not Vercel's handleUpload two-phase protocol) specifically so
// the frontend can call it with credentials: 'include' — the client and
// server run on different origins in production, and handleUpload's own
// internal fetch doesn't send cookies cross-origin.
export const createMediaUploadToken = async (req, res) => {
  try {
    const session = getLinkedinSessionFromRequest(req);

    if (!session) {
      return res.status(401).json({ error: 'No LinkedIn session available to upload media' });
    }

    const { fileName } = req.body ?? {};

    const clientToken = await generateClientTokenFromReadWriteToken({
      pathname: `linkedin-uploads/${fileName || 'video.mp4'}`,
      allowedContentTypes: ['video/mp4'],
      maximumSizeInBytes: 500 * 1024 * 1024,
      addRandomSuffix: true,
    });

    return res.status(200).json({ clientToken });
  } catch (error) {
    console.error('Blob upload token generation failed:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const publishInstagramPost = async (req, res) => {
  try {
    const session = getInstagramSessionFromRequest(req);

    if (!session) {
      return res.status(401).json({
        error: 'No Instagram session available to publish the post',
      });
    }

    const { post } = req.body ?? {};

    if (!post?.imageUrl) {
      return res.status(400).json({
        error: 'An image is required to publish a post on Instagram',
      });
    }

    const result = await publishPostToInstagram({
      accessToken: session.accessToken,
      igUserId:    session.userId,
      post,
    });

    return res.status(200).json({
      message: 'Post published successfully on Instagram',
      instagramPostId: result.postId,
    });
  } catch (err) {
    console.error('Error publishing post on Instagram:', err);
    return res.status(500).json({
      error: err.message ?? 'An error occurred while publishing the post',
    });
  }
};
