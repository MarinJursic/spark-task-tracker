import { AlertCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  return (
    <div className="toast" role="alert">
      <AlertCircle size={19} aria-hidden="true" />
      <span>{message}</span>
      <button type="button" aria-label="Dismiss message" onClick={onDismiss}>
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
