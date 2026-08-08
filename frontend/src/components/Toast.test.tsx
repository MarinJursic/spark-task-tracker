import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Toast } from "./Toast";

describe("Toast", () => {
  afterEach(() => vi.useRealTimers());

  it("announces success politely and dismisses it after the requested duration", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();

    render(
      <Toast tone="success" message="Task completed." durationMs={2800} onDismiss={onDismiss} />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Task completed.");
    act(() => vi.advanceTimersByTime(2800));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("announces an error assertively and supports manual dismissal", () => {
    const onDismiss = vi.fn();

    render(<Toast tone="error" message="Task could not be saved." onDismiss={onDismiss} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Task could not be saved.");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss message" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
