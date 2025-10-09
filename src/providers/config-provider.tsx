// src/providers/config-provider.tsx

import { createContext, useEffect, useState, ReactNode } from "react";
import { Config } from "../types/config";
import { LoadingScreen } from "../components/ui/loading-screen";
import { ErrorScreen } from "../components/ui/error-screen";

// Creamos un estado inicial que lanza un error claro si se usa fuera del provider.
const initialConfig = new Proxy({}, {
  get: () => {
    throw new Error("useConfig debe ser usado dentro de un ConfigProvider");
  }
}) as Config;

export const ConfigContext = createContext<Config>(initialConfig);

/**
 * Provider encargado de cargar el archivo `config.json` al inicio de la aplicación.
 * Muestra estados de carga y error, y provee la configuración al resto de la app.
 */
export function ConfigProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<Config | null>(null);
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    const fetchConfig = () => {
        setStatus('loading');
        fetch('/config.json')
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Error HTTP: ${res.status}`);
                }
                return res.json();
            })
            .then((data: Config) => {
                setConfig(data);
                setStatus('success');
            })
            .catch(error => {
                console.error("Error crítico: Falló la carga de config.json", error);
                setStatus('error');
            });
    };

    // Efecto para cargar la configuración una sola vez al montar el componente.
    useEffect(() => {
        fetchConfig();
    }, []);

    // Renderizado condicional basado en el estado de la carga.
    if (status === 'loading') {
        return <LoadingScreen message="Cargando configuración..." />;
    }

    if (status === 'error' || !config) {
        return (
            <ErrorScreen
                title="Error Crítico de Configuración"
                message="No se pudo cargar la configuración necesaria para iniciar la aplicación. Por favor, revisa tu conexión e inténtalo de nuevo."
                onRetry={fetchConfig}
            />
        );
    }
    
    // Si todo es exitoso, proveemos la configuración a la aplicación.
    return (
        <ConfigContext.Provider value={config}>
            {children}
        </ConfigContext.Provider>
    );
}