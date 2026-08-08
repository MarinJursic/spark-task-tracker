import { AlertCircle } from "lucide-react";

interface DialogErrorProps {
  message: string | null;
}

export function DialogError({ message }: DialogErrorProps) {
  if (!message) return null;

  return (
    <div className="dialog-error" role="alert">
      <AlertCircle size={18} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
