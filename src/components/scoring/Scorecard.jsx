// Reusable scorecard table used in both live view and full scorecard page

const dismissalText = (row) => {
  if (!row.is_out) return 'not out';
  const dm = row.dismissal_type?.replace('_', ' ') || '';
  if (['bowled', 'lbw', 'hit_wicket'].includes(row.dismissal_type))
    return `${dm} b ${row.bowler_name || ''}`;
  if (row.dismissal_type === 'caught')
    return `c ${row.fielder_name || ''} b ${row.bowler_name || ''}`;
  if (row.dismissal_type === 'stumped')
    return `st ${row.fielder_name || ''} b ${row.bowler_name || ''}`;
  if (row.dismissal_type === 'run_out')
    return `run out (${row.fielder_name || ''})`;
  return dm;
};

const oversDisplay = (balls) => {
  const o = Math.floor(balls / 6);
  const b = balls % 6;
  return b === 0 ? `${o}.0` : `${o}.${b}`;
};

export default function Scorecard({ innings, batting = [], bowling = [] }) {
  if (!innings) return null;

  const extras = innings.extras || {};
  const extrasTotal = Object.values(extras).reduce((a, b) => a + (b || 0), 0);

  return (
    <div className="scorecard">
      {/* Innings header */}
      <div className="scorecard__header">
        <h3>{innings.batting_team_name}</h3>
        <div className="scorecard__total">
          <span className="scorecard__runs">
            {innings.total_runs}/{innings.total_wickets}
          </span>
          <span className="scorecard__overs">
            ({oversDisplay(innings.total_balls)} ov)
          </span>
        </div>
        {innings.target && (
          <span className="scorecard__target">Target: {innings.target}</span>
        )}
      </div>

      {/* Batting */}
      <table className="table scorecard__table">
        <thead>
          <tr>
            <th>Batsman</th>
            <th>Dismissal</th>
            <th className="text-right">R</th>
            <th className="text-right">B</th>
            <th className="text-right">4s</th>
            <th className="text-right">6s</th>
            <th className="text-right">SR</th>
          </tr>
        </thead>
        <tbody>
          {batting.map(row => (
            <tr key={row.player_id} className={!row.is_out ? 'row--batting' : ''}>
              <td>
                <strong>{row.player_name}</strong>
                {!row.is_out && <span className="batting-indicator"> *</span>}
              </td>
              <td className="text-muted">{dismissalText(row)}</td>
              <td className="text-right"><strong>{row.runs}</strong></td>
              <td className="text-right">{row.balls_faced}</td>
              <td className="text-right">{row.fours}</td>
              <td className="text-right">{row.sixes}</td>
              <td className="text-right">
                {row.balls_faced > 0
                  ? ((row.runs / row.balls_faced) * 100).toFixed(1)
                  : '0.0'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}>
              Extras: {extrasTotal}
              <span className="text-muted extras-breakdown">
                {' '}(w {extras.wide || 0}, nb {extras.noball || 0}, b {extras.bye || 0}, lb {extras.legbye || 0})
              </span>
            </td>
            <td className="text-right" colSpan={5}>
              <strong>Total: {innings.total_runs}/{innings.total_wickets}</strong>
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Bowling */}
      <h4 className="scorecard__section-title">Bowling</h4>
      <table className="table scorecard__table">
        <thead>
          <tr>
            <th>Bowler</th>
            <th className="text-right">O</th>
            <th className="text-right">M</th>
            <th className="text-right">R</th>
            <th className="text-right">W</th>
            <th className="text-right">Econ</th>
            <th className="text-right">WD</th>
            <th className="text-right">NB</th>
          </tr>
        </thead>
        <tbody>
          {bowling.map(row => (
            <tr key={row.player_id}>
              <td>{row.player_name}</td>
              <td className="text-right">{oversDisplay(row.balls_bowled)}</td>
              <td className="text-right">{row.maidens}</td>
              <td className="text-right">{row.runs_conceded}</td>
              <td className="text-right"><strong>{row.wickets}</strong></td>
              <td className="text-right">
                {row.balls_bowled > 0
                  ? (row.runs_conceded / (row.balls_bowled / 6)).toFixed(2)
                  : '0.00'}
              </td>
              <td className="text-right">{row.wides}</td>
              <td className="text-right">{row.no_balls}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
