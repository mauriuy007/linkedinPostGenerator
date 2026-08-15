export default function HomeView({ onStart, authMessage, id }) {
  return (
    <section className="home" id={id}>
      <div className="home__content">
        {authMessage ? <p className="app__notice app__notice--error">{authMessage}</p> : null}

        <div className="home__badge">
          Auto Post — v1.0
        </div>

        <h1 className="home__title">
          Create.<br />
          <em>Publish.</em>
        </h1>

        <p className="home__subtitle">
          Choose a platform and generate content with AI
        </p>

        <button className="home__cta" type="button" onClick={onStart}>
          Get started
          <span className="home__cta-arrow">→</span>
        </button>
      </div>
    </section>
  );
}
