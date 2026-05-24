export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-brand-900">
        Bienvenido a <span className="text-brand-600">GuiaMX</span>
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Tu guía inteligente para trámites gubernamentales en México.
      </p>
    </main>
  );
}
