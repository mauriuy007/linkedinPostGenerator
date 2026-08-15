import SectionHeader from '../shared/SectionHeader.jsx';
import { benefits } from './landing.content.js';

export default function BenefitsSection() {
  return (
    <section className="landing__section">
      <div className="landing__sectionInner">
        <SectionHeader eyebrow="Why Auto Post" title="Stop juggling five different apps" />

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
  );
}
