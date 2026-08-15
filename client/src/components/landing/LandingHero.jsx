import { highlights } from './landing.content.js';

export default function LandingHero() {
  return (
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
  );
}
