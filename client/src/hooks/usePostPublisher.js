import { useState } from 'react';
import { publishPost } from '../api/posts.js';

export default function usePostPublisher(apiBaseUrl) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');

  const publish = async ({ platform, platformLabel, post }) => {
    if (!post) {
      return;
    }

    if (platform === 'instagram' && !post.imageUrl) {
      setPublishMessage('Instagram requires an image. Go back, upload an image, and generate the post again.');
      return;
    }

    setIsPublishing(true);
    setPublishMessage('');

    try {
      await publishPost(apiBaseUrl, { platform, platformLabel, post });
      setPublishMessage(`The post was published successfully to ${platformLabel}.`);
    } catch (error) {
      setPublishMessage(error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const resetPublishMessage = () => setPublishMessage('');

  return { isPublishing, publishMessage, publish, resetPublishMessage };
}
