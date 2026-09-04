import { useCallback, useEffect, useMemo, useState } from "react";
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
import { LangContext, translate, type Lang } from "./lib/i18n";
import "./App.css";

const QUESTION_COUNT = 6;
const LANG_KEY = "e2v-lang";

type Stage = "landing" | "quiz" | "loading-result" | "result";

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "vi" || saved === "en") return saved;
    if (navigator.language.toLowerCase().startsWith("vi")) return "vi";
  } catch {
    /* ignore storage errors */
  }
  return "en";
}

export default function App() {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [answers, setAnswers] = useState<Record<string, Choice>>({});
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState<Stage>("landing");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<"loadError" | "analyzeError" | null>(
    null,
  );

  const t = useMemo(
    () => (key: Parameters<typeof translate>[1]) => translate(lang, key),
    [lang],
  );

  const changeLang = (next: Lang) => {
    setLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      /* ignore storage errors */
    }
  };

  const loadScenarios = useCallback(async () => {
    setLoading(true);
    setErrorKey(null);
    try {
      const data = await fetchRandomScenarios(QUESTION_COUNT);
      setScenarios(data);
      setAnswers({});
      setStep(0);
      setResult(null);
    } catch {
      setErrorKey("loadError");
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
    setErrorKey(null);
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
      setErrorKey("analyzeError");
      setStage("quiz");
    }
  };

  const current = scenarios[step];
  const wide = stage === "result";

  return (
    <LangContext.Provider value={{ lang, setLang: changeLang, t }}>
      <header className="topbar">
        <span className="brand">🧭 Ethic2Vec</span>
        <div className="lang-toggle" role="group" aria-label="Language">
          <button
            type="button"
            className={lang === "vi" ? "active" : ""}
            onClick={() => changeLang("vi")}
          >
            🇻🇳 VI
          </button>
          <button
            type="button"
            className={lang === "en" ? "active" : ""}
            onClick={() => changeLang("en")}
          >
            🇺🇸 EN
          </button>
        </div>
      </header>
      <main className={wide ? "page wide" : "page"}>
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
            <h2>{t("analyzingTitle")}</h2>
            <p className="muted">{t("analyzingSub")}</p>
          </div>
        )}

        {stage === "result" && result && (
          <ResultsView result={result} onRestart={handleRestart} />
        )}

        {errorKey && stage !== "landing" && <p className="error">{t(errorKey)}</p>}
      </main>
    </LangContext.Provider>
  );
}
