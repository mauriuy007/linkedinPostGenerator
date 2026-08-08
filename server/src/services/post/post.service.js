import { generatePost } from '../gemini/gemini.service.js';
import { createLinkedinPost } from '../linkedin/post/linkedinPost.service.js';
import { createInstagramPost } from '../meta/instagram/post/instagramPost.service.js';
import { publishTemporaryImage } from './imageHost.service.js';
import { Post } from '../../models/Post.js';

export const buildGeneratedPost = async ({
  title,
  content,
  authorUsername,
  imageBase64,
  imageMimeType,
  imageUrl,
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
  });
};

export const publishPostToLinkedin = async ({ accessToken, memberUrn, post }) => {
  return createLinkedinPost({
    accessToken,
    memberUrn,
    title:    post.title,
    content:  post.content,
    imageUrl: post.imageUrl,
  });
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
