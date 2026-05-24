export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full border-t border-brand-800 bg-brand-950 py-6 text-center text-sm text-brand-100">
      <p>
        © {year} GuiaMX — Plataforma de orientación ciudadana. México.
      </p>
    </footer>
  );
}
