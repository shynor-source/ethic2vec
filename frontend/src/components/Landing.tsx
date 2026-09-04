interface LandingProps {
  onStart: () => void;
  loading: boolean;
}

export default function Landing({ onStart, loading }: LandingProps) {
  return (
    <div className="landing">
      <div className="landing-flags">🇯🇵 🇧🇷 🇳🇬 🇸🇪 🇮🇳 🇲🇽 🇪🇬 🇰🇷</div>
      <h1 className="landing-title">
        Which country
        <br />
        thinks like <span className="highlight">you</span>?
      </h1>
      <p className="landing-sub">
        Face 6 impossible driving dilemmas — the same ones scientists used to
        map the morals of 228 countries. We will find your moral twin. 🌍
      </p>
      <button type="button" className="cta" onClick={onStart} disabled={loading}>
        {loading ? "Loading dilemmas..." : "🚗 Start the test"}
      </button>
      <div className="steps">
        <div className="step">
          <span className="step-emoji">🤔</span>
          <strong>6 dilemmas</strong>
          <span>Who lives? You decide.</span>
        </div>
        <div className="step">
          <span className="step-emoji">🧬</span>
          <strong>Moral twin</strong>
          <span>Matched against 228 countries.</span>
        </div>
        <div className="step">
          <span className="step-emoji">🗺️</span>
          <strong>Explore</strong>
          <span>See yourself on the world map of morals.</span>
        </div>
      </div>
    </div>
  );
}
