// Displays the current over's ball-by-ball dots in the scoring panel
export default function OverSummary({ balls = [] }) {
  const ballLabel = (b) => {
    if (b.is_wicket) return 'W';
    if (b.extras_type === 'wide')   return 'WD';
    if (b.extras_type === 'noball') return 'NB';
    if (b.extras_type === 'bye')    return `B${b.extras_runs}`;
    if (b.extras_type === 'legbye') return `LB${b.extras_runs}`;
    return b.runs_off_bat;
  };

  const ballClass = (b) => {
    if (b.is_wicket)     return 'ball ball--wicket';
    if (b.is_six)        return 'ball ball--six';
    if (b.is_four)       return 'ball ball--four';
    if (b.extras_type !== 'none') return 'ball ball--extra';
    return 'ball';
  };

  return (
    <div className="over-summary">
      <span className="over-summary__label">This over:</span>
      <div className="over-summary__balls">
        {balls.map((b, i) => (
          <span key={i} className={ballClass(b)}>{ballLabel(b)}</span>
        ))}
        {/* Empty slots to show remaining balls */}
        {Array.from({ length: Math.max(0, 6 - balls.length) }).map((_, i) => (
          <span key={`empty-${i}`} className="ball ball--empty" />
        ))}
      </div>
    </div>
  );
}
