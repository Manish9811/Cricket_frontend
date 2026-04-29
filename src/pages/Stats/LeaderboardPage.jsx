import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api/apiClient';
import Spinner from '../../components/common/Spinner';

const CATEGORIES = [
  { key: 'runs',    label: 'Most Runs' },
  { key: 'wickets', label: 'Most Wickets' },
  { key: 'sr',      label: 'Best Strike Rate' },
  { key: 'economy', label: 'Best Economy' },
];

export default function LeaderboardPage() {
  const [category, setCategory] = useState('runs');
  const [rows,     setRows]     = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/stats/leaderboard', { params: { category, limit: 25 } })
      .then(res => setRows(res.data.leaderboard))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="page">
      <h1>Leaderboard</h1>

      <div className="category-tabs">
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            className={`tab ${category === c.key ? 'tab--active' : ''}`}
            onClick={() => setCategory(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <table className="table leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Matches</th>
              <th>{category === 'runs' ? 'Runs' : category === 'wickets' ? 'Wickets' : category === 'sr' ? 'SR' : 'Econ'}</th>
              {category === 'runs'    && <th>HS</th>}
              {category === 'wickets' && <th>Avg</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className={i < 3 ? 'row--podium' : ''}>
                <td><strong>{i + 1}</strong></td>
                <td>
                  <Link to={`/players/${r.id}/stats`} className="player-link">
                    <div className="avatar avatar--sm">{r.name.charAt(0)}</div>
                    {r.name}
                  </Link>
                </td>
                <td>{r.matches_played}</td>
                <td>
                  <strong>
                    {category === 'runs'    && r.total_runs}
                    {category === 'wickets' && r.wickets_taken}
                    {category === 'sr'      && r.strike_rate}
                    {category === 'economy' && (r.balls_bowled > 0
                      ? (r.runs_conceded / (r.balls_bowled / 6)).toFixed(2)
                      : '—')}
                  </strong>
                </td>
                {category === 'runs'    && <td>{r.highest_score}</td>}
                {category === 'wickets' && (
                  <td>{r.balls_bowled > 0
                    ? (r.runs_conceded / Math.max(r.wickets_taken, 1)).toFixed(2)
                    : '—'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
