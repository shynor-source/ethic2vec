import Flag from "./Flag";
import { useLang } from "../lib/i18n";
import { COUNTRY_META } from "../lib/countryMeta";

interface LandingProps {
  onStart: () => void;
  loading: boolean;
  waking: boolean;
  error: string | null;
}

const MARQUEE_CODES = [
  "JP", "BR", "NG", "SE", "IN", "MX", "EG", "KR",
  "US", "VN", "FR", "DE", "GB", "CN", "AU", "CA",
];

function MarqueeRow({ codes, reverse }: { codes: string[]; reverse?: boolean }) {
  const items = [...codes, ...codes];
  return (
    <div className="marquee">
      <div className={reverse ? "marquee-track reverse" : "marquee-track"}>
        {items.map((code, i) => (
          <span key={`${code}-${i}`} className="marquee-flag" title={COUNTRY_META[code]?.name}>
            <Flag code={code} size={30} />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Landing({ onStart, loading, waking, error }: LandingProps) {
  const { t } = useLang();
  return (
    <div className="landing">
      <div className="mesh" aria-hidden="true">
        <span className="blob blob-a" />
        <span className="blob blob-b" />
        <span className="blob blob-c" />
      </div>
      <MarqueeRow codes={MARQUEE_CODES.slice(0, 8)} />
      <p className="landing-kicker">{t("landingKicker")}</p>
      <h1 className="landing-title">
        {t("landingTitleA")}
        <br />
        {t("landingTitleB")} <span className="highlight">{t("landingTitleYou")}</span>?
      </h1>
      <p className="landing-sub">{t("landingSub")}</p>
      <button type="button" className="cta" onClick={onStart} disabled={loading}>
        {loading ? t("loadingDilemmas") : t("startCta")}
      </button>
      {waking && <p className="muted waking">{t("wakingServer")}</p>}
      {error && !loading && <p className="error">{error}</p>}
      <div className="stats">
        <div className="stat">
          <strong>6</strong>
          <span>{t("statsDilemmas")}</span>
        </div>
        <div className="stat">
          <strong>139</strong>
          <span>{t("statsCountries")}</span>
        </div>
        <div className="stat">
          <strong>30</strong>
          <span>{t("statsGroups")}</span>
        </div>
      </div>
      <MarqueeRow codes={MARQUEE_CODES.slice(8)} reverse />
      <div className="steps">
        <div className="step glass">
          <span className="step-emoji">🤔</span>
          <strong>{t("step1Title")}</strong>
          <span>{t("step1Sub")}</span>
        </div>
        <div className="step glass">
          <span className="step-emoji">🧬</span>
          <strong>{t("step2Title")}</strong>
          <span>{t("step2Sub")}</span>
        </div>
        <div className="step glass">
          <span className="step-emoji">🗺️</span>
          <strong>{t("step3Title")}</strong>
          <span>{t("step3Sub")}</span>
        </div>
      </div>
    </div>
  );
}
