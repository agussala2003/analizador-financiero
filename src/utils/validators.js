// src/utils/validators.js
import { useCallback, useState } from 'react';
import { logger } from '../lib/logger';

/**
 * Clase base para validación con logging automático
 */
class Validator {
  static validate(value, rules, fieldName = 'field') {
    const errors = [];
    const warnings = [];
    
    for (const rule of rules) {
      try {
        const result = rule.validate(value);
        if (!result.isValid) {
          if (result.severity === 'warning') {
            warnings.push(result.message);
          } else {
            errors.push(result.message);
          }
        }
      } catch (error) {
        logger.error('VALIDATION_ERROR', 'Error durante validación', {
          fieldName,
          rule: rule.name,
          error: error.message
        });
        errors.push(`Error de validación interno en ${rule.name}`);
      }
    }
    
    const isValid = errors.length === 0;
    
    if (!isValid) {
      logger.warn('VALIDATION_FAILED', 'Validación fallida', {
        fieldName,
        errors,
        warnings,
        value: typeof value === 'string' ? value.substring(0, 100) : typeof value
      });
    }
    
    return {
      isValid,
      errors,
      warnings,
      hasWarnings: warnings.length > 0
    };
  }
}

/**
 * Reglas de validación reutilizables
 */
export const ValidationRules = {
  // Email
  email: {
    name: 'email',
    validate: (email) => {
      const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      return {
        isValid: regex.test(email),
        message: 'Email debe tener un formato válido'
      };
    }
  },

  // Password strength
  password: {
    name: 'password',
    validate: (password) => {
      const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      };
      
      const failedRequirements = Object.entries(requirements)
        .filter(([_, passed]) => !passed)
        .map(([req]) => req);
      
      return {
        isValid: failedRequirements.length === 0,
        message: `Password debe tener: ${failedRequirements.join(', ')}`,
        requirements,
        strength: Object.values(requirements).filter(Boolean).length
      };
    }
  },

  // Ticker symbol
  ticker: {
    name: 'ticker',
    validate: (ticker) => {
      const cleaned = ticker.trim().toUpperCase();
      const isValid = /^[A-Z]{1,5}$/.test(cleaned);
      return {
        isValid,
        message: 'Ticker debe tener 1-5 letras mayúsculas',
        normalized: cleaned
      };
    }
  },

  // Blog content
  blogContent: {
    name: 'blogContent',
    validate: (content) => {
      const trimmed = content.trim();
      const wordCount = trimmed.split(/\s+/).filter(word => word.length > 0).length;
      const charCount = trimmed.length;
      
      const errors = [];
      if (wordCount < 100) errors.push('Debe tener al menos 100 palabras');
      if (charCount > 10000) errors.push('No puede exceder 10,000 caracteres');
      if (trimmed.length === 0) errors.push('No puede estar vacío');
      
      return {
        isValid: errors.length === 0,
        message: errors.join(', '),
        wordCount,
        charCount,
        readingTime: Math.ceil(wordCount / 200) // ~200 palabras por minuto
      };
    }
  },

  // Required field
  required: {
    name: 'required',
    validate: (value) => {
      const isEmpty = value === null || value === undefined || 
                     (typeof value === 'string' && value.trim() === '') ||
                     (Array.isArray(value) && value.length === 0);
      
      return {
        isValid: !isEmpty,
        message: 'Este campo es requerido'
      };
    }
  },

  // Minimum length
  minLength: (min) => ({
    name: 'minLength',
    validate: (value) => {
      const length = typeof value === 'string' ? value.length : 0;
      return {
        isValid: length >= min,
        message: `Debe tener al menos ${min} caracteres`
      };
    }
  }),

  // Maximum length
  maxLength: (max) => ({
    name: 'maxLength',
    validate: (value) => {
      const length = typeof value === 'string' ? value.length : 0;
      return {
        isValid: length <= max,
        message: `No puede exceder ${max} caracteres`
      };
    }
  }),

  // Numeric range
  numericRange: (min, max) => ({
    name: 'numericRange',
    validate: (value) => {
      const num = parseFloat(value);
      const isValidNumber = !isNaN(num) && isFinite(num);
      const inRange = isValidNumber && num >= min && num <= max;
      
      return {
        isValid: isValidNumber && inRange,
        message: isValidNumber ? 
          `Debe estar entre ${min} y ${max}` : 
          'Debe ser un número válido'
      };
    }
  }),

  // URL validation
  url: {
    name: 'url',
    validate: (url) => {
      try {
        const urlObj = new URL(url);
        const isAllowedProtocol = ['http:', 'https:'].includes(urlObj.protocol);
        
        return {
          isValid: isAllowedProtocol,
          message: 'URL debe usar protocolo HTTP o HTTPS',
          normalized: urlObj.href
        };
      } catch {
        return {
          isValid: false,
          message: 'URL debe tener un formato válido'
        };
      }
    }
  },

  // Custom regex
  pattern: (regex, message) => ({
    name: 'pattern',
    validate: (value) => ({
      isValid: regex.test(value),
      message
    })
  }),

  // File validation
  file: (options = {}) => ({
    name: 'file',
    validate: (file) => {
      const { maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options; // 5MB default
      
      if (!file || !(file instanceof File)) {
        return { isValid: false, message: 'Archivo requerido' };
      }
      
      if (file.size > maxSize) {
        return { 
          isValid: false, 
          message: `Archivo muy grande. Máximo ${Math.round(maxSize / 1024 / 1024)}MB` 
        };
      }
      
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return { 
          isValid: false, 
          message: `Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}` 
        };
      }
      
      return { isValid: true };
    }
  })
};

