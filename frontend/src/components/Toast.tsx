import { useEffect } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

type ToastTone = "error" | "success";

interface ToastProps {
  message: string;
  onDismiss: () => void;
  tone: ToastTone;
  durationMs?: number;
}

export function Toast({ message, onDismiss, tone, durationMs }: ToastProps) {
  useEffect(() => {
    if (!durationMs) return undefined;

    const timeoutId = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(timeoutId);
  }, [durationMs, message, onDismiss]);

  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={`toast ${tone}`}
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
    >
      <Icon size={18} aria-hidden="true" />
      <span>{message}</span>
      <button type="button" aria-label="Dismiss message" onClick={onDismiss}>
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
