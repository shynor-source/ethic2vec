import type { Choice, Scenario } from "../lib/api";

interface QuizCardProps {
  scenario: Scenario;
  index: number;
  selected?: Choice;
  onSelect: (choice: Choice) => void;
}

export default function QuizCard({
  scenario,
  index,
  selected,
  onSelect,
}: QuizCardProps) {
  return (
    <section className="card">
      <header className="card-head">
        <span className="badge">
          Q{index + 1} · {scenario.dimension}
        </span>
      </header>
      <div className="choices">
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
    </section>
  );
}
