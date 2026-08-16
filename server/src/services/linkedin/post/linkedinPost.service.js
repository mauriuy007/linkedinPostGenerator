import { parseDataUrl } from '../../post/imageHost.service.js';

const LINKEDIN_ASSETS_URL = 'https://api.linkedin.com/v2/assets?action=registerUpload';
const LINKEDIN_UGC_POSTS_URL = 'https://api.linkedin.com/v2/ugcPosts';
const LINKEDIN_VIDEOS_URL = 'https://api.linkedin.com/rest/videos';

// LinkedIn's versioned REST API (used only for video uploads) requires a
// Linkedin-Version header in YYYYMM format. Versions are supported for
// roughly a year after release, so bump this periodically.
const LINKEDIN_API_VERSION = '202607';

const buildLinkedinHeaders = accessToken => ({
  Authorization: `Bearer ${accessToken}`,
  'X-Restli-Protocol-Version': '2.0.0'
});

const buildVersionedLinkedinHeaders = accessToken => ({
  ...buildLinkedinHeaders(accessToken),
  'Linkedin-Version': LINKEDIN_API_VERSION
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

const fetchVideoBuffer = async videoUrl => {
  const response = await fetch(videoUrl);

  if (!response.ok) {
    throw new Error('Failed to download the video for LinkedIn upload');
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const initializeVideoUpload = async ({ accessToken, memberUrn, fileSizeBytes }) => {
  const response = await fetch(`${LINKEDIN_VIDEOS_URL}?action=initializeUpload`, {
    method: 'POST',
    headers: {
      ...buildVersionedLinkedinHeaders(accessToken),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      initializeUploadRequest: {
        owner: memberUrn,
        fileSizeBytes,
        uploadCaptions: false,
        uploadThumbnail: false
      }
    })
  });

  const data = await response.json();
  const video = data?.value?.video;
  const uploadToken = data?.value?.uploadToken;
  const uploadInstructions = data?.value?.uploadInstructions;

  if (!response.ok || !video || !uploadInstructions?.length) {
    console.error('LinkedIn video initializeUpload failed:', data);
    throw new Error('LinkedIn video registration failed');
  }

  return { video, uploadToken, uploadInstructions };
};

// Parts can be uploaded in parallel — LinkedIn only requires that the
// uploadedPartIds sent to finalizeUpload preserve the original part order,
// which Promise.all guarantees regardless of resolution order.
const uploadVideoParts = async ({ uploadInstructions, videoBuffer }) =>
  Promise.all(
    uploadInstructions.map(async part => {
      const chunk = videoBuffer.subarray(part.firstByte, part.lastByte + 1);

      const response = await fetch(part.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: chunk
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('LinkedIn video part upload failed:', errorText);
        throw new Error('LinkedIn video upload failed');
      }

      const etag = response.headers.get('etag')?.replace(/^"|"$/g, '');

      if (!etag) {
        throw new Error('LinkedIn did not return an ETag for an uploaded video part');
      }

      return etag;
    })
  );

const finalizeVideoUpload = async ({ accessToken, video, uploadToken, uploadedPartIds }) => {
  const response = await fetch(`${LINKEDIN_VIDEOS_URL}?action=finalizeUpload`, {
    method: 'POST',
    headers: {
      ...buildVersionedLinkedinHeaders(accessToken),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      finalizeUploadRequest: { video, uploadToken, uploadedPartIds }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('LinkedIn video finalizeUpload failed:', errorText);
    throw new Error('LinkedIn video upload could not be finalized');
  }
};

const registerVideoUpload = async ({ accessToken, memberUrn, videoUrl }) => {
  const videoBuffer = await fetchVideoBuffer(videoUrl);

  const { video, uploadToken, uploadInstructions } = await initializeVideoUpload({
    accessToken,
    memberUrn,
    fileSizeBytes: videoBuffer.byteLength
  });

  const uploadedPartIds = await uploadVideoParts({ uploadInstructions, videoBuffer });

  await finalizeVideoUpload({ accessToken, video, uploadToken, uploadedPartIds });

  return video;
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
