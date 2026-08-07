import { Search } from "lucide-react";

import type { TaskStatus } from "../types";

interface FilterBarProps {
  query: string;
  status: TaskStatus;
  onQueryChange: (query: string) => void;
  onStatusChange: (status: TaskStatus) => void;
}

const filters: { label: string; value: TaskStatus }[] = [
  { label: "All tasks", value: "all" },
  { label: "Open", value: "open" },
  { label: "Completed", value: "completed" },
];

export function FilterBar({ query, status, onQueryChange, onStatusChange }: FilterBarProps) {
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
      <div className="status-filters" aria-label="Filter by completion status">
        {filters.map((filter) => (
          <button
            className={status === filter.value ? "active" : undefined}
            key={filter.value}
            type="button"
            aria-pressed={status === filter.value}
            onClick={() => onStatusChange(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </section>
  );
}
