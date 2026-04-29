import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <Link to="/">🏏 Cricket Scorer</Link>
      </div>

      <ul className="navbar__links">
        <li><Link to="/leaderboard">Leaderboard</Link></li>
        <li><Link to="/matches">Matches</Link></li>

        {user ? (
          <>
            <li><Link to="/">Dashboard</Link></li>
            <li>
              <div className="navbar__user">
                <Link to={`/players/${user.id}/stats`}>{user.name}</Link>
                <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login" className="btn btn--outline btn--sm">Login</Link></li>
            <li><Link to="/register" className="btn btn--primary btn--sm">Sign Up</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}
