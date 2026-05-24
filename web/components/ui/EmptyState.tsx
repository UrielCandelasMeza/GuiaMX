import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <Icon
        className="mx-auto mb-4 h-12 w-12 text-slate-300"
        strokeWidth={1.5}
        aria-hidden
      />
      <p className="font-medium text-slate-600">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
