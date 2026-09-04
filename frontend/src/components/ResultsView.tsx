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
  countryFlag,
  countryName,
  friendlyBlindSpot,
  humanizeDemoGroup,
  shareText,
  traitSentences,
} from "../lib/format";

interface ResultsViewProps {
  result: AnalyzeResult;
  onRestart: () => void;
}

export default function ResultsView({ result, onRestart }: ResultsViewProps) {
  const [copied, setCopied] = useState(false);
  const top = result.topCountries[0];
  const topScore = top?.score ?? 0;
  const traits = traitSentences(result.radar);

  const handleShare = async () => {
    const text = shareText(result.matchName, topScore, result.topCountries);
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
        <div className="verdict-flag">{countryFlag(result.matchName)}</div>
        <p className="verdict-kicker">Your moral twin is…</p>
        <h2 className="verdict-name">{countryName(result.matchName)}</h2>
        <div className="match-bar">
          <div className="match-fill" style={{ width: `${topScore}%` }} />
        </div>
        <p className="verdict-score">{topScore}% match</p>
        <button type="button" className="ghost" onClick={handleShare}>
          {copied ? "Copied! ✅" : "📋 Share my result"}
        </button>
      </section>

      <section className="card">
        <h2>🧬 Your moral profile, in plain words</h2>
        <ul className="traits">
          {traits.map((sentence) => (
            <li key={sentence}>{sentence}</li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>🏆 Closest matches</h2>
        <p className="muted">
          How closely each country's people answered, compared to you.
        </p>
        <ul className="rank-list">
          {result.topCountries.slice(0, 5).map((entry, i) => {
            const code = entry.country ?? entry.label ?? "";
            return (
              <li key={code}>
                <span className="rank-row">
                  <span className="rank-medal">
                    {["🥇", "🥈", "🥉", "4.", "5."][i]}
                  </span>
                  <span className="rank-flag">{countryFlag(code)}</span>
                  <span>{countryName(code)}</span>
                </span>
                <strong>{entry.score}%</strong>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card">
        <h2>👥 Groups that think like you</h2>
        <ul className="rank-list">
          {result.topDemographics.map((entry) => (
            <li key={entry.label}>
              <span>{humanizeDemoGroup(entry.label ?? "")}</span>
              <strong>{entry.score}%</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>👁️ Your moral blind spots</h2>
        <p className="muted">Where you stand out from the rest of the world.</p>
        {result.blindSpots.length > 0 ? (
          <ul className="spots">
            {result.blindSpots.map((spot) => {
              const dimension = spot.split(":")[0];
              return <li key={spot}>{friendlyBlindSpot(dimension, spot)}</li>;
            })}
          </ul>
        ) : (
          <p className="muted">No blind spots detected — you are very average.</p>
        )}
      </section>

      <details className="card nerd">
        <summary>🤓 Nerd corner: the science behind it</summary>
        {result.radar.length > 0 && (
          <>
            <h3>You vs {countryName(result.matchName)} across 6 themes</h3>
            <p className="muted">Higher means you step in more often.</p>
            <div className="chart">
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={result.radar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <Radar
                    name="You"
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
        <h3>World map of morals</h3>
        <p className="muted">
          Each dot is a country. The red dot is you — the closer the dots,
          the more similar the morals.
        </p>
        <div className="chart">
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 16, right: 16, bottom: 16, left: 0 }}>
              <XAxis type="number" dataKey="x" name="Axis 1" />
              <YAxis type="number" dataKey="y" name="Axis 2" />
              <ZAxis type="number" range={[60, 60]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Legend />
              <Scatter
                name="Countries"
                data={result.pc12.filter((p) => p.kind !== "user")}
                fill="#8884d8"
              />
              <Scatter
                name="You"
                data={result.pc12.filter((p) => p.kind === "user")}
                fill="#ff4d4f"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </details>

      <button type="button" className="primary" onClick={onRestart}>
        🔄 Try again
      </button>
    </div>
  );
}
