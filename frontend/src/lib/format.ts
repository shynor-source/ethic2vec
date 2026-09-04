import { COUNTRY_META } from "./countryMeta";
import type { BlindSpot, RadarPoint } from "./api";
import type { Lang } from "./i18n";

export function countryName(code: string): string {
  return COUNTRY_META[code]?.name ?? code;
}

export function flagUrl(code: string): string {
  const iso2 = COUNTRY_META[code]?.iso2;
  if (!iso2) return "";
  return `/flags/${iso2.toLowerCase()}.png`;
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

interface DimensionInfo {
  emoji: string;
  en: string;
  vi: string;
}

const DIMENSION_LABELS: Record<string, DimensionInfo> = {
  Age_Old: { emoji: "👴", en: "the elderly", vi: "người cao tuổi" },
  Age_Young: { emoji: "🧒", en: "the young", vi: "người trẻ" },
  Fitness_Fat: { emoji: "🦥", en: "plus-sized people", vi: "người ngoại cỡ" },
  Fitness_Fit: { emoji: "🏃", en: "athletic people", vi: "người khỏe mạnh" },
  Gender_Female: { emoji: "👩", en: "women", vi: "phụ nữ" },
  Gender_Male: { emoji: "👨", en: "men", vi: "đàn ông" },
  "Social Status_High": {
    emoji: "🤵",
    en: "high-status people",
    vi: "người địa vị cao",
  },
  "Social Status_Low": {
    emoji: "🧑‍🌾",
    en: "low-status people",
    vi: "người địa vị thấp",
  },
  Species_Hoomans: { emoji: "🧍", en: "humans", vi: "con người" },
  Species_Pets: { emoji: "🐶", en: "pets", vi: "thú cưng" },
  Utilitarian_Less: { emoji: "🧍", en: "smaller groups", vi: "nhóm ít người" },
  Utilitarian_More: { emoji: "👥", en: "larger groups", vi: "nhóm đông người" },
};

export function dimensionInfo(dimension: string): DimensionInfo {
  return (
    DIMENSION_LABELS[dimension] ?? { emoji: "❓", en: dimension, vi: dimension }
  );
}

const DEMO_DIMENSION_LABELS: Record<Lang, Record<string, string>> = {
  en: {
    age_group: "Age",
    education: "Education",
    gender: "Gender",
    income: "Income",
    political: "Politics",
    religious: "Faith",
  },
  vi: {
    age_group: "Tuổi",
    education: "Học vấn",
    gender: "Giới tính",
    income: "Thu nhập",
    political: "Chính trị",
    religious: "Tín ngưỡng",
  },
};

const DEMO_GROUP_LABELS: Record<Lang, Record<string, string>> = {
  en: {
    underHigh: "below high school",
    female: "women",
    male: "men",
    not_religious: "non-religious",
    somewhat: "somewhat religious",
    very: "very religious",
    above100000: "over $100k",
    over10000: "over $10k",
  },
  vi: {
    underHigh: "dưới THPT",
    female: "nữ",
    male: "nam",
    not_religious: "vô thần",
    somewhat: "tín ngưỡng vừa",
    very: "rất sùng đạo",
    above100000: "trên $100k",
    over10000: "trên $10k",
    high: "THPT",
    college: "cao đẳng",
    vocational: "trung cấp nghề",
    bachelor: "cử nhân",
    graduate: "sau đại học",
    others: "khác",
    conservative: "bảo thủ",
    moderate: "ôn hòa",
    progressive: "cấp tiến",
  },
};

function prettifyGroup(lang: Lang, group: string): string {
  const override = DEMO_GROUP_LABELS[lang][group];
  if (override) return override;
  if (/^\d+$/.test(group)) return lang === "vi" ? `khoảng $${group}` : `around $${group}`;
  if (/^\d+-\d+$/.test(group)) return group;
  const pretty = group.replace(/_/g, " ");
  if (lang === "en") return pretty;
  const EN_TO_VI: Record<string, string> = {
    high: "THPT",
    college: "cao đẳng",
    vocational: "trung cấp nghề",
    bachelor: "cử nhân",
    graduate: "sau đại học",
    others: "khác",
  };
  return EN_TO_VI[group] ?? pretty;
}

export function humanizeDemoGroup(lang: Lang, key: string): string {
  const [dimension, ...rest] = key.split("_");
  const group = rest.join("_");
  const dimLabel = DEMO_DIMENSION_LABELS[lang][dimension] ?? dimension;
  return `${dimLabel}: ${prettifyGroup(lang, group)}`;
}

const AXIS_TOPICS: Record<Lang, Record<string, string>> = {
  en: {
    Age: "age",
    Fitness: "physical fitness",
    Gender: "gender",
    "Social Status": "social status",
    Species: "humans versus pets",
    Utilitarian: "saving the many versus the few",
  },
  vi: {
    Age: "tuổi tác",
    Fitness: "thể chất",
    Gender: "giới tính",
    "Social Status": "địa vị xã hội",
    Species: "con người hay thú cưng",
    Utilitarian: "cứu nhiều người hay ít người",
  },
};

export function traitSentences(lang: Lang, radar: RadarPoint[]): string[] {
  const topics = AXIS_TOPICS[lang];
  const sentences: string[] = [];
  for (const point of radar) {
    const topic = topics[point.subject] ?? point.subject.toLowerCase();
    if (point.user >= 0.75) {
      sentences.push(
        lang === "vi"
          ? `Bạn gần như luôn can thiệp khi ${topic} bị đe dọa.`
          : `You almost always step in when ${topic} is on the line.`,
      );
    } else if (point.user <= 0.25) {
      sentences.push(
        lang === "vi"
          ? `Bạn thường đứng ngoài khi ${topic} bị đe dọa.`
          : `You usually hold back when ${topic} is on the line.`,
      );
    }
  }
  if (sentences.length === 0) {
    sentences.push(
      lang === "vi"
        ? "Bạn cân nhắc từng tình huống — không quy tắc nào chi phối bạn."
        : "You weigh each dilemma on its own — no single rule runs you.",
    );
  }
  return sentences.slice(0, 4);
}

const SCENARIO_NAMES: Record<Lang, Record<string, string>> = {
  en: {
    Age: "Age",
    Fitness: "Fitness",
    Gender: "Gender",
    "Social Status": "Status",
    Species: "Species",
    Utilitarian: "Numbers",
  },
  vi: {
    Age: "Tuổi tác",
    Fitness: "Thể chất",
    Gender: "Giới tính",
    "Social Status": "Địa vị",
    Species: "Giống loài",
    Utilitarian: "Số lượng",
  },
};

export function scenarioName(lang: Lang, scenarioType?: string): string {
  if (!scenarioType) return "";
  return SCENARIO_NAMES[lang][scenarioType] ?? scenarioType;
}

export interface BlindSpotCard {
  title: string;
  verdict: string;
  userPct: number | null;
  matchPct: number | null;
  globalPct: number | null;
}

export function blindSpotCard(
  lang: Lang,
  spot: BlindSpot,
  twinName: string,
): BlindSpotCard {
  const info = dimensionInfo(spot.dimension);
  const label = lang === "vi" ? info.vi : info.en;
  const title = `${info.emoji} ${label}`;
  const userPct = spot.user_pct ?? null;
  const matchPct = spot.match_pct ?? null;
  let verdict = spot.note ?? "";
  if (userPct !== null && matchPct !== null) {
    if (userPct > matchPct) {
      verdict =
        lang === "vi"
          ? `Bạn ra tay cứu giúp ở nơi ${twinName} thường đứng nhìn.`
          : `You step in where ${twinName} holds back.`;
    } else if (userPct < matchPct) {
      verdict =
        lang === "vi"
          ? `Bạn đứng nhìn ở nơi ${twinName} sẽ ra tay cứu giúp.`
          : `You hold back where ${twinName} would step in.`;
    } else {
      verdict =
        lang === "vi"
          ? `Bạn và ${twinName} đồng thuận ở đây — nhưng cả hai đều lệch khỏi thế giới.`
          : `You and ${twinName} agree here — but both differ from the world.`;
    }
  }
  return {
    title,
    verdict,
    userPct,
    matchPct,
    globalPct: spot.global_pct ?? null,
  };
}

export function shareText(
  lang: Lang,
  matchName: string,
  score: number,
  topCountries: { label?: string; country?: string; score: number }[],
): string {
  const names = topCountries
    .slice(0, 3)
    .map((c) => countryName(c.country ?? c.label ?? ""))
    .join(", ");
  if (lang === "vi") {
    return (
      `Bản sao đạo đức của mình là ${countryName(matchName)} (${score}% tương đồng) ` +
      `theo Ethic2Vec! Xếp sau: ${names}. ` +
      `Quốc gia nào nghĩ giống bạn?`
    );
  }
  return (
    `My moral twin is ${countryName(matchName)} (${score}% match) ` +
    `according to Ethic2Vec! Runner-ups: ${names}. ` +
    `Which country thinks like you?`
  );
}
