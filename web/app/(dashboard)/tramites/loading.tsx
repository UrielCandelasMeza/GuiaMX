import { Skeleton } from "@/components/ui/skeleton";

export default function TramitesLoading() {
  return (
    <div className="flex flex-col">
      {/* Header skeleton */}
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-56 bg-slate-200" />
            <Skeleton className="h-4 w-40 bg-slate-100" />
          </div>
          <Skeleton className="h-9 w-full bg-slate-100 sm:w-72" />
        </div>
      </div>

      {/* Grid skeleton — 6 tarjetas */}
      <div className="grid grid-cols-1 gap-4 p-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-md border border-slate-100 bg-white p-5"
          >
            {/* Badge precio */}
            <Skeleton className="h-5 w-20 bg-slate-100" />
            {/* Nombre */}
            <Skeleton className="mt-3 h-4 w-4/5 bg-slate-200" />
            {/* Descripción línea 1 */}
            <Skeleton className="mt-2 h-3.5 w-full bg-slate-100" />
            {/* Descripción línea 2 */}
            <Skeleton className="mt-1.5 h-3.5 w-3/4 bg-slate-100" />
            {/* Footer */}
            <div className="mt-5 flex items-center justify-between">
              <Skeleton className="h-3 w-16 bg-slate-100" />
              <Skeleton className="h-4 w-4 bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
