import { parseDataUrl } from '../../post/imageHost.service.js';

const LINKEDIN_ASSETS_URL = 'https://api.linkedin.com/v2/assets?action=registerUpload';
const LINKEDIN_UGC_POSTS_URL = 'https://api.linkedin.com/v2/ugcPosts';

const buildLinkedinHeaders = accessToken => ({
  Authorization: `Bearer ${accessToken}`,
  'X-Restli-Protocol-Version': '2.0.0'
});

const registerImageUpload = async ({ accessToken, memberUrn }) => {
  const response = await fetch(LINKEDIN_ASSETS_URL, {
    method: 'POST',
    headers: {
      ...buildLinkedinHeaders(accessToken),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
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
    throw new Error('LinkedIn image registration failed');
  }

  return { uploadUrl, asset };
};

const uploadImageToLinkedin = async ({ accessToken, uploadUrl, imageBuffer, mimeType }) => {
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': mimeType
    },
    body: imageBuffer
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('LinkedIn binary upload failed:', errorText);
    throw new Error('LinkedIn image upload failed');
  }
};

export const createLinkedinPost = async ({
  accessToken,
  memberUrn,
  title,
  content,
  imageUrl
}) => {
  if (!accessToken || !memberUrn) {
    throw new Error('Missing LinkedIn session for publishing');
  }

  let shareMediaCategory = 'NONE';
  let media = undefined;
  const dataImage = parseDataUrl(imageUrl);

  if (dataImage) {
    const { uploadUrl, asset } = await registerImageUpload({
      accessToken,
      memberUrn
    });

    await uploadImageToLinkedin({
      accessToken,
      uploadUrl,
      imageBuffer: dataImage.buffer,
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
    throw new Error('LinkedIn post creation failed');
  }

  return {
    postId,
    responseText
  };
};
