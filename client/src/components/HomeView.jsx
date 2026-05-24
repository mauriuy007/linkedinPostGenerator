export default function HomeView({ onStart, authMessage }) {
  return (
    <section className="home">
      <div className="home__content">
        {authMessage ? <p className="app__notice app__notice--error">{authMessage}</p> : null}

        <div className="home__badge">
          Auto Post — v1.0
        </div>

        <h1 className="home__title">
          Creá.<br />
          <em>Publicá.</em>
        </h1>

        <p className="home__subtitle">
          Seleccioná una plataforma y generá contenido con IA
        </p>

        <button className="home__cta" type="button" onClick={onStart}>
          Comenzar
          <span className="home__cta-arrow">→</span>
        </button>
      </div>
    </section>
  );
}
