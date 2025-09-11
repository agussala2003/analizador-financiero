import React from "react";
import { useConfig } from "../../hooks/useConfig";

// src/components/Footer.jsx
function Footer() {
  const config = useConfig();
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-gray-800 border-t border-gray-700 text-gray-400 text-xs sm:text-sm py-3 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>
          © {new Date().getFullYear()} Analizador Financiero. Todos los derechos reservados.
        </p>
        <p className="text-gray-500">
          Versión {config.app.version} · Contacto: {config.app.contactEmail}
        </p>
      </div>
    </footer>
  );
}

export default React.memo(Footer);
