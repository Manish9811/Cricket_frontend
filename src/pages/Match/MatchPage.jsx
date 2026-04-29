import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getMatch, getMatchPlayers, setToss, markAvailability, selectPlayingXI } from '../../services/api/matchService';
import { startInnings } from '../../services/api/scoringService';
import Spinner from '../../components/common/Spinner';

export default function MatchPage() {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [match,   setMatch]   = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('info');
  const [tossForm, setTossForm] = useState({ tossWinnerId: '', tossDecision: 'bat' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([getMatch(id), getMatchPlayers(id)])
      .then(([m, p]) => {
        setMatch(m.data.match);
        setPlayers(p.data.players);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner fullPage />;
  if (!match)  return <p>Match not found.</p>;

  const myTeamId = players.find(p => p.user_id === user?.id)?.team_id;
  const isCaptain = user?.id === match.created_by;
  const team1Players = players.filter(p => p.team_id === match.team1_id);
  const team2Players = players.filter(p => p.team_id === match.team2_id);

  const handleAvailability = async (status) => {
    await markAvailability(id, status);
    setMsg(`Marked as ${status}`);
  };

  const handleToss = async (e) => {
    e.preventDefault();
    const res = await setToss(id, tossForm);
    setMatch(res.data.match);
  };

  const handleStartMatch = async () => {
    if (!match.toss_winner_id) return setMsg('Set toss first');
    const battingTeamId = match.toss_decision === 'bat'
      ? match.toss_winner_id
      : (match.toss_winner_id === match.team1_id ? match.team2_id : match.team1_id);
    const bowlingTeamId = battingTeamId === match.team1_id ? match.team2_id : match.team1_id;

    await startInnings(id, { battingTeamId, bowlingTeamId, inningsNumber: 1 });
    navigate(`/matches/${id}/live`);
  };

  return (
    <div className="page">
      {/* Match Header */}
      <div className="match-header">
        <div className="match-header__teams">
          <h2>{match.team1_name}</h2>
          <span className="match-header__vs">VS</span>
          <h2>{match.team2_name}</h2>
        </div>
        <div className="match-header__meta">
          <span className={`badge badge--${match.status}`}>{match.status.toUpperCase()}</span>
          <span>{match.match_type} · {match.overs} overs</span>
          {match.venue && <span>{match.venue}</span>}
          {match.scheduled_at && (
            <span>{new Date(match.scheduled_at).toLocaleString('en-IN')}</span>
          )}
        </div>
        {match.result && <p className="match-header__result">{match.result}</p>}
      </div>

      {/* Action Bar */}
      <div className="match-actions">
        {match.status === 'live' && (
          <Link to={`/matches/${id}/live`} className="btn btn--primary">
            View Live Score
          </Link>
        )}
        {match.status === 'completed' && (
          <Link to={`/matches/${id}/scorecard`} className="btn btn--outline">
            Full Scorecard
          </Link>
        )}
        {match.status === 'upcoming' && myTeamId && (
          <div className="availability-bar">
            <span>Availability:</span>
            {['yes', 'no', 'maybe'].map(s => (
              <button key={s} className="btn btn--sm btn--outline" onClick={() => handleAvailability(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        )}
        {msg && <span className="text-muted">{msg}</span>}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['info', 'players', 'toss'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'tab--active' : ''}`}
            onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Info Tab */}
      {tab === 'info' && (
        <div className="card">
          <table className="table">
            <tbody>
              <tr><td>Match Type</td><td>{match.match_type}</td></tr>
              <tr><td>Overs</td><td>{match.overs}</td></tr>
              <tr><td>Venue</td><td>{match.venue || '—'}</td></tr>
              <tr><td>Status</td><td>{match.status}</td></tr>
              {match.toss_winner_id && (
                <tr>
                  <td>Toss</td>
                  <td>
                    {match.toss_winner_id === match.team1_id ? match.team1_name : match.team2_name}
                    {' '}won & chose to {match.toss_decision}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {isCaptain && match.status === 'upcoming' && match.toss_winner_id && (
            <button className="btn btn--primary mt-2" onClick={handleStartMatch}>
              Start Match
            </button>
          )}
        </div>
      )}

      {/* Players Tab */}
      {tab === 'players' && (
        <div className="players-grid">
          <div>
            <h3>{match.team1_name}</h3>
            <PlayerList players={team1Players} />
          </div>
          <div>
            <h3>{match.team2_name}</h3>
            <PlayerList players={team2Players} />
          </div>
        </div>
      )}

      {/* Toss Tab */}
      {tab === 'toss' && isCaptain && !match.toss_winner_id && (
        <form onSubmit={handleToss} className="form card">
          <h3>Record Toss</h3>
          <div className="form__group">
            <label>Toss Winner</label>
            <select
              value={tossForm.tossWinnerId}
              onChange={e => setTossForm(p => ({ ...p, tossWinnerId: e.target.value }))}
              required
            >
              <option value="">Select…</option>
              <option value={match.team1_id}>{match.team1_name}</option>
              <option value={match.team2_id}>{match.team2_name}</option>
            </select>
          </div>
          <div className="form__group">
            <label>Elected to</label>
            <select
              value={tossForm.tossDecision}
              onChange={e => setTossForm(p => ({ ...p, tossDecision: e.target.value }))}
            >
              <option value="bat">Bat</option>
              <option value="field">Field</option>
            </select>
          </div>
          <button type="submit" className="btn btn--primary">Save Toss</button>
        </form>
      )}
    </div>
  );
}

function PlayerList({ players }) {
  return (
    <ul className="player-list">
      {players.map(p => (
        <li key={p.user_id} className="player-list__item">
          <div className="avatar avatar--sm">{p.name.charAt(0)}</div>
          <span>{p.name}</span>
          <span className={`badge badge--avail badge--${p.availability}`}>{p.availability}</span>
          {p.is_playing && <span className="badge badge--playing">XI</span>}
        </li>
      ))}
    </ul>
  );
}
