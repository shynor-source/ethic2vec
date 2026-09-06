import { useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  Legend,
} from "recharts";
import type { AnalyzeResult } from "../lib/api";
import {
  countryName,
  blindSpotCard,
  humanizeDemoGroup,
  shareText,
  traitSentences,
} from "../lib/format";
import { useLang } from "../lib/i18n";
import Flag from "./Flag";

interface ResultsViewProps {
  result: AnalyzeResult;
  onRestart: () => void;
}

const MEDALS = ["🥇", "🥈", "🥉", "4.", "5."];

export default function ResultsView({ result, onRestart }: ResultsViewProps) {
  const { lang, t } = useLang();
  const [copied, setCopied] = useState(false);
  const top = result.topCountries[0];
  const topScore = top?.score ?? 0;
  const traits = traitSentences(lang, result.radar);

  const handleShare = async () => {
    const text = shareText(lang, result.matchName, topScore, result.topCountries);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="results">
      <section className="verdict">
        <div className="verdict-flag">
          <Flag code={result.matchName} size={72} />
        </div>
        <p className="verdict-kicker">{t("verdictKicker")}</p>
        <h2 className="verdict-name">{countryName(result.matchName)}</h2>
        <div className="match-bar">
          <div className="match-fill" style={{ width: `${topScore}%` }} />
        </div>
        <p className="verdict-score">
          {topScore}% {t("matchSuffix")}
        </p>
        <button type="button" className="ghost" onClick={handleShare}>
          {copied ? t("copied") : t("share")}
        </button>
      </section>

      <div className="results-grid">
        <div className="results-col">
          <section className="card">
            <h2>{t("profileTitle")}</h2>
            <ul className="traits">
              {traits.map((sentence) => (
                <li key={sentence}>{sentence}</li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h2>{t("spotsTitle")}</h2>
            <p className="muted">{t("spotsSub")}</p>
            {result.blindSpots.length > 0 ? (
              <ul className="spots">
                {result.blindSpots.map((spot) => {
                  const card = blindSpotCard(
                    lang,
                    spot,
                    countryName(result.matchName),
                  );
                  const rows = [
                    {
                      label: t("youLegend"),
                      value: card.userPct,
                      cls: "bar-you",
                    },
                    {
                      label: countryName(result.matchName),
                      value: card.matchPct,
                      cls: "bar-twin",
                    },
                    {
                      label: t("worldBar"),
                      value: card.globalPct,
                      cls: "bar-world",
                    },
                  ];
                  return (
                    <li
                      key={spot.dimension}
                      className={card.agreed ? "spot agreed" : "spot"}
                    >
                      <strong className="spot-title">{card.title}</strong>
                      <p className="spot-verdict">{card.verdict}</p>
                      <div className="spot-bars">
                        {rows.map(
                          (row) =>
                            row.value !== null && (
                              <div key={row.label} className="spot-row">
                                <span className="spot-label">{row.label}</span>
                                <div className="spot-track">
                                  <div
                                    className={`spot-fill ${row.cls}`}
                                    style={{ width: `${row.value}%` }}
                                  />
                                </div>
                                <span className="spot-pct">{row.value}%</span>
                              </div>
                            ),
                        )}
                      </div>
                      <p className="muted tiny">{t("saveRateLabel")}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="muted">{t("noSpots")}</p>
            )}
          </section>
        </div>

        <div className="results-col">
          <section className="card">
            <h2>{t("matchesTitle")}</h2>
            <p className="muted">{t("matchesSub")}</p>
            <p className="muted tiny">
              {t("matchPool").replace("{n}", String(result.matchPoolSize))}
            </p>
            <ul className="rank-list">
              {result.topCountries.slice(0, 5).map((entry, i) => {
                const code = entry.country ?? entry.label ?? "";
                return (
                  <li key={code}>
                    <span className="rank-row">
                      <span className="rank-medal">{MEDALS[i]}</span>
                      <Flag code={code} size={20} />
                      <span>{countryName(code)}</span>
                    </span>
                    <strong>{entry.score}%</strong>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="card">
            <h2>{t("groupsTitle")}</h2>
            <ul className="rank-list">
              {result.topDemographics.map((entry) => (
                <li key={entry.label}>
                  <span>{humanizeDemoGroup(lang, entry.label ?? "")}</span>
                  <strong>{entry.score}%</strong>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <details className="card nerd">
        <summary>{t("nerdTitle")}</summary>
        {result.radar.length > 0 && (
          <>
            <h3>
              {t("youLegend")} vs {countryName(result.matchName)} {t("radarTitle")}
            </h3>
            <p className="muted">{t("radarNote")}</p>
            <div className="chart">
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={result.radar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <Radar
                    name={t("youLegend")}
                    dataKey="user"
                    stroke="#ff4d4f"
                    fill="#ff4d4f"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name={countryName(result.matchName)}
                    dataKey="match"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        <h3>{t("mapTitle")}</h3>
        <p className="muted">{t("mapNote")}</p>
        <div className="chart">
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 16, right: 16, bottom: 16, left: 0 }}>
              <XAxis type="number" dataKey="x" name="Axis 1" />
              <YAxis type="number" dataKey="y" name="Axis 2" />
              <ZAxis type="number" range={[60, 60]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Legend />
              <Scatter
                name={t("countriesLegend")}
                data={result.pc12.filter((p) => p.kind !== "user")}
                fill="#8884d8"
              />
              <Scatter
                name={t("youLegend")}
                data={result.pc12.filter((p) => p.kind === "user")}
                fill="#ff4d4f"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </details>

      <button type="button" className="primary retry" onClick={onRestart}>
        {t("retry")}
      </button>
    </div>
  );
}
