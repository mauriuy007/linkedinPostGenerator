export default function SectionHeader({ eyebrow, title }) {
  return (
    <>
      <span className="landing__sectionEyebrow">{eyebrow}</span>
      <h2 className="landing__sectionTitle">{title}</h2>
    </>
  );
}
