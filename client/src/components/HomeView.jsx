export default function HomeView({ onStart }) {
  return (
    <section className="home">
      <button className="home__cta" type="button" onClick={onStart}>
        Empeza a crear
      </button>
    </section>
  );
}
