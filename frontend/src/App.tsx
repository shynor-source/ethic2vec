import { useCallback, useEffect, useState } from "react";
import QuizCard from "./components/QuizCard";
import ResultsView from "./components/ResultsView";
import {
  analyzeAnswers,
  fetchRandomScenarios,
  type AnalyzeResult,
  type Answer,
  type Choice,
  type Scenario,
} from "./lib/api";
import "./App.css";

const QUESTION_COUNT = 6;

type Stage = "quiz" | "loading-result" | "result";

export default function App() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [answers, setAnswers] = useState<Record<string, Choice>>({});
  const [stage, setStage] = useState<Stage>("quiz");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadScenarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRandomScenarios(QUESTION_COUNT);
      setScenarios(data);
      setAnswers({});
      setResult(null);
      setStage("quiz");
    } catch {
      setError("Could not load scenarios. Check VITE_API_URL and retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadScenarios();
  }, [loadScenarios]);

  const answeredCount = Object.keys(answers).length;
  const canSubmit = scenarios.length > 0 && answeredCount === scenarios.length;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStage("loading-result");
    setError(null);
    const payload: Answer[] = scenarios.map((scenario) => ({
      outcome_id: scenario.outcome_id,
      dimension: scenario.dimension,
      choice: answers[scenario.outcome_id],
    }));
    try {
      const data = await analyzeAnswers(payload);
      setResult(data);
      setStage("result");
    } catch {
      setError("Analysis failed. Please retry.");
      setStage("quiz");
    }
  };

  return (
    <main className="page">
      <header className="hero">
        <h1>Ethic2Vec</h1>
        <p className="muted">
          Answer {QUESTION_COUNT} dilemmas, then compare your moral vector with
          countries and groups.
        </p>
      </header>

      {error && <p className="error">{error}</p>}

      {stage === "result" && result ? (
        <ResultsView result={result} onRestart={loadScenarios} />
      ) : (
        <>
          <div className="toolbar">
            <span className="muted">
              {answeredCount}/{scenarios.length} answered
            </span>
            <button
              type="button"
              className="ghost"
              onClick={loadScenarios}
              disabled={loading}
            >
              {loading ? "Loading..." : "New quiz"}
            </button>
          </div>

          <div className="progress">
            <div
              className="progress-bar"
              style={{
                width:
                  scenarios.length > 0
                    ? `${(answeredCount / scenarios.length) * 100}%`
                    : "0%",
              }}
            />
          </div>

          {scenarios.map((scenario, index) => (
            <QuizCard
              key={scenario.outcome_id}
              scenario={scenario}
              index={index}
              selected={answers[scenario.outcome_id]}
              onSelect={(choice) =>
                setAnswers((prev) => ({
                  ...prev,
                  [scenario.outcome_id]: choice,
                }))
              }
            />
          ))}

          <button
            type="button"
            className="primary"
            disabled={!canSubmit || stage === "loading-result"}
            onClick={handleSubmit}
          >
            {stage === "loading-result" ? "Analyzing..." : "See my result"}
          </button>
        </>
      )}
    </main>
  );
}
