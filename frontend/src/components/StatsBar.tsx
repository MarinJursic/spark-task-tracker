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
        <p>
          <strong>{open}</strong> open · <strong>{completed}</strong> completed
        </p>
      </div>
      <div className="progress-group">
        <span>{progress}% complete</span>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>
    </section>
  );
}
