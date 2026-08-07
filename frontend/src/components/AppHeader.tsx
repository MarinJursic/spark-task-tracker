export function AppHeader() {
  return (
    <header className="app-header">
      <div className="header-inner">
        <a className="brand" href="#main-content" aria-label="Spark Team Tasks home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="brand-copy">
            <strong>SPARK</strong>
            <small>TEAM TASKS</small>
          </span>
        </a>
        <span className="header-note">Focused work. Clear ownership.</span>
      </div>
    </header>
  );
}
