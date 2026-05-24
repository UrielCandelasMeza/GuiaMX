import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="flex gap-3 rounded-md border border-red-200 bg-red-50 p-4"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
      <div className="flex flex-col gap-1">
        <p className="text-sm text-red-800">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-fit text-sm text-red-700 underline underline-offset-2 hover:text-red-900 transition-colors"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
