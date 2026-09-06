import type { Choice, Scenario, Strength } from "../lib/api";
import { scenarioEmoji, scenarioName } from "../lib/format";
import { useLang } from "../lib/i18n";

interface QuizCardProps {
  scenario: Scenario;
  index: number;
  total: number;
  selectedChoice?: Choice;
  selectedStrength?: Strength;
  onSelectChoice: (choice: Choice) => void;
  onSelectStrength: (strength: Strength) => void;
  onBack: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function QuizCard({
  scenario,
  index,
  total,
  selectedChoice,
  selectedStrength,
  onSelectChoice,
  onSelectStrength,
  onBack,
  onNext,
  isFirst,
  isLast,
}: QuizCardProps) {
  const { lang, t } = useLang();
  const textA =
    lang === "vi" ? (scenario.choice_a_vi ?? scenario.choice_a) : scenario.choice_a;
  const textB =
    lang === "vi" ? (scenario.choice_b_vi ?? scenario.choice_b) : scenario.choice_b;
  const emojiA = scenario.side_a_emoji ?? "🅰️";
  const emojiB = scenario.side_b_emoji ?? "🅱️";
  const context =
    lang === "vi"
      ? (scenario.context_vi ?? scenario.context_en)
      : (scenario.context_en ?? scenario.context_vi);
  const answered = selectedChoice !== undefined && selectedStrength !== undefined;
  const progress = Math.round(((index + (answered ? 1 : 0)) / total) * 100);

  return (
    <section className="quiz">
      <div className="quiz-top">
        <span className="muted">
          {t("dilemmaOf")} {index + 1} {t("dilemmaOfTotal")} {total}
        </span>
        <span className="tag">
          {scenarioEmoji(scenario.scenario_type)}{" "}
          {scenarioName(lang, scenario.scenario_type)}
        </span>
      </div>
      <div className="progress thick">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <h2 className="dilemma-title">{t("dilemmaTitle")}</h2>
      {context && <p className="dilemma-context">📜 {context}</p>}
      <div className="vs-grid">
        <button
          type="button"
          className={selectedChoice === "A" ? "vs-card selected" : "vs-card"}
          onClick={() => onSelectChoice("A")}
        >
          <span className="vs-emoji">{emojiA}</span>
          <span className="vs-text">{textA}</span>
          <span className="vs-key">A</span>
        </button>
        <div className="vs-badge">VS</div>
        <button
          type="button"
          className={selectedChoice === "B" ? "vs-card selected" : "vs-card"}
          onClick={() => onSelectChoice("B")}
        >
          <span className="vs-emoji">{emojiB}</span>
          <span className="vs-text">{textB}</span>
          <span className="vs-key">B</span>
        </button>
      </div>
      {selectedChoice !== undefined && (
        <div className="strength">
          <span className="muted">{t("strengthAsk")}</span>
          <div className="strength-row">
            <button
              type="button"
              className={
                selectedStrength === "strong" ? "pill selected" : "pill"
              }
              onClick={() => onSelectStrength("strong")}
            >
              {t("intensitySure")}
            </button>
            <button
              type="button"
              className={selectedStrength === "lean" ? "pill selected" : "pill"}
              onClick={() => onSelectStrength("lean")}
            >
              {t("intensityLean")}
            </button>
          </div>
        </div>
      )}
      <div className="quiz-nav">
        <button
          type="button"
          className="ghost"
          onClick={onBack}
          disabled={isFirst}
        >
          {t("back")}
        </button>
        <button
          type="button"
          className="primary"
          onClick={onNext}
          disabled={!answered}
        >
          {isLast ? t("seeResult") : t("next")}
        </button>
      </div>
    </section>
  );
}
