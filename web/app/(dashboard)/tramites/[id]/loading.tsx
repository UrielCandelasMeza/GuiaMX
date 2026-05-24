import { Skeleton } from "@/components/ui/skeleton";

function TimelineSkeleton() {
  return (
    <div className="flex flex-col gap-0">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {/* Columna izquierda: círculo + línea */}
          <div className="flex flex-col items-center">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full bg-slate-200" />
            {i < 3 && <div className="mt-1 w-px flex-1 bg-slate-200 mb-1 min-h-[40px]" />}
          </div>
          {/* Contenido del paso */}
          <div className="flex flex-col gap-2 pb-8 pt-1.5 flex-1">
            <Skeleton className="h-4 w-48 bg-slate-200" />
            <Skeleton className="h-3.5 w-3/4 bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DocumentosPanelSkeleton() {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-4 w-4 bg-slate-200" />
        <Skeleton className="h-4 w-36 bg-slate-200" />
      </div>
      {/* 5 filas de documento */}
      <div className="flex flex-col gap-3 mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <Skeleton className="h-4 w-4 shrink-0 rounded-full bg-slate-200" />
            <Skeleton
              className="h-3.5 bg-slate-100"
              style={{ width: `${55 + (i % 3) * 15}%` }}
            />
          </div>
        ))}
      </div>
      {/* Botón */}
      <Skeleton className="h-9 w-full bg-slate-200 rounded" />
    </div>
  );
}

export default function TramiteDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-1.5">
        <Skeleton className="h-4 w-16 bg-slate-200" />
        <span className="text-slate-300">/</span>
        <Skeleton className="h-4 w-40 bg-slate-200" />
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-72 bg-slate-200" />
          <Skeleton className="h-5 w-20 bg-slate-100 rounded" />
        </div>
        <Skeleton className="h-4 w-full max-w-xl bg-slate-100" />
        <Skeleton className="h-4 w-2/3 max-w-lg bg-slate-100" />
      </div>

      {/* Dos columnas */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Timeline (col-span-2) */}
        <div className="lg:col-span-2">
          <Skeleton className="mb-6 h-5 w-36 bg-slate-200" />
          <TimelineSkeleton />
        </div>

        {/* Panel lateral */}
        <div className="flex flex-col gap-4">
          <DocumentosPanelSkeleton />
          <Skeleton className="h-9 w-full bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
}
