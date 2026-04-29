import { Link } from 'react-router-dom';

export default function TeamCard({ team }) {
  return (
    <Link to={`/teams/${team.id}`} className="card team-card">
      <div className="team-card__avatar">
        {team.logo_url
          ? <img src={team.logo_url} alt={team.name} />
          : <span className="team-card__initials">{team.short_name || team.name.slice(0, 2).toUpperCase()}</span>
        }
      </div>
      <div className="team-card__info">
        <h3 className="team-card__name">{team.name}</h3>
        <p className="team-card__meta">
          {team.member_count} player{team.member_count !== 1 ? 's' : ''}
          {team.role && <span className="badge badge--role">{team.role}</span>}
        </p>
      </div>
    </Link>
  );
}
