import HomeView from './HomeView.jsx';

const highlights = [
  {
    title: 'One place to create',
    description: "Write your idea once and let AI adapt it to each platform's tone and format.",
  },
  {
    title: 'Every platform, centralized',
    description: 'LinkedIn, Instagram, and more — manage all your content from a single workflow.',
  },
  {
    title: 'Publish in one click',
    description: 'Connect your accounts once and post directly, with no more switching between apps.',
  },
];

const benefits = [
  {
    title: 'No more copy-pasting',
    description: 'Stop rewriting the same idea for every platform. Write it once, everywhere else follows.',
  },
  {
    title: 'Tone-matched by AI',
    description: 'Gemini adapts your message to fit the voice and format each platform expects.',
  },
  {
    title: 'Secure by design',
    description: 'Every account connects through official OAuth logins — we never see your passwords.',
  },
  {
    title: 'Built to grow',
    description: 'More platforms are on the way, all from the same single workflow.',
  },
];

const steps = [
  {
    title: 'Describe your idea',
    description: 'Add context, tone, and an optional reference image.',
  },
  {
    title: 'AI generates your post',
    description: 'Gemini writes platform-ready copy in seconds.',
  },
  {
    title: 'Review and publish',
    description: 'Preview the result and post it directly to your connected account.',
  },
];

export default function LandingView({ onStart, authMessage }) {
  return (
    <div className="landing">
      <section className="landing__hero">
        <div className="landing__heroContent">
          <div className="landing__badge">The all-in-one content hub</div>

          <h1 className="landing__title">
            All your content.<br />
            <em>One platform.</em>
          </h1>

          <p className="landing__subtitle">
            Auto Post centralizes content creation for every social platform you use.
            Write your idea once, generate it with AI, and publish it everywhere —
            without juggling a different tool for each network.
          </p>

          <div className="landing__highlights">
            {highlights.map((item) => (
              <div className="landing__highlight" key={item.title}>
                <span className="landing__highlightTitle">{item.title}</span>
                <p className="landing__highlightText">{item.description}</p>
              </div>
            ))}
          </div>

          <a className="landing__cta" href="#get-started">
            See how it works
            <span className="landing__cta-arrow">↓</span>
          </a>
        </div>

        <a className="landing__scrollHint" href="#get-started" aria-label="Scroll down">
          <span className="landing__scrollHintArrow">↓</span>
          Scroll to learn more
        </a>
      </section>

      <section className="landing__section">
        <div className="landing__sectionInner">
          <span className="landing__sectionEyebrow">Why Auto Post</span>
          <h2 className="landing__sectionTitle">Stop juggling five different apps</h2>

          <div className="landing__benefits">
            {benefits.map((item) => (
              <div className="landing__benefit" key={item.title}>
                <span className="landing__benefitTitle">{item.title}</span>
                <p className="landing__benefitText">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing__section landing__section--alt">
        <div className="landing__sectionInner">
          <span className="landing__sectionEyebrow">How it works</span>
          <h2 className="landing__sectionTitle">From idea to published post in three steps</h2>

          <div className="landing__steps">
            {steps.map((item, index) => (
              <div className="landing__step" key={item.title}>
                <span className="landing__stepNumber">{index + 1}</span>
                <span className="landing__stepTitle">{item.title}</span>
                <p className="landing__stepText">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeView id="get-started" onStart={onStart} authMessage={authMessage} />
    </div>
  );
}
