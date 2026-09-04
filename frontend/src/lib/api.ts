import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

export interface Scenario {
  dimension: string;
  outcome_id: string;
  choice_a: string;
  choice_b: string;
  scenario_type?: string;
  character_group?: string;
  country?: string;
}

export type Choice = "A" | "B";

export interface Answer {
  outcome_id: string;
  dimension: string;
  choice: Choice;
}

export interface TopMatch {
  country?: string;
  group?: string;
  label?: string;
  score: number;
}

export interface RadarPoint {
  subject: string;
  user: number;
  match: number;
}

export interface ScatterPoint {
  x: number;
  y: number;
  name: string;
  kind: "user" | "country" | "demo";
}

export interface AnalyzeResult {
  topCountries: TopMatch[];
  topDemographics: TopMatch[];
  blindSpots: string[];
  radar: RadarPoint[];
  pc12: ScatterPoint[];
  pc13: ScatterPoint[];
  matchName: string;
}

function toPercent(value: number): number {
  if (value <= 1 && value >= -1) return Math.round(value * 100);
  return Math.round(value);
}

function normalizeList(raw: unknown): TopMatch[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const entry = item as Record<string, unknown>;
    const scoreRaw =
      typeof entry.score === "number"
        ? entry.score
        : typeof entry.similarity_pct === "number"
          ? (entry.similarity_pct as number)
          : typeof entry.similarity === "number"
            ? (entry.similarity as number)
            : 0;
    return {
      country: typeof entry.country === "string" ? entry.country : undefined,
      group: typeof entry.group === "string" ? entry.group : undefined,
      label:
        typeof entry.label === "string"
          ? entry.label
          : typeof entry.country === "string"
            ? entry.country
            : typeof entry.group === "string"
              ? entry.group
              : "Unknown",
      score: toPercent(scoreRaw),
    };
  });
}

function normalizeBlindSpots(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "string") return item;
    const entry = item as Record<string, unknown>;
    const dimension =
      typeof entry.dimension === "string" ? entry.dimension : "Unknown";
    const note = typeof entry.note === "string" ? `: ${entry.note}` : "";
    return `${dimension}${note}`;
  });
}

export function normalizeAnalyzeResponse(raw: unknown): AnalyzeResult {
  const data = raw as Record<string, unknown>;
  const topCountries = normalizeList(
    data.topCountries ?? data.top_countries ?? data.countries,
  );
  const topDemographics = normalizeList(
    data.topDemographics ?? data.top_demographics ?? data.demographics,
  );
  const blindSpots = normalizeBlindSpots(
    data.blindSpots ?? data.blind_spots ?? data.moral_blind_spots,
  );
  const radar = Array.isArray(data.radar) ? (data.radar as RadarPoint[]) : [];
  const pc12 = Array.isArray(data.pc12)
    ? (data.pc12 as ScatterPoint[])
    : Array.isArray(data.scatter_pc12)
      ? (data.scatter_pc12 as ScatterPoint[])
      : [];
  const pc13 = Array.isArray(data.pc13)
    ? (data.pc13 as ScatterPoint[])
    : Array.isArray(data.scatter_pc13)
      ? (data.scatter_pc13 as ScatterPoint[])
      : [];
  const matchName =
    typeof data.matchName === "string"
      ? data.matchName
      : (topCountries[0]?.country ?? topCountries[0]?.label ?? "Top match");
  return {
    topCountries,
    topDemographics,
    blindSpots,
    radar,
    pc12,
    pc13,
    matchName,
  };
}

export async function fetchRandomScenarios(n = 6): Promise<Scenario[]> {
  const response = await api.get("/api/scenarios/random", { params: { n } });
  const payload = response.data;
  if (Array.isArray(payload)) return payload as Scenario[];
  if (Array.isArray((payload as { scenarios?: unknown }).scenarios)) {
    return (payload as { scenarios: Scenario[] }).scenarios;
  }
  return [];
}

export async function analyzeAnswers(
  answers: Answer[],
): Promise<AnalyzeResult> {
  const response = await api.post("/api/analyze", { answers });
  return normalizeAnalyzeResponse(response.data);
}
