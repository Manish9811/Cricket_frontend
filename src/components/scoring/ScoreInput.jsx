import { useState } from 'react';

const RUNS     = [0, 1, 2, 3, 4, 5, 6];
const EXTRAS   = ['wide', 'noball', 'bye', 'legbye'];
const WICKETS  = ['bowled', 'caught', 'lbw', 'run_out', 'stumped', 'hit_wicket'];

/*
 * ScoreInput — the scorer's control panel.
 * Props:
 *   players      [{ id, name }]  — playing XI of batting team
 *   bowlers      [{ id, name }]  — playing XI of bowling team
 *   batsman      { id, name }    — current striker
 *   nonStriker   { id, name }
 *   bowler       { id, name }    — current bowler
 *   onSubmit     (ballData) => void
 *   submitting   bool
 */
export default function ScoreInput({ players, bowlers, batsman, nonStriker, bowler, onSubmit, submitting }) {
  const [runs,         setRuns]         = useState(0);
  const [extrasType,   setExtrasType]   = useState('none');
  const [extrasRuns,   setExtrasRuns]   = useState(0);
  const [isWicket,     setIsWicket]     = useState(false);
  const [wicketType,   setWicketType]   = useState('bowled');
  const [dismissedId,  setDismissedId]  = useState(batsman?.id || '');
  const [fielderId,    setFielderId]    = useState('');
  const [newBowlerId,  setNewBowlerId]  = useState(bowler?.id || '');
  const [commentary,   setCommentary]   = useState('');

  const handleExtras = (type) => {
    if (extrasType === type) {
      setExtrasType('none');
      setExtrasRuns(0);
    } else {
      setExtrasType(type);
      setRuns(0);
      // wide/noball default to 1 extra run
      setExtrasRuns(['wide', 'noball'].includes(type) ? 1 : 0);
    }
  };

  const handleSubmit = () => {
    if (!batsman || !bowler) return;
    onSubmit({
      batsmanId:        batsman.id,
      nonStrikerId:     nonStriker?.id,
      bowlerId:         newBowlerId || bowler.id,
      runsOffBat:       extrasType !== 'none' ? 0 : runs,
      extrasType:       extrasType === 'none' ? null : extrasType,
      extrasRuns:       extrasType !== 'none' ? (extrasRuns || 1) : 0,
      isWicket,
      wicketType:       isWicket ? wicketType : null,
      dismissedPlayerId: isWicket ? (dismissedId || batsman.id) : null,
      fielderId:        fielderId || null,
      commentary,
    });
    // Reset
    setRuns(0);
    setExtrasType('none');
    setExtrasRuns(0);
    setIsWicket(false);
    setWicketType('bowled');
    setDismissedId(batsman?.id || '');
    setFielderId('');
    setCommentary('');
  };

  return (
    <div className="score-input">
      {/* Current Players */}
      <div className="score-input__players">
        <div className="score-input__player score-input__player--striker">
          <span className="label">Striker</span>
          <span>{batsman?.name || '—'} *</span>
        </div>
        <div className="score-input__player">
          <span className="label">Non-Striker</span>
          <span>{nonStriker?.name || '—'}</span>
        </div>
        <div className="score-input__player">
          <span className="label">Bowler</span>
          <select value={newBowlerId} onChange={e => setNewBowlerId(e.target.value)}>
            {bowlers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      {/* Runs */}
      <div className="score-input__section">
        <label className="section-label">Runs off Bat</label>
        <div className="run-buttons">
          {RUNS.map(r => (
            <button
              key={r}
              className={`run-btn ${runs === r && extrasType === 'none' ? 'run-btn--active' : ''}
                ${r === 4 ? 'run-btn--four' : ''} ${r === 6 ? 'run-btn--six' : ''}`}
              onClick={() => { setRuns(r); setExtrasType('none'); }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Extras */}
      <div className="score-input__section">
        <label className="section-label">Extras</label>
        <div className="extra-buttons">
          {EXTRAS.map(e => (
            <button
              key={e}
              className={`extra-btn ${extrasType === e ? 'extra-btn--active' : ''}`}
              onClick={() => handleExtras(e)}
            >
              {e.toUpperCase()}
            </button>
          ))}
        </div>
        {extrasType !== 'none' && (
          <div className="form__group mt-1">
            <label>Extra Runs</label>
            <input
              type="number" min="0" max="7" value={extrasRuns}
              onChange={e => setExtrasRuns(parseInt(e.target.value))}
              className="input--sm"
            />
          </div>
        )}
      </div>

      {/* Wicket */}
      <div className="score-input__section">
        <label className="section-label">
          <input
            type="checkbox" checked={isWicket}
            onChange={e => setIsWicket(e.target.checked)}
          />
          {' '}Wicket
        </label>

        {isWicket && (
          <div className="wicket-panel">
            <div className="form__group">
              <label>How Out</label>
              <select value={wicketType} onChange={e => setWicketType(e.target.value)}>
                {WICKETS.map(w => <option key={w} value={w}>{w.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="form__group">
              <label>Dismissed Player</label>
              <select value={dismissedId} onChange={e => setDismissedId(e.target.value)}>
                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            {['caught', 'run_out', 'stumped'].includes(wicketType) && (
              <div className="form__group">
                <label>Fielder</label>
                <select value={fielderId} onChange={e => setFielderId(e.target.value)}>
                  <option value="">None</option>
                  {bowlers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Commentary */}
      <div className="score-input__section">
        <input
          className="commentary-input"
          placeholder="Ball commentary (optional)…"
          value={commentary}
          onChange={e => setCommentary(e.target.value)}
        />
      </div>

      {/* Submit */}
      <button
        className="btn btn--primary btn--full btn--lg"
        onClick={handleSubmit}
        disabled={submitting || !batsman || !newBowlerId}
      >
        {submitting ? 'Saving…' : 'Confirm Ball'}
      </button>
    </div>
  );
}
