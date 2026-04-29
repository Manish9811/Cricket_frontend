import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getTeam, invitePlayer, removeMember } from '../../services/api/teamService';
import { getTeamMatches } from '../../services/api/matchService';
import MatchCard from '../../components/match/MatchCard';
import Spinner from '../../components/common/Spinner';

export default function TeamPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');
  const [activeTab, setActiveTab] = useState('players');

  const isCaptain = members.find(m => m.id === user?.id)?.role === 'captain';

  useEffect(() => {
    Promise.all([getTeam(id), getTeamMatches(id)])
      .then(([teamRes, matchRes]) => {
        setTeam(teamRes.data.team);
        setMembers(teamRes.data.members);
        setMatches(matchRes.data.matches);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await invitePlayer(id, inviteEmail);
      setInviteMsg(`Invite sent to ${inviteEmail}`);
      setInviteEmail('');
    } catch (err) {
      setInviteMsg(err.response?.data?.message || 'Failed to send invite');
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm('Remove this player?')) return;
    await removeMember(id, userId);
    setMembers(prev => prev.filter(m => m.id !== userId));
  };

  if (loading) return <Spinner fullPage />;
  if (!team) return <p>Team not found.</p>;

  return (
    <div className="page">
      {/* Header */}
      <div className="team-header">
        <div className="team-header__avatar">
          {team.logo_url
            ? <img src={team.logo_url} alt={team.name} />
            : <span>{team.short_name || team.name.slice(0, 2).toUpperCase()}</span>
          }
        </div>
        <div>
          <h1>{team.name}</h1>
          <p className="text-muted">{members.length} players</p>
          <p className="text-muted invite-code">
            Invite code: <code>{team.invite_code}</code>
          </p>
        </div>
        {isCaptain && (
          <Link to="/matches/create" className="btn btn--primary ml-auto">
            Schedule Match
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['players', 'matches', 'stats'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Players Tab */}
      {activeTab === 'players' && (
        <div>
          {isCaptain && (
            <form onSubmit={handleInvite} className="invite-form">
              <input
                type="email" value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="Invite by email…" required
              />
              <button type="submit" className="btn btn--primary btn--sm">Send Invite</button>
              {inviteMsg && <span className="text-muted">{inviteMsg}</span>}
            </form>
          )}

          <table className="table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Role</th>
                <th>Joined</th>
                {isCaptain && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td>
                    <div className="player-cell">
                      <div className="avatar avatar--sm">{m.name.charAt(0)}</div>
                      <span>{m.name}</span>
                    </div>
                  </td>
                  <td><span className={`badge badge--${m.role}`}>{m.role}</span></td>
                  <td>{new Date(m.joined_at).toLocaleDateString()}</td>
                  {isCaptain && m.id !== user.id && (
                    <td>
                      <button
                        className="btn btn--danger btn--xs"
                        onClick={() => handleRemove(m.id)}
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <div>
          {matches.length === 0
            ? <p className="empty-state">No matches yet.</p>
            : <div className="cards-grid">{matches.map(m => <MatchCard key={m.id} match={m} />)}</div>
          }
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <p className="empty-state">Team stats will appear here after matches are completed.</p>
      )}
    </div>
  );
}
