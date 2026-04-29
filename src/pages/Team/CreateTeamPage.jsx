import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTeam } from '../../services/api/teamService';

export default function CreateTeamPage() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name: '', shortName: '', logoUrl: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createTeam(form);
      navigate(`/teams/${res.data.team.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team');
      setLoading(false);
    }
  };

  return (
    <div className="page page--narrow">
      <h1>Create New Team</h1>

      {error && <div className="alert alert--error">{error}</div>}

      <form onSubmit={handleSubmit} className="form card">
        <div className="form__group">
          <label>Team Name *</label>
          <input
            name="name" value={form.name} onChange={handleChange}
            placeholder="Mumbai Indians" required
          />
        </div>

        <div className="form__group">
          <label>Short Name</label>
          <input
            name="shortName" value={form.shortName} onChange={handleChange}
            placeholder="MI" maxLength={5}
          />
        </div>

        <div className="form__group">
          <label>Logo URL (optional)</label>
          <input
            name="logoUrl" type="url" value={form.logoUrl} onChange={handleChange}
            placeholder="https://…"
          />
        </div>

        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Creating…' : 'Create Team'}
          </button>
        </div>
      </form>
    </div>
  );
}
