import { useState, useEffect, useCallback, useRef } from 'react';
import useSocket from './useSocket';
import { recordBall, getScorecard, startInnings, completeInnings } from '../services/api/scoringService';

/*
 * Central hook for the live scoring page.
 * Manages local scorecard state and socket sync.
 */
const useScoring = (matchId) => {
  const { socket } = useSocket();
  const [scorecards, setScorecards]     = useState([]);
  const [currentInnings, setCurrentInnings] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [submitting, setSubmitting]     = useState(false);

  // Over ball-log for the current over (shown at bottom of scoring UI)
  const [overLog, setOverLog] = useState([]);

  // Load initial scorecard
  useEffect(() => {
    if (!matchId) return;
    getScorecard(matchId)
      .then(res => {
        setScorecards(res.data.scorecards || []);
        const active = res.data.scorecards.find(s => s.innings.status === 'in_progress');
        if (active) setCurrentInnings(active.innings);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load scorecard'))
      .finally(() => setLoading(false));
  }, [matchId]);

  // Join match room and listen for real-time updates
  useEffect(() => {
    if (!socket || !matchId) return;

    socket.emit('join:match', { matchId });

    socket.on('scorecard:sync', ({ scorecards: sc }) => {
      setScorecards(sc);
      const active = sc.find(s => s.innings.status === 'in_progress');
      if (active) setCurrentInnings(active.innings);
    });

    socket.on('ball:update', ({ ball, innings }) => {
      setScorecards(prev =>
        prev.map(s =>
          s.innings.id === innings.id ? { ...s, innings } : s
        )
      );
      setCurrentInnings(innings);
      setOverLog(prev => [...prev, ball]);
    });

    socket.on('innings:complete', () => {
      setCurrentInnings(prev => prev ? { ...prev, status: 'completed' } : prev);
    });

    return () => {
      socket.emit('leave:match', { matchId });
      socket.off('scorecard:sync');
      socket.off('ball:update');
      socket.off('innings:complete');
    };
  }, [socket, matchId]);

  // Reset over log when over number changes
  useEffect(() => {
    setOverLog([]);
  }, [currentInnings?.total_overs]);

  const submitBall = useCallback(async (ballData) => {
    if (!currentInnings) return;
    setSubmitting(true);
    try {
      await recordBall(currentInnings.id, ballData);
      // Socket event will update state automatically
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record ball');
    } finally {
      setSubmitting(false);
    }
  }, [currentInnings]);

  const beginInnings = useCallback(async (inningsData) => {
    setLoading(true);
    try {
      const res = await startInnings(matchId, inningsData);
      setCurrentInnings(res.data.innings);
      setScorecards(prev => [...prev, { innings: res.data.innings, batting: [], bowling: [] }]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start innings');
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  const endInnings = useCallback(async () => {
    if (!currentInnings) return;
    try {
      await completeInnings(currentInnings.id);
      setCurrentInnings(prev => ({ ...prev, status: 'completed' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete innings');
    }
  }, [currentInnings]);

  return {
    scorecards, currentInnings, loading, error, submitting,
    overLog, submitBall, beginInnings, endInnings,
  };
};

export default useScoring;
