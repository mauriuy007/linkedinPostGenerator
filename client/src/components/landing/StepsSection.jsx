import SectionHeader from '../shared/SectionHeader.jsx';
import { steps } from './landing.content.js';

export default function StepsSection() {
  return (
    <section className="landing__section landing__section--alt">
      <div className="landing__sectionInner">
        <SectionHeader eyebrow="How it works" title="From idea to published post in three steps" />

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
  );
}
