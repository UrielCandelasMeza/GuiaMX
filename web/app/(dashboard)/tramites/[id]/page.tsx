import PasoTimeline from "@/components/tramites/PasoTimeline";
import DocumentoBadge from "@/components/tramites/DocumentoBadge";

interface TramiteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TramiteDetailPage({
  params,
}: TramiteDetailPageProps) {
  const { id } = await params;

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-brand-900">
        Detalle del trámite
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">ID: {id}</p>

      {/* TODO: fetch tramite by id */}
      <PasoTimeline pasos={[]} />

      <div className="mt-8 flex flex-wrap gap-2">
        <DocumentoBadge nombre="CURP" requerido />
        <DocumentoBadge nombre="INE / IFE" requerido />
        <DocumentoBadge nombre="Comprobante de domicilio" />
      </div>
    </section>
  );
}
