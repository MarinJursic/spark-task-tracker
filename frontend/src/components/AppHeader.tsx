export function AppHeader() {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand" aria-label="Spark Team Tasks">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span className="brand-copy">
            <strong>SPARK</strong>
            <small>TUTORING · TEAM TASKS</small>
          </span>
        </div>
        <span className="header-note">Focused work. Clear ownership.</span>
      </div>
    </header>
  );
}
