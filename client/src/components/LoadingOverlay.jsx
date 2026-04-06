export default function LoadingOverlay({ isVisible }) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="overlay" role="status" aria-live="polite" aria-label="Generando post">
      <div className="loadingCard">
        <div className="loadingCard__spinner" />
        <span className="loadingCard__eyebrow">Generando con Gemini</span>
        <h2 className="loadingCard__title">Estamos armando tu post para LinkedIn</h2>
        <p className="loadingCard__text">
          Analizando el contexto y la imagen para mostrarte una vista previa antes de publicar.
        </p>
      </div>
    </div>
  );
}
