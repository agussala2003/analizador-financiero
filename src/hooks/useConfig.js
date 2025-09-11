// src/hooks/useConfig.js
import { useContext } from 'react';
import { ConfigContext } from '../context/configContext';

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
