const platformOptions = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Connect your account and auto-publish professional content.',
    status: 'Available',
    isAvailable: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Connect your account and publish visual content with AI.',
    status: 'Available',
    isAvailable: true,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Coming soon for high-reach video posts.',
    status: 'Coming soon',
    isAvailable: false,
  },
];

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="7" width="4" height="4" rx="2" fill="currentColor" />
      <rect x="7" y="14" width="4" height="12" rx="2" fill="currentColor" />
      <rect x="15" y="14" width="4" height="12" rx="2" fill="currentColor" />
      <path
        d="M19 18 C19 15.5 21 14 23.5 14 C26 14 26 16.5 26 18 L26 26"
        stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="7" width="26" height="20" rx="6" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="16" cy="17" r="5.5" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="23.5" cy="11" r="1.6" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 3 L21 3 C21 8 25.5 11 28 11.5 L28 16.5 C25.5 16.5 23 15.5 21 13.5 L21 22.5 C21 27.2 17.2 31 12.5 31 C7.8 31 4 27.2 4 22.5 C4 17.8 7.8 14 12.5 14 L12.5 19 C10.5 19 9 20.6 9 22.5 C9 24.4 10.5 26 12.5 26 C14.5 26 16 24.4 16 22.5 Z"
        fill="currentColor"
      />
    </svg>
  );
}

const platformIcons = {
  linkedin: LinkedInIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
};

export default function PlatformSelectView({
  noticeMessage,
  selectedPlatform,
  onBack,
  onSelectPlatform,
}) {
  return (
    <section className="platforms">
      <div className="platforms__panel">
        <div className="platforms__intro">
          <span className="platforms__eyebrow">Platform selector</span>
          <h1 className="platforms__title">Choose your destination</h1>
          <p className="platforms__text">
            LinkedIn and Instagram are ready to go. TikTok support is coming soon.
          </p>
          {noticeMessage ? <p className="app__notice app__notice--info">{noticeMessage}</p> : null}
        </div>

        <div className="platforms__grid">
          {platformOptions.map((platform) => {
            const Icon = platformIcons[platform.id];
            return (
              <button
                key={platform.id}
                type="button"
                className={`platformCard platformCard--${platform.id} ${
                  selectedPlatform === platform.id ? 'platformCard--selected' : ''
                } ${!platform.isAvailable ? 'platformCard--soon' : ''}`}
                onClick={() => onSelectPlatform(platform.id)}
              >
                <span className="platformCard__icon">
                  <Icon />
                </span>
                <span className="platformCard__name">{platform.name}</span>
                <span className="platformCard__description">{platform.description}</span>
                <span
                  className={`platformCard__status platformCard__status--${
                    platform.isAvailable ? 'available' : 'soon'
                  }`}
                >
                  {platform.status}
                </span>
              </button>
            );
          })}
        </div>

        <div className="platforms__footer">
          <button className="platforms__backButton" type="button" onClick={onBack}>
            ← Back
          </button>
        </div>
      </div>
    </section>
  );
}
