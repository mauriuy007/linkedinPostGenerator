export const PLATFORMS = {
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Connect your account and auto-publish professional content.',
    status: 'Available',
    isAvailable: true,
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    description: 'Connect your account and publish visual content with AI.',
    status: 'Available',
    isAvailable: true,
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Coming soon for high-reach video posts.',
    status: 'Coming soon',
    isAvailable: false,
  },
};

export const PLATFORM_OPTIONS = [PLATFORMS.linkedin, PLATFORMS.instagram, PLATFORMS.tiktok];

export const getPlatformLabel = (platformId) => PLATFORMS[platformId]?.name ?? 'LinkedIn';
