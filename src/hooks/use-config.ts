// src/hooks/use-config.ts

import { useContext } from "react";
import { ConfigContext } from "../providers/config-provider";
import { Config } from "../types/config";

/**
 * Hook personalizado para acceder a la configuración global de la aplicación.
 * * @throws {Error} Si se utiliza fuera de un `ConfigProvider`.
 * @returns {Config} El objeto de configuración de la aplicación.
 */
export const useConfig = (): Config => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig debe ser utilizado dentro de un ConfigProvider');
  }
  return context;
};