import { useCallback, useEffect, useState } from "react";
import Landing from "./components/Landing";
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

type Stage = "landing" | "quiz" | "loading-result" | "result";

export default function App() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [answers, setAnswers] = useState<Record<string, Choice>>({});
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState<Stage>("landing");
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
      setStep(0);
      setResult(null);
    } catch {
      setError("Could not load scenarios. Check your connection and retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadScenarios();
  }, [loadScenarios]);

  const handleStart = () => {
    if (scenarios.length > 0) {
      setStage("quiz");
    } else {
      void loadScenarios().then(() => setStage("quiz"));
    }
  };

  const handleRestart = () => {
    void loadScenarios();
    setStage("landing");
  };

  const handleSubmit = async () => {
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

  const current = scenarios[step];

  return (
    <main className="page">
      {stage === "landing" && (
        <Landing onStart={handleStart} loading={loading} />
      )}

      {stage === "quiz" && current && (
        <QuizCard
          scenario={current}
          index={step}
          total={scenarios.length}
          selected={answers[current.outcome_id]}
          onSelect={(choice) =>
            setAnswers((prev) => ({ ...prev, [current.outcome_id]: choice }))
          }
          onBack={() => setStep((s) => Math.max(0, s - 1))}
          onNext={() => {
            if (step === scenarios.length - 1) void handleSubmit();
            else setStep((s) => s + 1);
          }}
          isFirst={step === 0}
          isLast={step === scenarios.length - 1}
        />
      )}

      {stage === "loading-result" && (
        <div className="analyzing">
          <div className="spinner">🧠</div>
          <h2>Reading your moral compass…</h2>
          <p className="muted">Comparing you with 228 countries.</p>
        </div>
      )}

      {stage === "result" && result && (
        <ResultsView result={result} onRestart={handleRestart} />
      )}

      {error && stage !== "landing" && <p className="error">{error}</p>}
    </main>
  );
}
