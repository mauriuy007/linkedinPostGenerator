const INSTAGRAM_GRAPH_BASE_URL = 'https://graph.facebook.com/v25.0';

const CONTAINER_POLL_INTERVAL_MS = 1500;
const CONTAINER_POLL_MAX_ATTEMPTS = 10;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const createMediaContainer = async ({ accessToken, igUserId, imageUrl, caption }) => {
  const params = new URLSearchParams({
    image_url: imageUrl,
    caption: caption ?? '',
    access_token: accessToken,
  });

  const response = await fetch(`${INSTAGRAM_GRAPH_BASE_URL}/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  const data = await response.json();

  if (!response.ok || !data.id) {
    console.error('Instagram media container creation failed:', data);
    throw new Error(data?.error?.message ?? 'Instagram media container creation failed');
  }

  return data.id;
};

const waitForContainerReady = async ({ accessToken, creationId }) => {
  const params = new URLSearchParams({
    fields: 'status_code,status',
    access_token: accessToken,
  });

  for (let attempt = 0; attempt < CONTAINER_POLL_MAX_ATTEMPTS; attempt += 1) {
    const response = await fetch(`${INSTAGRAM_GRAPH_BASE_URL}/${creationId}?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      console.error('Instagram media container status check failed:', data);
      throw new Error('Failed to check Instagram media container status');
    }

    if (data.status_code === 'FINISHED') return;
    if (data.status_code === 'ERROR') {
      console.error('Instagram media container processing failed:', data);
      throw new Error('Instagram failed to process the media for this post');
    }

    await sleep(CONTAINER_POLL_INTERVAL_MS);
  }

  throw new Error('Timed out waiting for Instagram to process the media');
};

const publishMediaContainer = async ({ accessToken, igUserId, creationId }) => {
  const params = new URLSearchParams({
    creation_id: creationId,
    access_token: accessToken,
  });

  const response = await fetch(`${INSTAGRAM_GRAPH_BASE_URL}/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  const data = await response.json();

  if (!response.ok || !data.id) {
    console.error('Instagram media publish failed:', data);
    throw new Error(data?.error?.message ?? 'Instagram post publishing failed');
  }

  return data.id;
};

export const createInstagramPost = async ({ accessToken, igUserId, content, imageUrl }) => {
  if (!accessToken || !igUserId) {
    throw new Error('Missing Instagram session for publishing');
  }

  if (!imageUrl) {
    throw new Error('An image is required to publish a post on Instagram');
  }

  if (imageUrl.startsWith('data:')) {
    throw new Error(
      'Instagram requires a publicly accessible image URL. Deploy the server or expose it via a tunnel (e.g. ngrok) before publishing.'
    );
  }

  const creationId = await createMediaContainer({
    accessToken,
    igUserId,
    imageUrl,
    caption: content,
  });

  await waitForContainerReady({ accessToken, creationId });

  const postId = await publishMediaContainer({ accessToken, igUserId, creationId });

  return { postId };
};
