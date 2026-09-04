import { COUNTRY_META } from "./countryMeta";
import type { RadarPoint } from "./api";

export function countryName(code: string): string {
  return COUNTRY_META[code]?.name ?? code;
}

export function countryFlag(code: string): string {
  return COUNTRY_META[code]?.flag ?? "🏳️";
}

const SCENARIO_EMOJI: Record<string, string> = {
  Age: "👵",
  Fitness: "💪",
  Gender: "👩",
  "Social Status": "💼",
  Species: "🐶",
  Utilitarian: "👥",
};

export function scenarioEmoji(scenarioType?: string): string {
  if (!scenarioType) return "🤔";
  return SCENARIO_EMOJI[scenarioType] ?? "🤔";
}

const DIMENSION_LABELS: Record<string, { emoji: string; label: string }> = {
  Age_Old: { emoji: "👴", label: "the elderly" },
  Age_Young: { emoji: "🧒", label: "the young" },
  Fitness_Fat: { emoji: "🦥", label: "plus-sized people" },
  Fitness_Fit: { emoji: "🏃", label: "athletic people" },
  Gender_Female: { emoji: "👩", label: "women" },
  Gender_Male: { emoji: "👨", label: "men" },
  "Social Status_High": { emoji: "🤵", label: "high-status people" },
  "Social Status_Low": { emoji: "🧑‍🌾", label: "low-status people" },
  Species_Hoomans: { emoji: "🧍", label: "humans" },
  Species_Pets: { emoji: "🐶", label: "pets" },
  Utilitarian_Less: { emoji: "🧍", label: "smaller groups" },
  Utilitarian_More: { emoji: "👥", label: "larger groups" },
};

export function dimensionInfo(dimension: string): {
  emoji: string;
  label: string;
} {
  return DIMENSION_LABELS[dimension] ?? { emoji: "❓", label: dimension };
}

const DEMO_DIMENSION_LABELS: Record<string, string> = {
  age_group: "Age",
  education: "Education",
  gender: "Gender",
  income: "Income",
  political: "Politics",
  religious: "Faith",
};

const DEMO_GROUP_LABELS: Record<string, string> = {
  underHigh: "below high school",
  female: "women",
  male: "men",
  not_religious: "non-religious",
  somewhat: "somewhat religious",
  very: "very religious",
  above100000: "over $100k",
  over10000: "over $10k",
};

function prettifyGroup(group: string): string {
  if (DEMO_GROUP_LABELS[group]) return DEMO_GROUP_LABELS[group];
  if (/^\d+$/.test(group)) return `around $${group}`;
  if (/^\d+-\d+$/.test(group)) return group;
  return group.replace(/_/g, " ");
}

export function humanizeDemoGroup(key: string): string {
  const [dimension, ...rest] = key.split("_");
  const group = rest.join("_");
  const dimLabel = DEMO_DIMENSION_LABELS[dimension] ?? dimension;
  return `${dimLabel}: ${prettifyGroup(group)}`;
}

const AXIS_TOPICS: Record<string, string> = {
  Age: "age",
  Fitness: "physical fitness",
  Gender: "gender",
  "Social Status": "social status",
  Species: "humans versus pets",
  Utilitarian: "saving the many versus the few",
};

export function traitSentences(radar: RadarPoint[]): string[] {
  const sentences: string[] = [];
  for (const point of radar) {
    const topic = AXIS_TOPICS[point.subject] ?? point.subject.toLowerCase();
    if (point.user >= 0.75) {
      sentences.push(
        `You almost always step in when ${topic} is on the line.`,
      );
    } else if (point.user <= 0.25) {
      sentences.push(
        `You usually hold back when ${topic} is on the line.`,
      );
    }
  }
  if (sentences.length === 0) {
    sentences.push("You weigh each dilemma on its own — no single rule runs you.");
  }
  return sentences.slice(0, 4);
}

export function friendlyBlindSpot(dimension: string, note: string): string {
  const { emoji, label } = dimensionInfo(dimension);
  const direction = note.includes("less often") ? "less" : "more";
  return `${emoji} ${label}: you step in ${direction} often than most of the world.`;
}

export function shareText(
  matchName: string,
  score: number,
  topCountries: { label?: string; country?: string; score: number }[],
): string {
  const names = topCountries
    .slice(0, 3)
    .map((c) => countryName(c.country ?? c.label ?? ""))
    .join(", ");
  return (
    `My moral twin is ${countryName(matchName)} ${countryFlag(matchName)} ` +
    `(${score}% match) according to Ethic2Vec! Runner-ups: ${names}. ` +
    `Which country thinks like you?`
  );
}
