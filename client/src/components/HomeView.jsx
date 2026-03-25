export default function HomeView({ onStart, authMessage }) {
  return (
    <section className="home">
      <div className="home__content">
        {authMessage ? <p className="app__notice app__notice--error">{authMessage}</p> : null}
        <button className="home__cta" type="button" onClick={onStart}>
          Empeza a crear
        </button>
      </div>
    </section>
  );
}
