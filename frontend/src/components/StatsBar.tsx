interface StatsBarProps {
  todo: number;
  inProgress: number;
  done: number;
}

export function StatsBar({ todo, inProgress, done }: StatsBarProps) {
  const total = todo + inProgress + done;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <section className="stats-bar" aria-label="Task progress">
      <div>
        <span className="eyebrow">Today’s overview</span>
        <p aria-live="polite">
          <strong>{todo}</strong> to do · <strong>{inProgress}</strong> in progress ·{" "}
          <strong>{done}</strong> done
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
