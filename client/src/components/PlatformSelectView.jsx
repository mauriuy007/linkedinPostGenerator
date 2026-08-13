import { useState } from 'react';

const platformOptions = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Conecta tu cuenta y publica contenido profesional de forma automatica.',
    status: 'Disponible',
    accentClass: 'platforms__slice--linkedin',
    labelPathId: 'lbl-linkedin',
    labelOffset: '50%',
    isAvailable: true,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Proxima integracion para videos y publicaciones de alto alcance.',
    status: 'Proximamente',
    accentClass: 'platforms__slice--tiktok',
    labelPathId: 'lbl-tiktok',
    labelOffset: '50%',
    isAvailable: false,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Conecta tu cuenta y publica contenido visual con IA.',
    status: 'Disponible',
    accentClass: 'platforms__slice--instagram',
    labelPathId: 'lbl-instagram',
    labelOffset: '50%',
    isAvailable: true,
  },
];

/* Tick marks around the outer rim (every 15°, 24 total) */
const TICKS = Array.from({ length: 24 }, (_, i) => {
  const angle = (i * 15 * Math.PI) / 180;
  const isMajor = i % 3 === 0;
  const r1 = isMajor ? 44.5 : 46.5;
  const r2 = 48.8;
  return {
    key: i,
    isMajor,
    x1: 50 + r1 * Math.sin(angle),
    y1: 50 - r1 * Math.cos(angle),
    x2: 50 + r2 * Math.sin(angle),
    y2: 50 - r2 * Math.cos(angle),
  };
});

/* LinkedIn "in" icon paths (32×32 base, centered at 0,0 after translate(-16,-16)) */
function LinkedInIcon() {
  return (
    <g>
      <rect x="1" y="1" width="30" height="30" rx="4" stroke="currentColor" strokeWidth="2.2" fill="rgba(255,255,255,0.8)" />
      <rect x="7" y="7" width="4" height="4" rx="2" fill="currentColor" />
      <rect x="7" y="14" width="4" height="12" rx="2" fill="currentColor" />
      <rect x="15" y="14" width="4" height="12" rx="2" fill="currentColor" />
      <path
        d="M19 18 C19 15.5 21 14 23.5 14 C26 14 26 16.5 26 18 L26 26"
        stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none"
      />
    </g>
  );
}

/* TikTok music-note shape */
function TikTokIcon() {
  return (
    <path
      d="M16 3 L21 3 C21 8 25.5 11 28 11.5 L28 16.5 C25.5 16.5 23 15.5 21 13.5 L21 22.5 C21 27.2 17.2 31 12.5 31 C7.8 31 4 27.2 4 22.5 C4 17.8 7.8 14 12.5 14 L12.5 19 C10.5 19 9 20.6 9 22.5 C9 24.4 10.5 26 12.5 26 C14.5 26 16 24.4 16 22.5 Z"
      fill="currentColor"
    />
  );
}

/* Instagram camera shape */
function InstagramIcon() {
  return (
    <g>
      <rect x="3" y="7" width="26" height="20" rx="4.5" stroke="currentColor" strokeWidth="2.2" fill="rgba(255,255,255,0.8)" />
      <circle cx="16" cy="17" r="5.5" stroke="currentColor" strokeWidth="2.2" fill="none" />
      <path d="M11 7 L11 4.5 L21 4.5 L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="23.5" cy="11" r="1.6" fill="currentColor" />
    </g>
  );
}

const ICON_SCALE = 0.32;
const ICON_OFFSET = -16; /* centers 32×32 icon */

const iconPositions = {
  linkedin:  { cx: 79, cy: 33 },
  tiktok:    { cx: 50, cy: 83 },
  instagram: { cx: 21, cy: 33 },
};

export default function PlatformSelectView({
  noticeMessage,
  selectedPlatform,
  onBack,
  onSelectPlatform,
}) {
  const [hoveredPlatform, setHoveredPlatform] = useState(null);
  const activePlatformId = hoveredPlatform ?? selectedPlatform ?? 'linkedin';
  const activePlatform =
    platformOptions.find((p) => p.id === activePlatformId) ?? platformOptions[0];

  return (
    <section className="platforms">
      <div className="platforms__panel">
        <div className="platforms__intro">
          <span className="platforms__eyebrow">Selector de plataforma</span>
          <h1 className="platforms__title">Elegí el destino</h1>
          <p className="platforms__text">
            Seleccioná un segmento del radial. LinkedIn e Instagram están
            operativos; TikTok se habilitará próximamente.
          </p>
          {noticeMessage ? <p className="app__notice app__notice--info">{noticeMessage}</p> : null}
        </div>

        <div className="platforms__arena">
          <div className="platforms__wheel" aria-label="Selector radial de plataforma">

            {/* ── Slice buttons ── */}
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

            {/* ── SVG overlay: rings, dividers, ticks, icons, labels ── */}
            <svg
              className="platforms__labels"
              viewBox="0 0 100 100"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Curved text paths — equal-thirds, r=40 */}
                <path id="lbl-linkedin"  d="M 70 15 A 40 40 0 0 1 90 50" />
                <path id="lbl-tiktok"   d="M 30 85 A 40 40 0 0 0 70 85" />
                <path id="lbl-instagram" d="M 11 60 A 40 40 0 0 1 40 11" />
              </defs>

              {/* Outer decorative ring */}
              <circle className="platforms__outerRing" cx="50" cy="50" r="48.5" />

              {/* Inner hub ring */}
              <circle className="platforms__innerRing" cx="50" cy="50" r="19.5" />

              {/* Segment dividers (at 0°, 120°, 240° clockwise from top) */}
              <line className="platforms__divider" x1="50" y1="50" x2="50"  y2="1.5" />
              <line className="platforms__divider" x1="50" y1="50" x2="93.3" y2="75" />
              <line className="platforms__divider" x1="50" y1="50" x2="6.7"  y2="75" />

              {/* Tick marks */}
              {TICKS.map((t) => (
                <line
                  key={t.key}
                  className={t.isMajor ? 'platforms__tick--major' : 'platforms__tick--minor'}
                  x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                />
              ))}

              {/* Platform icons */}
              {platformOptions.map((platform) => {
                const { cx, cy } = iconPositions[platform.id];
                const isActive = activePlatformId === platform.id;
                return (
                  <g
                    key={platform.id}
                    className={`platforms__icon platforms__icon--${platform.id}`}
                    style={{ color: isActive ? 'rgba(20,21,31,0.85)' : 'rgba(20,21,31,0.4)' }}
                    transform={`translate(${cx},${cy}) scale(${ICON_SCALE}) translate(${ICON_OFFSET},${ICON_OFFSET})`}
                  >
                    {platform.id === 'linkedin'  && <LinkedInIcon />}
                    {platform.id === 'tiktok'    && <TikTokIcon />}
                    {platform.id === 'instagram' && <InstagramIcon />}
                  </g>
                );
              })}

              {/* Curved platform name labels */}
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

            {/* ── Hub center ── */}
            <div className="platforms__hub">
              <span className="platforms__coreLabel">destino</span>
              <strong className="platforms__coreValue">{activePlatform.name}</strong>
              <span className="platforms__hubStatus">{activePlatform.status}</span>
              <span className="platforms__action">
                {activePlatform.isAvailable ? 'Iniciar sesión' : 'En desarrollo'}
              </span>
            </div>
          </div>
        </div>

        <div className="platforms__footer">
          <button className="platforms__backButton" type="button" onClick={onBack}>
            ← Volver
          </button>
        </div>
      </div>
    </section>
  );
}
