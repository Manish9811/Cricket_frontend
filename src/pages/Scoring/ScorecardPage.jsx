import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getScorecard }  from '../../services/api/scoringService';
import { getMatch }      from '../../services/api/matchService';
import Scorecard from '../../components/scoring/Scorecard';
import Spinner   from '../../components/common/Spinner';

export default function ScorecardPage() {
  const { id: matchId } = useParams();
  const [match,      setMatch]      = useState(null);
  const [scorecards, setScorecards] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([getMatch(matchId), getScorecard(matchId)])
      .then(([m, sc]) => {
        setMatch(m.data.match);
        setScorecards(sc.data.scorecards);
      })
      .finally(() => setLoading(false));
  }, [matchId]);

  if (loading) return <Spinner fullPage />;

  const shareUrl = window.location.href;

  return (
    <div className="page">
      {/* Header */}
      <div className="scorecard-page__header">
        <div className="scorecard-page__teams">
          <h1>{match?.team1_name} vs {match?.team2_name}</h1>
          {match?.result && <p className="match-result">{match.result}</p>}
        </div>
        <div className="scorecard-page__meta">
          <span>{match?.match_type} · {match?.overs} overs</span>
          {match?.venue && <span>{match.venue}</span>}
        </div>
        <div className="scorecard-page__actions">
          <button
            className="btn btn--outline btn--sm"
            onClick={() => { navigator.clipboard.writeText(shareUrl); alert('Link copied!'); }}
          >
            Share Scorecard
          </button>
          <Link to={`/matches/${matchId}`} className="btn btn--ghost btn--sm">
            Back to Match
          </Link>
        </div>
      </div>

      {/* Innings scorecards */}
      {scorecards.length === 0 ? (
        <p className="empty-state">No innings recorded yet.</p>
      ) : (
        scorecards.map((sc, i) => (
          <div key={sc.innings.id} className="scorecard-wrapper">
            <h2 className="innings-title">
              {i === 0 ? '1st' : '2nd'} Innings — {sc.innings.batting_team_name}
            </h2>
            <Scorecard
              innings={sc.innings}
              batting={sc.batting}
              bowling={sc.bowling}
            />
          </div>
        ))
      )}
    </div>
  );
}
