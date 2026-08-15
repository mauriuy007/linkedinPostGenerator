import { PLATFORM_OPTIONS } from '../../constants/platforms.js';
import { PLATFORM_ICONS } from '../icons/index.js';

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
          {PLATFORM_OPTIONS.map((platform) => {
            const Icon = PLATFORM_ICONS[platform.id];
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
