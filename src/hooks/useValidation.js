// src/hooks/useValidation.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { FinancialValidators } from '../utils/validators';
import { logger } from '../lib/logger';

/**
 * Hook para validación de formularios con soporte avanzado
 */
export function useValidation(schema = {}, options = {}) {
  const {
    validateOnChange = false,
    validateOnBlur = true,
    validateOnSubmit = true,
    debounceMs = 300
  } = options;

  const [fields, setFields] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const debounceTimers = useRef({});

  // Validar un campo específico
  const validateField = useCallback(async (fieldName, value, immediate = false) => {
    if (!schema[fieldName]) return { isValid: true };

    const validate = () => {
      try {
        const validator = schema[fieldName];
        const result = typeof validator === 'function' ? 
          validator(value) : 
          FinancialValidators[validator]?.(value) || { isValid: true };

        setErrors(prev => ({
          ...prev,
          [fieldName]: result.isValid ? null : (result.errors?.[0] || result.message || 'Error de validación')
        }));

        logger.info('FIELD_VALIDATION', 'Campo validado', {
          fieldName,
          isValid: result.isValid,
          hasWarnings: result.hasWarnings
        });

        return result;
      } catch (error) {
        logger.error('VALIDATION_ERROR', 'Error durante validación de campo', {
          fieldName,
          error: error.message
        });
        
        const errorMessage = 'Error de validación';
        setErrors(prev => ({ ...prev, [fieldName]: errorMessage }));
        return { isValid: false, message: errorMessage };
      }
    };

    if (immediate) {
      setIsValidating(true);
      const result = validate();
      setIsValidating(false);
      return result;
    } else {
      // Debounce para validación no inmediata
      clearTimeout(debounceTimers.current[fieldName]);
      return new Promise((resolve) => {
        debounceTimers.current[fieldName] = setTimeout(() => {
          setIsValidating(true);
          const result = validate();
          setIsValidating(false);
          resolve(result);
        }, debounceMs);
      });
    }
  }, [schema, debounceMs]);

  // Validar todos los campos
  const validateAll = useCallback(async (values = fields) => {
    setIsValidating(true);
    const results = {};
    const newErrors = {};

    for (const [fieldName, value] of Object.entries(values)) {
      if (schema[fieldName]) {
        const result = await validateField(fieldName, value, true);
        results[fieldName] = result;
        
        if (!result.isValid) {
          newErrors[fieldName] = result.errors?.[0] || result.message || 'Error de validación';
        }
      }
    }

    setErrors(newErrors);
    setIsValidating(false);

    const isValid = Object.values(results).every(r => r.isValid);
    
    logger.info('FORM_VALIDATION_COMPLETE', 'Validación completa del formulario', {
      isValid,
      fieldsCount: Object.keys(values).length,
      errorsCount: Object.keys(newErrors).length,
      fieldNames: Object.keys(values)
    });

    return { isValid, errors: newErrors, results };
  }, [fields, schema, validateField]);

  // Actualizar valor de campo
  const setFieldValue = useCallback((fieldName, value) => {
    setFields(prev => ({ ...prev, [fieldName]: value }));
    
    if (validateOnChange && touched[fieldName]) {
      validateField(fieldName, value);
    }
  }, [validateOnChange, touched, validateField]);

  // Manejar blur de campo
  const setFieldTouched = useCallback((fieldName, value = fields[fieldName]) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    if (validateOnBlur) {
      validateField(fieldName, value, true);
    }
  }, [validateOnBlur, fields, validateField]);

  // Manejar envío del formulario
  const handleSubmit = useCallback(async (onSubmit) => {
    logger.info('FORM_SUBMIT_STARTED', 'Iniciando envío de formulario');
    
    setIsSubmitting(true);
    
    try {
      // Marcar todos los campos como touched
      const allFieldNames = Object.keys(fields);
      setTouched(prev => 
        allFieldNames.reduce((acc, fieldName) => ({ ...acc, [fieldName]: true }), prev)
      );

      // Validar todos los campos si está habilitado
      if (validateOnSubmit) {
        const validation = await validateAll(fields);
        
        if (!validation.isValid) {
          logger.warn('FORM_SUBMIT_VALIDATION_FAILED', 'Validación fallida en envío', {
            errors: validation.errors
          });
          return { success: false, errors: validation.errors };
        }
      }

      // Ejecutar callback de envío
      const result = await onSubmit(fields);
      
      logger.info('FORM_SUBMIT_SUCCESS', 'Formulario enviado exitosamente');
      return { success: true, data: result };
      
    } catch (error) {
      logger.error('FORM_SUBMIT_ERROR', 'Error durante envío de formulario', {
        error: error.message
      });
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [fields, validateOnSubmit, validateAll]);

  // Resetear formulario
  const reset = useCallback((newFields = {}) => {
    setFields(newFields);
    setErrors({});
    setTouched({});
    setIsValidating(false);
    setIsSubmitting(false);
    
    // Limpiar timers de debounce
    Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    debounceTimers.current = {};
    
    logger.info('FORM_RESET', 'Formulario reseteado');
  }, []);

  // Setear errores manuales (por ejemplo, desde servidor)
  const setServerErrors = useCallback((serverErrors) => {
    setErrors(prev => ({ ...prev, ...serverErrors }));
    
    logger.info('SERVER_ERRORS_SET', 'Errores del servidor establecidos', {
      errorFields: Object.keys(serverErrors)
    });
  }, []);

  // Limpiar error específico
  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => ({ ...prev, [fieldName]: null }));
  }, []);

  // Getters de estado
  const getFieldProps = useCallback((fieldName) => ({
    value: fields[fieldName] || '',
    onChange: (e) => setFieldValue(fieldName, e.target.value),
    onBlur: () => setFieldTouched(fieldName),
    error: errors[fieldName],
    touched: touched[fieldName]
  }), [fields, errors, touched, setFieldValue, setFieldTouched]);

  const isFieldValid = useCallback((fieldName) => {
    return !errors[fieldName];
  }, [errors]);

  const hasErrors = Object.values(errors).some(error => error !== null);
  const isFormValid = !hasErrors && Object.keys(touched).length > 0;

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  return {
    // Estado
    fields,
    errors,
    touched,
    isValidating,
    isSubmitting,
    hasErrors,
    isFormValid,
    
    // Acciones
    setFieldValue,
    setFieldTouched,
    validateField,
    validateAll,
    handleSubmit,
    reset,
    setServerErrors,
    clearFieldError,
    
    // Helpers
    getFieldProps,
    isFieldValid,
    
    // Estado computado
    fieldCount: Object.keys(fields).length,
    errorCount: Object.values(errors).filter(error => error !== null).length,
    touchedCount: Object.keys(touched).length
  };
}

