import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMatch } from '../../services/api/matchService';
import { getMyTeams }  from '../../services/api/teamService';

const MATCH_TYPES = ['T20', 'ODI', 'T10', 'Test', 'Custom'];
const OVERS_MAP   = { T20: 20, ODI: 50, T10: 10, Test: 90, Custom: 20 };

export default function CreateMatchPage() {
  const navigate = useNavigate();
  const [teams, setTeams]   = useState([]);
  const [form,  setForm]    = useState({
    title: '', matchType: 'T20', overs: 20, ballsPerOver: 6,
    team1Id: '', team2Id: '', venue: '', scheduledAt: '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMyTeams().then(res => setTeams(res.data.teams));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'matchType' ? { overs: OVERS_MAP[value] } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.team1Id === form.team2Id) return setError('Teams must be different');
    setLoading(true);
    try {
      const res = await createMatch(form);
      navigate(`/matches/${res.data.match.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create match');
      setLoading(false);
    }
  };

  return (
    <div className="page page--narrow">
      <h1>Schedule a Match</h1>
      {error && <div className="alert alert--error">{error}</div>}

      <form onSubmit={handleSubmit} className="form card">
        <div className="form__group">
          <label>Match Title (optional)</label>
          <input name="title" value={form.title} onChange={handleChange}
            placeholder="e.g. Season Opener 2025" />
        </div>

        <div className="form__row">
          <div className="form__group">
            <label>Match Type *</label>
            <select name="matchType" value={form.matchType} onChange={handleChange}>
              {MATCH_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form__group">
            <label>Overs *</label>
            <input name="overs" type="number" min="1" max="100"
              value={form.overs} onChange={handleChange} required />
          </div>
        </div>

        <div className="form__row">
          <div className="form__group">
            <label>Team 1 *</label>
            <select name="team1Id" value={form.team1Id} onChange={handleChange} required>
              <option value="">Select team…</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="form__group">
            <label>Team 2 *</label>
            <select name="team2Id" value={form.team2Id} onChange={handleChange} required>
              <option value="">Select team…</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div className="form__row">
          <div className="form__group">
            <label>Venue</label>
            <input name="venue" value={form.venue} onChange={handleChange}
              placeholder="Wankhede Stadium" />
          </div>
          <div className="form__group">
            <label>Date & Time</label>
            <input name="scheduledAt" type="datetime-local"
              value={form.scheduledAt} onChange={handleChange} />
          </div>
        </div>

        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Creating…' : 'Schedule Match'}
          </button>
        </div>
      </form>
    </div>
  );
}
