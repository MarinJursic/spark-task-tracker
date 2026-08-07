interface StatsBarProps {
  total: number;
  completed: number;
}

export function StatsBar({ total, completed }: StatsBarProps) {
  const open = total - completed;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <section className="stats-bar" aria-label="Task progress">
      <div>
        <span className="eyebrow">Today’s overview</span>
        <p aria-live="polite">
          <strong>{open}</strong> open · <strong>{completed}</strong> completed
        </p>
      </div>
      <div className="progress-group">
        <span>{progress}% complete</span>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Tasks completed"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>
    </section>
  );
}
