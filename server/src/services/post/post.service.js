import { generatePost } from '../gemini/gemini.service.js';
import { createLinkedinPost } from '../linkedin/post/linkedinPost.service.js';
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
