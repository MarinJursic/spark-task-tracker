import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FilterBar } from "./FilterBar";

describe("FilterBar", () => {
  it("reports search, priority, and member filter changes", () => {
    const onQueryChange = vi.fn();
    const onPriorityChange = vi.fn();
    const onMineOnlyChange = vi.fn();
    render(
      <FilterBar
        query=""
        priority="all"
        mineOnly={false}
        onQueryChange={onQueryChange}
        onPriorityChange={onPriorityChange}
        onMineOnlyChange={onMineOnlyChange}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "Search tasks" }), {
      target: { value: "maths" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Priority" }), {
      target: { value: "high" },
    });
    fireEvent.click(screen.getByRole("button", { name: "My tasks" }));

    expect(onQueryChange).toHaveBeenCalledWith("maths");
    expect(onPriorityChange).toHaveBeenCalledWith("high");
    expect(onMineOnlyChange).toHaveBeenCalledWith(true);
  });
});
