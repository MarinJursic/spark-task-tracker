import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FilterBar } from "./FilterBar";

describe("FilterBar", () => {
  it("reports search and status changes", () => {
    const onQueryChange = vi.fn();
    const onStatusChange = vi.fn();
    render(
      <FilterBar
        query=""
        status="all"
        onQueryChange={onQueryChange}
        onStatusChange={onStatusChange}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "Search tasks" }), {
      target: { value: "maths" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Completed" }));

    expect(onQueryChange).toHaveBeenCalledWith("maths");
    expect(onStatusChange).toHaveBeenCalledWith("completed");
  });
});
