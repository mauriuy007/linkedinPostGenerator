export default function LoadingOverlay({ isVisible, title, description, eyebrow }) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="overlay" role="status" aria-live="polite" aria-label="Generando post">
      <div className="loadingCard">
        <div className="loadingCard__spinner" />
        <span className="loadingCard__eyebrow">{eyebrow ?? 'Generando con Gemini'}</span>
        <h2 className="loadingCard__title">{title ?? 'Estamos armando tu post para LinkedIn'}</h2>
        <p className="loadingCard__text">
          {description ?? 'Analizando el contexto y la imagen para mostrarte una vista previa antes de publicar.'}
        </p>
      </div>
    </div>
  );
}
