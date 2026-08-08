import { Search } from "lucide-react";

import type { PriorityFilter } from "../types";

interface FilterBarProps {
  query: string;
  priority: PriorityFilter;
  mineOnly: boolean;
  onQueryChange: (query: string) => void;
  onPriorityChange: (priority: PriorityFilter) => void;
  onMineOnlyChange: (mineOnly: boolean) => void;
}

export function FilterBar({
  query,
  priority,
  mineOnly,
  onQueryChange,
  onPriorityChange,
  onMineOnlyChange,
}: FilterBarProps) {
  return (
    <section className="filter-bar" aria-label="Task filters">
      <label className="search-field">
        <Search size={19} aria-hidden="true" />
        <span className="sr-only">Search tasks</span>
        <input
          type="search"
          value={query}
          maxLength={100}
          placeholder="Search title or description"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>
      <div className="filter-actions">
        <label className="priority-filter">
          <span>Priority</span>
          <select
            value={priority}
            onChange={(event) => onPriorityChange(event.target.value as PriorityFilter)}
          >
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
        <button
          className={`mine-filter${mineOnly ? " active" : ""}`}
          type="button"
          aria-pressed={mineOnly}
          onClick={() => onMineOnlyChange(!mineOnly)}
        >
          My tasks
        </button>
      </div>
    </section>
  );
}
