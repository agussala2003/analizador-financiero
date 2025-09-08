// src/context/ConfigContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch('/config.json')
      .then((res) => res.json())
      .then(setConfig)
      .catch(error => console.error("Failed to load app config:", error));
  }, []);

  if (!config) {
    // Puedes mostrar un loader aquí si prefieres
    return null;
  }

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}