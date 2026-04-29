import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLive, getUpcoming } from '../../services/api/matchService';
import MatchCard from '../../components/match/MatchCard';
import Spinner   from '../../components/common/Spinner';

export default function MatchesPage() {
  const [live,     setLive]     = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([getLive(), getUpcoming()])
      .then(([l, u]) => {
        setLive(l.data.matches);
        setUpcoming(u.data.matches);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner fullPage />;

  return (
    <div className="page">
      <div className="page__header">
        <h1>Matches</h1>
        <Link to="/matches/create" className="btn btn--primary">+ Schedule Match</Link>
      </div>

      {live.length > 0 && (
        <section className="dashboard-section">
          <h2 className="section-title"><span className="live-dot" />Live Now</h2>
          <div className="cards-grid">
            {live.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}

      <section className="dashboard-section">
        <h2 className="section-title">Upcoming</h2>
        {upcoming.length === 0
          ? <p className="empty-state">No upcoming matches.</p>
          : <div className="cards-grid">{upcoming.map(m => <MatchCard key={m.id} match={m} />)}</div>
        }
      </section>
    </div>
  );
}
