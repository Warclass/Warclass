"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "swagger-ui-react/swagger-ui.css";
import "./custom.css";

// Importar SwaggerUI dinámicamente para evitar problemas de SSR
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Cargando documentación...
          </p>
        </div>
      </div>
    );
  }

  return (
    <SwaggerUI
      url="/api/docs"
      docExpansion="list"
      defaultModelsExpandDepth={3}
      defaultModelExpandDepth={3}
    />
  );
}
