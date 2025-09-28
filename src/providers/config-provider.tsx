import { createContext, useEffect, useState } from "react";
import { Config } from "../types/config";

export const ConfigContext = createContext<Config | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<Config | null>(null);

    useEffect(() => {
        fetch('/config.json')
            .then((res) => res.json())
            .then(setConfig)
            .catch(error => console.error("Failed to load app config:", error));
    }, []);

    if (!config) return null;


    return (
        <ConfigContext.Provider value={config}>
            {children}
        </ConfigContext.Provider>
    );
}