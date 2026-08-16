import { parseDataUrl } from '../../post/imageHost.service.js';

const LINKEDIN_ASSETS_URL = 'https://api.linkedin.com/v2/assets?action=registerUpload';
const LINKEDIN_UGC_POSTS_URL = 'https://api.linkedin.com/v2/ugcPosts';

const buildLinkedinHeaders = accessToken => ({
  Authorization: `Bearer ${accessToken}`,
  'X-Restli-Protocol-Version': '2.0.0'
});

// LinkedIn error bodies are usually JSON with a `message` field, but fall
// back to the raw text so a failure never surfaces as an opaque, generic
// message with no way to tell what actually went wrong.
const extractLinkedinErrorMessage = responseText => {
  try {
    const data = JSON.parse(responseText);
    return data?.message || data?.error?.message || responseText;
  } catch {
    return responseText;
  }
};

// Registers a media asset (image or video) against the "Share on LinkedIn"
// product, which is the only product this app is approved for. LinkedIn's
// newer /rest/videos API requires a separate, more restricted product grant
// — using it produces a misleading "not owned by author" error instead of a
// clear permissions error, so video shares go through this same classic
// assets endpoint as images, just with a different recipe.
const registerMediaUpload = async ({ accessToken, memberUrn, recipe }) => {
  const response = await fetch(LINKEDIN_ASSETS_URL, {
    method: 'POST',
    headers: {
      ...buildLinkedinHeaders(accessToken),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: [recipe],
        owner: memberUrn,
        serviceRelationships: [
          {
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent'
          }
        ]
      }
    })
  });

  const data = await response.json();
  const uploadUrl =
    data?.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl;
  const asset = data?.value?.asset;

  if (!response.ok || !uploadUrl || !asset) {
    console.error('LinkedIn registerUpload failed:', data);
    throw new Error(`LinkedIn media registration failed: ${data?.message ?? 'unknown error'}`);
  }

  return { uploadUrl, asset };
};

const uploadBinaryToLinkedin = async ({ accessToken, uploadUrl, buffer, mimeType }) => {
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': mimeType
    },
    body: buffer
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('LinkedIn binary upload failed:', errorText);
    throw new Error(`LinkedIn media upload failed: ${extractLinkedinErrorMessage(errorText)}`);
  }
};

const fetchVideoBuffer = async videoUrl => {
  const response = await fetch(videoUrl);

  if (!response.ok) {
    throw new Error('Failed to download the video for LinkedIn upload');
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const registerVideoUpload = async ({ accessToken, memberUrn, videoUrl }) => {
  const videoBuffer = await fetchVideoBuffer(videoUrl);

  const { uploadUrl, asset } = await registerMediaUpload({
    accessToken,
    memberUrn,
    recipe: 'urn:li:digitalmediaRecipe:feedshare-video'
  });

  await uploadBinaryToLinkedin({
    accessToken,
    uploadUrl,
    buffer: videoBuffer,
    mimeType: 'video/mp4'
  });

  return asset;
};

export const createLinkedinPost = async ({
  accessToken,
  memberUrn,
  title,
  content,
  imageUrl,
  videoUrl
}) => {
  if (!accessToken || !memberUrn) {
    throw new Error('Missing LinkedIn session for publishing');
  }

  let shareMediaCategory = 'NONE';
  let media = undefined;

  if (videoUrl) {
    const videoUrn = await registerVideoUpload({ accessToken, memberUrn, videoUrl });

    shareMediaCategory = 'VIDEO';
    media = [
      {
        status: 'READY',
        media: videoUrn,
        title: {
          text: title ?? 'LinkedIn Post Generator'
        }
      }
    ];
  } else {
    const dataImage = parseDataUrl(imageUrl);

    if (dataImage) {
      const { uploadUrl, asset } = await registerMediaUpload({
        accessToken,
        memberUrn,
        recipe: 'urn:li:digitalmediaRecipe:feedshare-image'
      });

      await uploadBinaryToLinkedin({
        accessToken,
        uploadUrl,
        buffer: dataImage.buffer,
        mimeType: dataImage.mimeType
      });

      shareMediaCategory = 'IMAGE';
      media = [
        {
          status: 'READY',
          media: asset,
          title: {
            text: title ?? 'LinkedIn Post Generator'
          }
        }
      ];
    }
  }

  const response = await fetch(LINKEDIN_UGC_POSTS_URL, {
    method: 'POST',
    headers: {
      ...buildLinkedinHeaders(accessToken),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      author: memberUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory,
          ...(media ? { media } : {})
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    })
  });

  const responseText = await response.text();
  const postId = response.headers.get('x-restli-id');

  if (!response.ok) {
    console.error('LinkedIn ugcPosts failed:', responseText);
    throw new Error(`LinkedIn post creation failed: ${extractLinkedinErrorMessage(responseText)}`);
  }

  return {
    postId,
    responseText
  };
};
