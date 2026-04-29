export default function Spinner({ fullPage = false }) {
  if (fullPage) {
    return (
      <div className="spinner-overlay">
        <div className="spinner" />
      </div>
    );
  }
  return <div className="spinner spinner--sm" />;
}
