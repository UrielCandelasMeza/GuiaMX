export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header skeleton */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-20 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-7 w-32 animate-pulse rounded border border-slate-200 bg-slate-100" />
      </div>

      {/* Mensajes skeleton */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden bg-slate-50 px-4 py-6 md:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {/* Izquierda — asistente */}
          <div className="flex justify-start gap-3">
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-slate-200" />
            <div className="h-12 w-2/3 animate-pulse rounded-lg rounded-bl-none bg-slate-200" />
          </div>
          {/* Derecha — usuario */}
          <div className="flex justify-end">
            <div className="h-12 w-1/2 animate-pulse rounded-lg rounded-br-none bg-slate-200" />
          </div>
          {/* Izquierda */}
          <div className="flex justify-start gap-3">
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-slate-200" />
            <div className="h-12 w-2/3 animate-pulse rounded-lg rounded-bl-none bg-slate-200" />
          </div>
          {/* Derecha */}
          <div className="flex justify-end">
            <div className="h-12 w-1/2 animate-pulse rounded-lg rounded-br-none bg-slate-200" />
          </div>
        </div>
      </div>

      {/* Input skeleton */}
      <div className="border-t border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <div className="h-10 w-full animate-pulse rounded-md border border-slate-200 bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
