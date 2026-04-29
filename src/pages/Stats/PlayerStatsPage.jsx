import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api/apiClient';
import Spinner from '../../components/common/Spinner';

const Stat = ({ label, value }) => (
  <div className="stat-box">
    <span className="stat-box__value">{value ?? '—'}</span>
    <span className="stat-box__label">{label}</span>
  </div>
);

export default function PlayerStatsPage() {
  const { id }        = useParams();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/stats/player/${id}`)
      .then(res => setStats(res.data.stats))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner fullPage />;
  if (!stats)  return <p className="empty-state">No stats found for this player.</p>;

  const battingAvg = stats.innings_batted > 0
    ? (stats.total_runs / Math.max(stats.innings_batted - stats.not_outs, 1)).toFixed(2)
    : '0.00';

  const economy = stats.balls_bowled > 0
    ? (stats.runs_conceded / (stats.balls_bowled / 6)).toFixed(2)
    : '0.00';

  const bowlingAvg = stats.wickets_taken > 0
    ? (stats.runs_conceded / stats.wickets_taken).toFixed(2)
    : '—';

  return (
    <div className="page">
      {/* Player header */}
      <div className="player-header">
        <div className="avatar avatar--lg">{stats.name?.charAt(0)}</div>
        <div>
          <h1>{stats.name}</h1>
          <p className="text-muted">{stats.matches_played} matches played</p>
        </div>
      </div>

      {/* Batting stats */}
      <section className="stats-section">
        <h2>Batting</h2>
        <div className="stats-grid">
          <Stat label="Runs"          value={stats.total_runs} />
          <Stat label="Average"       value={battingAvg} />
          <Stat label="Innings"       value={stats.innings_batted} />
          <Stat label="Highest Score" value={stats.highest_score} />
          <Stat label="50s"           value={stats.fifties} />
          <Stat label="100s"          value={stats.hundreds} />
          <Stat label="4s"            value={stats.fours} />
          <Stat label="6s"            value={stats.sixes} />
          <Stat label="Not Outs"      value={stats.not_outs} />
        </div>
      </section>

      {/* Bowling stats */}
      <section className="stats-section">
        <h2>Bowling</h2>
        <div className="stats-grid">
          <Stat label="Wickets"     value={stats.wickets_taken} />
          <Stat label="Economy"     value={economy} />
          <Stat label="Average"     value={bowlingAvg} />
          <Stat label="Innings"     value={stats.innings_bowled} />
          <Stat label="Best"
            value={stats.best_bowling_wickets > 0
              ? `${stats.best_bowling_wickets}/${stats.best_bowling_runs}`
              : '—'} />
          <Stat label="5 Wickets"   value={stats.five_wickets} />
        </div>
      </section>

      {/* Fielding stats */}
      <section className="stats-section">
        <h2>Fielding</h2>
        <div className="stats-grid">
          <Stat label="Catches"    value={stats.catches} />
          <Stat label="Run Outs"   value={stats.run_outs} />
          <Stat label="Stumpings"  value={stats.stumpings} />
        </div>
      </section>
    </div>
  );
}
