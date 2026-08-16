import { generatePost } from '../gemini/gemini.service.js';
import { createLinkedinPost } from '../linkedin/post/linkedinPost.service.js';
import { createInstagramPost } from '../meta/instagram/post/instagramPost.service.js';
import { publishTemporaryImage, deleteTemporaryMedia } from './imageHost.service.js';
import { Post } from '../../models/Post.js';

export const buildGeneratedPost = async ({
  title,
  content,
  authorUsername,
  imageBase64,
  imageMimeType,
  imageUrl,
  videoUrl,
}) => {
  const generatedContent = await generatePost({
    prompt:        content,
    imageBase64,
    imageMimeType,
  });

  const resolvedImageUrl =
    imageUrl ??
    (imageBase64 && imageMimeType
      ? `data:${imageMimeType};base64,${imageBase64}`
      : undefined);

  return new Post({
    title,
    authorUsername,
    content: generatedContent,
    imageUrl: resolvedImageUrl,
    videoUrl,
  });
};

export const publishPostToLinkedin = async ({ accessToken, memberUrn, post }) => {
  try {
    return await createLinkedinPost({
      accessToken,
      memberUrn,
      title:    post.title,
      content:  post.content,
      imageUrl: post.imageUrl,
      videoUrl: post.videoUrl,
    });
  } finally {
    // The video was uploaded straight to Blob by the browser so our server
    // could bypass the request body size limit; LinkedIn has its own copy
    // now, so ours is no longer needed regardless of publish outcome.
    if (post.videoUrl) {
      await deleteTemporaryMedia(post.videoUrl);
    }
  }
};

export const publishPostToInstagram = async ({ accessToken, igUserId, post }) => {
  if (!post.imageUrl) {
    return createInstagramPost({ accessToken, igUserId, content: post.content });
  }

  const { url: imageUrl, cleanup } = await publishTemporaryImage(post.imageUrl);

  try {
    return await createInstagramPost({ accessToken, igUserId, content: post.content, imageUrl });
  } finally {
    await cleanup();
  }
};
