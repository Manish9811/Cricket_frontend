import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getMyTeams } from '../../services/api/teamService';
import { getMyMatches, getLive } from '../../services/api/matchService';
import TeamCard  from '../../components/team/TeamCard';
import MatchCard from '../../components/match/MatchCard';
import Spinner   from '../../components/common/Spinner';

export default function DashboardPage() {
  const { user } = useAuth();
  const [teams,   setTeams]   = useState([]);
  const [matches, setMatches] = useState([]);
  const [live,    setLive]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyTeams(), getMyMatches(), getLive()])
      .then(([t, m, l]) => {
        setTeams(t.data.teams);
        setMatches(m.data.matches);
        setLive(l.data.matches);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner fullPage />;

  return (
    <div className="page">
      <div className="page__header">
        <h1>Welcome, {user?.name} 👋</h1>
        <div className="page__actions">
          <Link to="/teams/create"  className="btn btn--outline">+ New Team</Link>
          <Link to="/matches/create" className="btn btn--primary">+ New Match</Link>
        </div>
      </div>

      {/* Live matches banner */}
      {live.length > 0 && (
        <section className="dashboard-section">
          <h2 className="section-title">
            <span className="live-dot" /> Live Now
          </h2>
          <div className="cards-grid">
            {live.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}

      {/* My Teams */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">My Teams</h2>
        </div>
        {teams.length === 0
          ? <p className="empty-state">No teams yet. <Link to="/teams/create">Create one!</Link></p>
          : <div className="cards-grid">{teams.map(t => <TeamCard key={t.id} team={t} />)}</div>
        }
      </section>

      {/* Recent Matches */}
      <section className="dashboard-section">
        <h2 className="section-title">Recent Matches</h2>
        {matches.length === 0
          ? <p className="empty-state">No matches yet. <Link to="/matches/create">Schedule one!</Link></p>
          : <div className="cards-grid">{matches.map(m => <MatchCard key={m.id} match={m} />)}</div>
        }
      </section>
    </div>
  );
}