/**
 * Hook especializado para formularios de blog
 */
export function useBlogValidation() {
  const schema = {
    title: FinancialValidators.blogTitle,
    content: FinancialValidators.blogContent,
    excerpt: (value) => FinancialValidators.suggestion(value), // Reutilizar validación
    tags: (value) => {
      const tags = Array.isArray(value) ? value : [];
      return {
        isValid: tags.length > 0 && tags.length <= 5,
        message: tags.length === 0 ? 'Debe agregar al menos una etiqueta' : 
                 tags.length > 5 ? 'Máximo 5 etiquetas permitidas' : null
      };
    }
  };

  return useValidation(schema, {
    validateOnChange: false,
    validateOnBlur: true,
    debounceMs: 500
  });
}

/**
 * Hook especializado para autenticación
 */
export function useAuthValidation() {
  const schema = {
    email: FinancialValidators.email,
    password: FinancialValidators.password,
    confirmPassword: (value, fields) => {
      const password = fields?.password || '';
      return {
        isValid: value === password,
        message: value !== password ? 'Las contraseñas no coinciden' : null
      };
    },
    name: FinancialValidators.profileName
  };

  return useValidation(schema, {
    validateOnChange: false,
    validateOnBlur: true,
    debounceMs: 300
  });
}

/**
 * Hook especializado para perfil de usuario
 */
export function useProfileValidation() {
  const schema = {
    name: FinancialValidators.profileName,
    email: FinancialValidators.email,
    bio: (value) => {
      const result = FinancialValidators.suggestion(value);
      return {
        ...result,
        maxChars: 500,
        charCount: value?.length || 0
      };
    }
  };

  return useValidation(schema, {
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 300
  });
}

export default useValidation;
