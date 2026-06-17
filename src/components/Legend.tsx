// The single most important bit of UI for this brief: an always-visible key
// that tells the instructor which parts of the screen are recorded fact, which
// are calculated, and which are machine suggestions.
export function Legend() {
  return (
    <div className="legend" role="note">
      <span className="legend-title">How to read this</span>
      <span className="legend-item">
        <i className="swatch swatch-source" /> Source events
        <em>recorded by the simulator</em>
      </span>
      <span className="legend-item">
        <i className="swatch swatch-calc" /> Calculated facts
        <em>deterministic, from timestamps</em>
      </span>
      <span className="legend-item">
        <i className="swatch swatch-ai" /> AI suggestions
        <em>simulated · review before use</em>
      </span>
    </div>
  );
}
