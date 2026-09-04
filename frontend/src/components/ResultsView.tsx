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

interface ResultsViewProps {
  result: AnalyzeResult;
  onRestart: () => void;
}

function ScatterPanel({
  title,
  data,
  xLabel,
  yLabel,
}: {
  title: string;
  data: AnalyzeResult["pc12"];
  xLabel: string;
  yLabel: string;
}) {
  const user = data.filter((point) => point.kind === "user");
  const rest = data.filter((point) => point.kind !== "user");
  return (
    <section className="card">
      <h2>{title}</h2>
      <div className="chart">
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 16, right: 16, bottom: 16, left: 0 }}>
            <XAxis type="number" dataKey="x" name={xLabel} />
            <YAxis type="number" dataKey="y" name={yLabel} />
            <ZAxis type="number" range={[60, 60]} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Legend />
            <Scatter name="Countries / groups" data={rest} fill="#8884d8" />
            <Scatter name="You" data={user} fill="#ff4d4f" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default function ResultsView({ result, onRestart }: ResultsViewProps) {
  return (
    <div className="results">
      <section className="card">
        <h2>You vs {result.matchName}</h2>
        {result.radar.length > 0 ? (
          <div className="chart">
            <ResponsiveContainer width="100%" height={340}>
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
                  name={result.matchName}
                  dataKey="match"
                  stroke="#8884d8"
                  strokeWidth={2}
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="muted">Radar data is not available.</p>
        )}
      </section>

      <ScatterPanel
        title="PC1 vs PC2"
        data={result.pc12}
        xLabel="PC1"
        yLabel="PC2"
      />
      <ScatterPanel
        title="PC1 vs PC3"
        data={result.pc13}
        xLabel="PC1"
        yLabel="PC3"
      />

      <section className="card">
        <h2>Top 5 matching countries</h2>
        <ul className="rank-list">
          {result.topCountries.slice(0, 5).map((entry) => (
            <li key={entry.label}>
              <span>{entry.label}</span>
              <strong>{entry.score}%</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Top demographic groups</h2>
        <ul className="rank-list">
          {result.topDemographics.map((entry) => (
            <li key={entry.label}>
              <span>{entry.label}</span>
              <strong>{entry.score}%</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Moral blind spots</h2>
        {result.blindSpots.length > 0 ? (
          <ul className="spots">
            {result.blindSpots.map((spot) => (
              <li key={spot}>{spot}</li>
            ))}
          </ul>
        ) : (
          <p className="muted">No blind spots detected.</p>
        )}
      </section>

      <button type="button" className="primary" onClick={onRestart}>
        Start over
      </button>
    </div>
  );
}
