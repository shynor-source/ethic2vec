import { createContext, useContext } from "react";

export type Lang = "en" | "vi";

const STRINGS = {
  landingKicker: {
    en: "🌍 A Moral Machine experiment",
    vi: "🌍 Thí nghiệm Moral Machine",
  },
  landingTitleA: { en: "Which country", vi: "Quốc gia nào" },
  landingTitleB: { en: "thinks like", vi: "nghĩ giống" },
  landingTitleYou: { en: "you", vi: "bạn" },
  landingSub: {
    en: "Face impossible driving dilemmas — the same ones scientists used to map the morals of 228 countries. We match you against the 139 with enough responses to trust.",
    vi: "Đối mặt các tình huống lái xe bất khả thi — chính những tình huống các nhà khoa học đã dùng để lập bản đồ đạo đức của 228 quốc gia. Chúng tôi so bạn với 139 nước có đủ dữ liệu đáng tin.",
  },
  modeQuick: { en: "⚡ Quick", vi: "⚡ Nhanh" },
  modeQuickSub: { en: "6 questions · 1 min", vi: "6 câu · 1 phút" },
  modeStandard: { en: "🎯 Standard", vi: "🎯 Chuẩn" },
  modeStandardSub: { en: "12 questions · 2 min", vi: "12 câu · 2 phút" },
  startCta: { en: "🚗 Start the test", vi: "🚗 Bắt đầu kiểm tra" },
  loadingDilemmas: { en: "Loading dilemmas...", vi: "Đang tải tình huống..." },
  step1Title: { en: "6 dilemmas", vi: "6 tình huống" },
  step1Sub: { en: "Who lives? You decide.", vi: "Ai sống? Bạn quyết định." },
  step2Title: { en: "Moral twin", vi: "Bản sao đạo đức" },
  step2Sub: {
    en: "Matched against 139 reliable countries.",
    vi: "So khớp với 139 quốc gia đủ dữ liệu.",
  },
  step3Title: { en: "Explore", vi: "Khám phá" },
  step3Sub: {
    en: "See yourself on the world map of morals.",
    vi: "Thấy mình trên bản đồ đạo đức thế giới.",
  },
  dilemmaOf: { en: "Dilemma", vi: "Tình huống" },
  dilemmaOfTotal: { en: "of", vi: "trên" },
  dilemmaTitle: {
    en: "The car must hit someone. You choose:",
    vi: "Xe buộc phải đâm vào ai đó. Bạn chọn:",
  },
  back: { en: "← Back", vi: "← Quay lại" },
  strengthAsk: { en: "How strongly do you feel?", vi: "Bạn chắc chắn đến mức nào?" },
  intensitySure: { en: "💯 Sure", vi: "💯 Chắc chắn" },
  intensityLean: { en: "🤏 Leaning", vi: "🤏 Hơi nghiêng" },
  next: { en: "Next →", vi: "Tiếp →" },
  seeResult: { en: "See my result ✨", vi: "Xem kết quả ✨" },
  analyzingTitle: {
    en: "Reading your moral compass…",
    vi: "Đang đọc la bàn đạo đức của bạn…",
  },
  analyzingSub: {
    en: "Comparing you with 139 countries.",
    vi: "Đang so sánh bạn với 139 quốc gia.",
  },
  verdictKicker: {
    en: "Your moral twin is…",
    vi: "Bản sao đạo đức của bạn là…",
  },
  matchSuffix: { en: "match", vi: "tương đồng" },
  agreeCount: {
    en: "✅ Agree on {a} of {t} themes",
    vi: "✅ Đồng thuận {a}/{t} chủ đề",
  },
  strengthStrong: {
    en: "A remarkably close twin.",
    vi: "Bản sao hợp đến ngạc nhiên.",
  },
  strengthClose: {
    en: "Close overall, with a few sharp differences below.",
    vi: "Nhìn chung khá hợp, chỉ lệch vài điểm gắt bên dưới.",
  },
  strengthWeak: {
    en: "No country thinks quite like you — this is the nearest available.",
    vi: "Chẳng nước nào nghĩ giống hệt bạn — đây là gần nhất có thể.",
  },
  share: { en: "📋 Share my result", vi: "📋 Chia sẻ kết quả" },
  copied: { en: "Copied! ✅", vi: "Đã copy! ✅" },
  profileTitle: {
    en: "🧬 Your moral profile, in plain words",
    vi: "🧬 Hồ sơ đạo đức của bạn, nói dễ hiểu",
  },
  matchesTitle: { en: "🏆 Closest matches", vi: "🏆 Hợp nhất với bạn" },
  matchesSub: {
    en: "How closely each country's people answered, compared to you.",
    vi: "Người dân mỗi nước trả lời giống bạn đến mức nào.",
  },
  matchPool: {
    en: "Compared across {n} countries with 100+ responses each.",
    vi: "So sánh với {n} quốc gia có từ 100 lượt trả lời trở lên.",
  },
  groupsTitle: {
    en: "👥 Groups that think like you",
    vi: "👥 Các nhóm nghĩ giống bạn",
  },
  spotsTitle: { en: "👁️ Your moral blind spots", vi: "👁️ Điểm mù đạo đức của bạn" },
  spotsSub: {
    en: "Every theme you answered, head-to-head with your twin. ✅ marks where you agree.",
    vi: "Từng chủ đề bạn đã trả lời, đối đầu với bản sao. ✅ là nơi đồng thuận.",
  },
  noSpots: {
    en: "No blind spots detected — you are very average.",
    vi: "Không phát hiện điểm mù — bạn rất trung bình.",
  },
  nerdTitle: {
    en: "🤓 Nerd corner: the science behind it",
    vi: "🤓 Góc nerd: khoa học đằng sau",
  },
  radarTitle: { en: "across 6 themes", vi: "trên 6 chủ đề" },
  radarNote: {
    en: "Higher means you step in more often.",
    vi: "Càng cao nghĩa là bạn càng hay can thiệp.",
  },
  mapTitle: { en: "World map of morals", vi: "Bản đồ đạo đức thế giới" },
  mapNote: {
    en: "Each dot is a country. The red dot is you — the closer the dots, the more similar the morals.",
    vi: "Mỗi chấm là một quốc gia. Chấm đỏ là bạn — càng gần nhau, đạo đức càng giống nhau.",
  },
  countriesLegend: { en: "Countries", vi: "Các quốc gia" },
  youLegend: { en: "You", vi: "Bạn" },
  retry: { en: "🔄 Try again", vi: "🔄 Làm lại" },
  worldBar: { en: "World", vi: "Thế giới" },
  saveRateLabel: {
    en: "Share of cases each side would save",
    vi: "Tỉ lệ các trường hợp mỗi bên sẽ cứu",
  },
  statsDilemmas: { en: "hand-written dilemmas", vi: "tình huống soạn tay" },
  statsCountries: { en: "countries compared", vi: "quốc gia so sánh" },
  statsGroups: { en: "demographic groups", vi: "nhóm nhân khẩu" },
  loadError: {
    en: "Could not load scenarios. The server may be waking up — tap Start to retry.",
    vi: "Không tải được tình huống. Server có thể đang khởi động — bấm Bắt đầu để thử lại.",
  },
  wakingServer: {
    en: "⏳ Waking up the server (free tier sleeps when idle)…",
    vi: "⏳ Đang đánh thức server (gói free ngủ khi rảnh)…",
  },
  analyzeError: {
    en: "Analysis failed. Please retry.",
    vi: "Chấm bài thất bại. Thử lại nhé.",
  },
} as const;

export type StringKey = keyof typeof STRINGS;

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: StringKey) => string;
}

export const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => STRINGS[key].en,
});

export function useLang(): LangContextValue {
  return useContext(LangContext);
}

export function translate(lang: Lang, key: StringKey): string {
  return STRINGS[key][lang];
}
