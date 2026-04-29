import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import PrivateRoute from './components/common/PrivateRoute';

import LoginPage        from './pages/Auth/LoginPage';
import RegisterPage     from './pages/Auth/RegisterPage';
import DashboardPage    from './pages/Dashboard/DashboardPage';
import TeamPage         from './pages/Team/TeamPage';
import CreateTeamPage   from './pages/Team/CreateTeamPage';
import MatchesPage      from './pages/Match/MatchesPage';
import MatchPage        from './pages/Match/MatchPage';
import CreateMatchPage  from './pages/Match/CreateMatchPage';
import LiveScoringPage  from './pages/Scoring/LiveScoringPage';
import ScorecardPage    from './pages/Scoring/ScorecardPage';
import LeaderboardPage  from './pages/Stats/LeaderboardPage';
import PlayerStatsPage  from './pages/Stats/PlayerStatsPage';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/matches"  element={<MatchesPage />} />
          <Route path="/matches/:id/scorecard" element={<ScorecardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />

          {/* Protected */}
          <Route element={<PrivateRoute />}>
            <Route path="/"                       element={<DashboardPage />} />
            <Route path="/teams/create"           element={<CreateTeamPage />} />
            <Route path="/teams/:id"              element={<TeamPage />} />
            <Route path="/matches/create"         element={<CreateMatchPage />} />
            <Route path="/matches/:id"            element={<MatchPage />} />
            <Route path="/matches/:id/live"       element={<LiveScoringPage />} />
            <Route path="/players/:id/stats"      element={<PlayerStatsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
