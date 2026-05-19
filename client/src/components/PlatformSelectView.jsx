import { useState } from 'react';

const platformOptions = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Conecta tu cuenta y publica contenido profesional de forma automatica.',
    status: 'Disponible ahora',
    accentClass: 'platforms__slice--linkedin',
    labelPathId: 'platform-label-linkedin',
    labelOffset: '50%',
    isAvailable: true,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Prepara el flujo para videos cortos y publicaciones orientadas a alcance.',
    status: 'Proximamente',
    accentClass: 'platforms__slice--tiktok',
    labelPathId: 'platform-label-tiktok',
    labelOffset: '50%',
    isAvailable: false,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Deja lista la experiencia para contenido visual y publicaciones automatizadas.',
    status: 'Proximamente',
    accentClass: 'platforms__slice--instagram',
    labelPathId: 'platform-label-instagram',
    labelOffset: '50%',
    isAvailable: false,
  },
];

export default function PlatformSelectView({
  noticeMessage,
  selectedPlatform,
  onBack,
  onSelectPlatform,
}) {
  const [hoveredPlatform, setHoveredPlatform] = useState(null);
  const activePlatformId = hoveredPlatform ?? selectedPlatform ?? 'linkedin';
  const activePlatform =
    platformOptions.find((platform) => platform.id === activePlatformId) ?? platformOptions[0];

  return (
    <section className="platforms">
      <div className="platforms__panel">
        <div className="platforms__intro">
          <span className="platforms__eyebrow">Seleccion de plataforma</span>
          <h1 className="platforms__title">Elegi el destino del contenido</h1>
          <p className="platforms__text">
            Tocá directamente un segmento del radial. LinkedIn ya entra al flujo de login;
            Instagram y TikTok quedan visibles como proximos destinos.
          </p>
          {noticeMessage ? <p className="app__notice app__notice--info">{noticeMessage}</p> : null}
        </div>

        <div className="platforms__arena">
          <div className="platforms__wheel" aria-label="Selector radial de plataforma">
            <svg className="platforms__labels" viewBox="0 0 100 100" aria-hidden="true">
              <defs>
                <path
                  id="platform-label-linkedin"
                  d="M 63 17 A 34 34 0 0 1 90 52"
                />
                <path
                  id="platform-label-tiktok"
                  d="M 21 70 A 34 34 0 0 0 79 70"
                />
                <path
                  id="platform-label-instagram"
                  d="M 10 52 A 34 34 0 0 1 37 17"
                />
              </defs>
              {platformOptions.map((platform) => (
                <text
                  key={platform.id}
                  className={`platforms__curveLabel ${
                    activePlatformId === platform.id ? 'platforms__curveLabel--active' : ''
                  }`}
                >
                  <textPath href={`#${platform.labelPathId}`} startOffset={platform.labelOffset}>
                    {platform.name}
                  </textPath>
                </text>
              ))}
            </svg>

            {platformOptions.map((platform) => (
              <button
                key={platform.id}
                className={`platforms__slice ${platform.accentClass} ${
                  activePlatformId === platform.id ? 'platforms__slice--active' : ''
                }`}
                type="button"
                aria-label={platform.name}
                onClick={() => onSelectPlatform(platform.id)}
                onMouseEnter={() => setHoveredPlatform(platform.id)}
                onMouseLeave={() => setHoveredPlatform(null)}
                onFocus={() => setHoveredPlatform(platform.id)}
                onBlur={() => setHoveredPlatform(null)}
              >
                <span className="sr-only">{platform.name}</span>
              </button>
            ))}

            <div className="platforms__hub">
              <span className="platforms__coreLabel">Auto Post</span>
              <strong className="platforms__coreValue">{activePlatform.name}</strong>
              <span className="platforms__hubStatus">{activePlatform.status}</span>
              <p className="platforms__hubDescription">{activePlatform.description}</p>
              <span className="platforms__action">
                {activePlatform.isAvailable ? 'Entrar con LinkedIn' : 'Disponible mas adelante'}
              </span>
            </div>
          </div>
        </div>

        <div className="platforms__footer">
          <button className="platforms__backButton" type="button" onClick={onBack}>
            Volver
          </button>
        </div>
      </div>
    </section>
  );
}
