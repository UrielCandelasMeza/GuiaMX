import TramiteCard from "@/components/tramites/TramiteCard";

export const metadata = {
  title: "Trámites — GuiaMX",
  description: "Explora y gestiona tus trámites gubernamentales.",
};

export default function TramitesPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold text-brand-900">Mis trámites</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* TODO: fetch tramites and render TramiteCard list */}
        <TramiteCard
          id="demo-1"
          titulo="Alta en el RFC"
          descripcion="Inscripción al Registro Federal de Contribuyentes ante el SAT."
          estado="pendiente"
        />
      </div>
    </section>
  );
}
