import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAuth    from '../../hooks/useAuth';
import useScoring from '../../hooks/useScoring';
import useSocket  from '../../hooks/useSocket';
import { getMatch, getMatchPlayers } from '../../services/api/matchService';
import ScoreInput  from '../../components/scoring/ScoreInput';
import Scorecard   from '../../components/scoring/Scorecard';
import OverSummary from '../../components/scoring/OverSummary';
import Spinner     from '../../components/common/Spinner';

export default function LiveScoringPage() {
  const { id: matchId } = useParams();
  const { user }        = useAuth();
  const { connected }   = useSocket();

  const {
    scorecards, currentInnings, loading, error, submitting,
    overLog, submitBall, endInnings,
  } = useScoring(matchId);

  const [match,   setMatch]   = useState(null);
  const [players, setPlayers] = useState([]);
  const [view,    setView]    = useState('score'); // 'score' | 'card'

  // Scoring state
  const [strikerId,   setStrikerId]   = useState('');
  const [nonStrikerId, setNonStrikerId] = useState('');
  const [currentBowlerId, setCurrentBowlerId] = useState('');
  const [overNumber,  setOverNumber]  = useState(0);
  const [ballNumber,  setBallNumber]  = useState(1);
  const [deliveryNum, setDeliveryNum] = useState(1);

  useEffect(() => {
    Promise.all([getMatch(matchId), getMatchPlayers(matchId)])
      .then(([m, p]) => {
        setMatch(m.data.match);
        setPlayers(p.data.players);
      });
  }, [matchId]);

  // Sync over/ball tracking from innings state
  useEffect(() => {
    if (!currentInnings) return;
    const legalBalls = currentInnings.total_balls % 6 || 0;
    const overs = Math.floor(currentInnings.total_balls / 6);
    setOverNumber(overs);
    setBallNumber(legalBalls === 0 ? 1 : legalBalls + 1);
    if (currentInnings.striker_id)          setStrikerId(currentInnings.striker_id);
    if (currentInnings.current_bowler_id)   setCurrentBowlerId(currentInnings.current_bowler_id);
    if (currentInnings.current_batsman2_id) setNonStrikerId(currentInnings.current_batsman2_id);
  }, [currentInnings]);

  if (loading || !match) return <Spinner fullPage />;

  const battingPlayers = players.filter(p => p.team_id === currentInnings?.batting_team_id && p.is_playing);
  const bowlingPlayers = players.filter(p => p.team_id === currentInnings?.bowling_team_id && p.is_playing);

  const strikerObj     = battingPlayers.find(p => p.user_id === strikerId);
  const nonStrikerObj  = battingPlayers.find(p => p.user_id === nonStrikerId);
  const bowlerObj      = bowlingPlayers.find(p => p.user_id === currentBowlerId);

  const isCaptain = user?.id === match.created_by;

  const handleBallSubmit = async (ballData) => {
    const isLegal = !['wide', 'noball'].includes(ballData.extrasType);
    const nextBall = isLegal ? (ballNumber >= 6 ? 1 : ballNumber + 1) : ballNumber;
    const nextOver = isLegal && ballNumber >= 6 ? overNumber + 1 : overNumber;
    const nextDel  = deliveryNum + 1;

    await submitBall({
      ...ballData,
      overNumber,
      ballNumber,
      deliveryNumber: deliveryNum,
    });

    setBallNumber(nextBall);
    setOverNumber(nextOver);
    setDeliveryNum(nextDel);

    // Auto rotate strike on odd runs
    if (!ballData.isWicket && isLegal) {
      const totalRuns = ballData.runsOffBat + (ballData.extrasRuns || 0);
      if (totalRuns % 2 !== 0) {
        setStrikerId(nonStrikerId);
        setNonStrikerId(strikerId);
      }
    }
    // Rotate strike at end of over
    if (isLegal && ballNumber === 6) {
      setStrikerId(nonStrikerId);
      setNonStrikerId(strikerId);
    }
  };

  const activeScorecard = scorecards.find(s => s.innings?.id === currentInnings?.id);

  return (
    <div className="live-page">
      {/* Live Status Bar */}
      <div className="live-header">
        <div className="live-header__title">
          <span className="live-dot" /> LIVE
          <span className="live-header__teams">
            {match.team1_name} vs {match.team2_name}
          </span>
        </div>
        <div className="live-header__score">
          {currentInnings && (
            <>
              <span className="live-score">
                {currentInnings.total_runs}/{currentInnings.total_wickets}
              </span>
              <span className="live-overs">
                ({Math.floor(currentInnings.total_balls / 6)}.{currentInnings.total_balls % 6} ov)
              </span>
            </>
          )}
        </div>
        <div className={`socket-status ${connected ? 'socket-status--live' : 'socket-status--offline'}`}>
          {connected ? 'Live' : 'Reconnecting…'}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${view === 'score' ? 'tab--active' : ''}`} onClick={() => setView('score')}>
          Score
        </button>
        <button className={`tab ${view === 'card' ? 'tab--active' : ''}`} onClick={() => setView('card')}>
          Scorecard
        </button>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {/* Scoring Panel */}
      {view === 'score' && (
        <div className="live-layout">
          {/* Left: Mini scorecard */}
          <div className="live-layout__scorecard">
            <OverSummary balls={overLog} />
            {activeScorecard && (
              <Scorecard
                innings={activeScorecard.innings}
                batting={activeScorecard.batting}
                bowling={activeScorecard.bowling}
              />
            )}
          </div>

          {/* Right: Score input (captain/scorer only) */}
          {isCaptain && currentInnings?.status === 'in_progress' && (
            <div className="live-layout__input">
              {/* Batsman selectors */}
              <div className="player-selectors">
                <div className="form__group">
                  <label>Striker</label>
                  <select value={strikerId} onChange={e => setStrikerId(e.target.value)}>
                    <option value="">Select…</option>
                    {battingPlayers.map(p => (
                      <option key={p.user_id} value={p.user_id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form__group">
                  <label>Non-Striker</label>
                  <select value={nonStrikerId} onChange={e => setNonStrikerId(e.target.value)}>
                    <option value="">Select…</option>
                    {battingPlayers.filter(p => p.user_id !== strikerId).map(p => (
                      <option key={p.user_id} value={p.user_id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <ScoreInput
                players={battingPlayers.map(p => ({ id: p.user_id, name: p.name }))}
                bowlers={bowlingPlayers.map(p => ({ id: p.user_id, name: p.name }))}
                batsman={strikerObj   ? { id: strikerObj.user_id,    name: strikerObj.name }    : null}
                nonStriker={nonStrikerObj ? { id: nonStrikerObj.user_id, name: nonStrikerObj.name } : null}
                bowler={bowlerObj     ? { id: bowlerObj.user_id,     name: bowlerObj.name }     : null}
                onSubmit={handleBallSubmit}
                submitting={submitting}
              />

              <button
                className="btn btn--danger btn--full mt-2"
                onClick={() => { if (confirm('End innings?')) endInnings(); }}
              >
                End Innings
              </button>
            </div>
          )}
        </div>
      )}

      {/* Full Scorecard View */}
      {view === 'card' && (
        <div>
          {scorecards.map(sc => (
            <div key={sc.innings.id} className="scorecard-wrapper">
              <Scorecard
                innings={sc.innings}
                batting={sc.batting}
                bowling={sc.bowling}
              />
            </div>
          ))}
          <div className="scorecard-actions">
            <Link to={`/matches/${matchId}/scorecard`} className="btn btn--outline">
              Full Scorecard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
