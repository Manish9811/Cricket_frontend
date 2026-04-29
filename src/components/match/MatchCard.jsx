import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  live:      'badge--live',
  upcoming:  'badge--upcoming',
  completed: 'badge--completed',
  cancelled: 'badge--cancelled',
};

export default function MatchCard({ match }) {
  const dateStr = match.scheduled_at
    ? new Date(match.scheduled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : 'TBD';

  return (
    <Link to={`/matches/${match.id}`} className="card match-card">
      <div className="match-card__header">
        <span className={`badge ${STATUS_COLORS[match.status] || ''}`}>{match.status.toUpperCase()}</span>
        <span className="match-card__type">{match.match_type} • {match.overs} overs</span>
      </div>

      <div className="match-card__teams">
        <div className="match-card__team">
          <strong>{match.team1_name}</strong>
        </div>
        <span className="match-card__vs">VS</span>
        <div className="match-card__team">
          <strong>{match.team2_name}</strong>
        </div>
      </div>

      <div className="match-card__footer">
        <span>{match.venue || 'Venue TBD'}</span>
        <span>{dateStr}</span>
      </div>

      {match.result && (
        <p className="match-card__result">{match.result}</p>
      )}
    </Link>
  );
}