/**
 * Validadores específicos para el dominio financiero
 */
export const FinancialValidators = {
  email: (email) => Validator.validate(email, [ValidationRules.required, ValidationRules.email], 'email'),
  
  password: (password) => Validator.validate(password, [ValidationRules.required, ValidationRules.password], 'password'),
  
  ticker: (ticker) => Validator.validate(ticker, [ValidationRules.required, ValidationRules.ticker], 'ticker'),
  
  blogTitle: (title) => Validator.validate(title, [
    ValidationRules.required,
    ValidationRules.minLength(10),
    ValidationRules.maxLength(100)
  ], 'blogTitle'),
  
  blogContent: (content) => Validator.validate(content, [
    ValidationRules.required,
    ValidationRules.blogContent
  ], 'blogContent'),
  
  suggestion: (suggestion) => Validator.validate(suggestion, [
    ValidationRules.required,
    ValidationRules.minLength(20),
    ValidationRules.maxLength(1000)
  ], 'suggestion'),
  
  profileName: (name) => Validator.validate(name, [
    ValidationRules.required,
    ValidationRules.minLength(2),
    ValidationRules.maxLength(50),
    ValidationRules.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras y espacios permitidos')
  ], 'profileName'),
  
  amount: (amount, min = 0, max = 1000000) => Validator.validate(amount, [
    ValidationRules.required,
    ValidationRules.numericRange(min, max)
  ], 'amount'),
  
  percentage: (percentage) => Validator.validate(percentage, [
    ValidationRules.required,
    ValidationRules.numericRange(0, 100)
  ], 'percentage'),
  
  blogImage: (file) => Validator.validate(file, [
    ValidationRules.file({
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    })
  ], 'blogImage')
};

/**
 * Hook para validación en tiempo real en formularios
 */
export function useFormValidation(schema, options = {}) {
  const { validateOnChange = true, validateOnBlur = true } = options;
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback(async (fieldName, value) => {
    if (!schema[fieldName]) return { isValid: true };
    
    setIsValidating(true);
    
    try {
      // Validación síncrona
      const validator = schema[fieldName];
      const result = typeof validator === 'function' ? 
        validator(value) : 
        Validator.validate(value, validator, fieldName);
      
      setErrors(prev => ({
        ...prev,
        [fieldName]: result.isValid ? null : result.errors?.[0] || result.message
      }));
      
      return result;
    } catch (error) {
      logger.error('FORM_VALIDATION_ERROR', 'Error en validación de formulario', {
        fieldName,
        error: error.message
      });
      
      setErrors(prev => ({
        ...prev,
        [fieldName]: 'Error de validación'
      }));
      
      return { isValid: false, message: 'Error de validación' };
    } finally {
      setIsValidating(false);
    }
  }, [schema]);

  const validateAll = useCallback(async (values) => {
    const results = {};
    const newErrors = {};
    
    for (const [fieldName, value] of Object.entries(values)) {
      const result = await validateField(fieldName, value);
      results[fieldName] = result;
      if (!result.isValid) {
        newErrors[fieldName] = result.errors?.[0] || result.message;
      }
    }
    
    setErrors(newErrors);
    const isValid = Object.values(results).every(r => r.isValid);
    
    logger.info('FORM_VALIDATION_COMPLETED', 'Validación de formulario completada', {
      isValid,
      fieldsValidated: Object.keys(values).length,
      errorsCount: Object.keys(newErrors).length
    });
    
    return { isValid, errors: newErrors, results };
  }, [validateField]);

  const handleFieldChange = useCallback((fieldName, value) => {
    if (validateOnChange && touched[fieldName]) {
      validateField(fieldName, value);
    }
  }, [validateField, validateOnChange, touched]);

  const handleFieldBlur = useCallback((fieldName, value) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    if (validateOnBlur) {
      validateField(fieldName, value);
    }
  }, [validateField, validateOnBlur]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    isValidating,
    validateField,
    validateAll,
    handleFieldChange,
    handleFieldBlur,
    clearErrors,
    hasErrors: Object.values(errors).some(error => error !== null),
    getFieldError: (fieldName) => errors[fieldName],
    isFieldTouched: (fieldName) => touched[fieldName]
  };
}

/**
 * Sanitización de inputs para prevenir XSS
 */
export const sanitize = {
  text: (input) => {
    if (typeof input !== 'string') return input;
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  },
  
  html: (input) => {
    // Requiere DOMPurify para uso seguro
    if (typeof window !== 'undefined' && window.DOMPurify) {
      return window.DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3'],
        ALLOWED_ATTR: []
      });
    }
    return sanitize.text(input);
  },
  
  url: (input) => {
    try {
      const url = new URL(input);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  }
};

export default FinancialValidators;
