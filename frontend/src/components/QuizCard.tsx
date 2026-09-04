import type { Choice, Scenario } from "../lib/api";
import { scenarioEmoji } from "../lib/format";
import { useLang } from "../lib/i18n";

interface QuizCardProps {
  scenario: Scenario;
  index: number;
  total: number;
  selected?: Choice;
  onSelect: (choice: Choice) => void;
  onBack: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function QuizCard({
  scenario,
  index,
  total,
  selected,
  onSelect,
  onBack,
  onNext,
  isFirst,
  isLast,
}: QuizCardProps) {
  const { t } = useLang();
  return (
    <section className="quiz">
      <div className="quiz-top">
        <span className="muted">
          {t("dilemmaOf")} {index + 1} {t("dilemmaOfTotal")} {total}
        </span>
        <div className="dots">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={i < index ? "dot done" : i === index ? "dot now" : "dot"}
            />
          ))}
        </div>
      </div>
      <div className="dilemma-emoji">{scenarioEmoji(scenario.scenario_type)}</div>
      <h2 className="dilemma-title">{t("dilemmaTitle")}</h2>
      <div className="choices big">
        <button
          type="button"
          className={selected === "A" ? "choice selected" : "choice"}
          onClick={() => onSelect("A")}
        >
          <span className="choice-tag">A</span>
          <span>{scenario.choice_a}</span>
        </button>
        <button
          type="button"
          className={selected === "B" ? "choice selected" : "choice"}
          onClick={() => onSelect("B")}
        >
          <span className="choice-tag">B</span>
          <span>{scenario.choice_b}</span>
        </button>
      </div>
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
          disabled={!selected}
        >
          {isLast ? t("seeResult") : t("next")}
        </button>
      </div>
    </section>
  );
}
