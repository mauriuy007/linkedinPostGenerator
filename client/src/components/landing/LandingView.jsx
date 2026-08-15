import BenefitsSection from './BenefitsSection.jsx';
import HomeView from './HomeView.jsx';
import LandingHero from './LandingHero.jsx';
import StepsSection from './StepsSection.jsx';

export default function LandingView({ onStart, authMessage }) {
  return (
    <div className="landing">
      <LandingHero />
      <BenefitsSection />
      <StepsSection />
      <HomeView id="get-started" onStart={onStart} authMessage={authMessage} />
    </div>
  );
}
