import { useEffect, useState } from "react";

export const useResponsiveValue = (values, defaultValue) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const checkValue = () => {
      if (window.innerWidth < 640) return values.mobile;
      if (window.innerWidth < 1024) return values.tablet;
      return values.desktop;
    };
    
    const handleResize = () => setValue(checkValue());
    
    handleResize(); // Llama una vez al inicio
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [values]);

  return value;
};
