import Flag from "./Flag";
import { useLang } from "../lib/i18n";

interface LandingProps {
  onStart: () => void;
  loading: boolean;
}

const FLAG_CODES = ["JP", "BR", "NG", "SE", "IN", "MX", "EG", "KR"];

export default function Landing({ onStart, loading }: LandingProps) {
  const { t } = useLang();
  return (
    <div className="landing">
      <div className="landing-flags">
        {FLAG_CODES.map((code) => (
          <Flag key={code} code={code} size={26} />
        ))}
      </div>
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
      <div className="steps">
        <div className="step">
          <span className="step-emoji">🤔</span>
          <strong>{t("step1Title")}</strong>
          <span>{t("step1Sub")}</span>
        </div>
        <div className="step">
          <span className="step-emoji">🧬</span>
          <strong>{t("step2Title")}</strong>
          <span>{t("step2Sub")}</span>
        </div>
        <div className="step">
          <span className="step-emoji">🗺️</span>
          <strong>{t("step3Title")}</strong>
          <span>{t("step3Sub")}</span>
        </div>
      </div>
    </div>
  );
}
