// src/components/ui/ValidationFeedback.jsx
import { useCallback, useEffect, useState } from 'react';
import { logger } from '../../lib/logger';

/**
 * Componente para mostrar errores de validación inline
 */
export function ValidationError({ error, fieldName, className = '' }) {
  
  useEffect(() => {
    logger.info('VALIDATION_ERROR_DISPLAYED', 'Error de validación mostrado', {
      fieldName,
      error
    });
  }, [error, fieldName]);
  
  if (!error) return null;
  return (
    <div className={`text-red-500 text-sm mt-1 flex items-center ${className}`}>
      <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span>{error}</span>
    </div>
  );
}

/**
 * Componente para mostrar advertencias de validación
 */
export function ValidationWarning({ warning, className = '' }) {
  if (!warning) return null;

  return (
    <div className={`text-yellow-500 text-sm mt-1 flex items-center ${className}`}>
      <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span>{warning}</span>
    </div>
  );
}

/**
 * Indicador de fortaleza de contraseña
 */
export function PasswordStrengthIndicator({ result, className = '' }) {
  if (!result || result.isValid === undefined) return null;

  const strength = result.requirements ? Object.values(result.requirements).filter(Boolean).length : 0;
  const strengthLabels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">Fortaleza de contraseña</span>
        <span className={`font-medium ${result.isValid ? 'text-green-600' : 'text-gray-600'}`}>
          {strengthLabels[strength] || 'Muy débil'}
        </span>
      </div>
      
      {/* Barra de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${strengthColors[strength] || strengthColors[0]}`}
          style={{ width: `${(strength / 5) * 100}%` }}
        />
      </div>
      
      {/* Requisitos */}
      {result.requirements && (
        <div className="mt-2 space-y-1">
          {Object.entries({
            length: 'Al menos 8 caracteres',
            uppercase: 'Una letra mayúscula',
            lowercase: 'Una letra minúscula',
            number: 'Un número',
            special: 'Un caracter especial'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center text-xs">
              {result.requirements[key] ? (
                <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
              <span className={result.requirements[key] ? 'text-green-600' : 'text-gray-500'}>
                {label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Contador de caracteres/palabras para contenido
 */
export function ContentCounter({ result, maxChars, maxWords, className = '' }) {
  if (!result) return null;

  const { charCount = 0, wordCount = 0, readingTime = 0 } = result;
  const charProgress = maxChars ? (charCount / maxChars) * 100 : 0;
  const wordProgress = maxWords ? (wordCount / maxWords) * 100 : 0;

  return (
    <div className={`text-sm space-y-2 ${className}`}>
      {/* Contador de caracteres */}
      {maxChars && (
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Caracteres</span>
          <div className="flex items-center space-x-2">
            <span className={charCount > maxChars ? 'text-red-500' : 'text-gray-600'}>
              {charCount.toLocaleString()} / {maxChars.toLocaleString()}
            </span>
            <div className="w-16 bg-gray-200 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-200 ${
                  charProgress > 100 ? 'bg-red-500' : 
                  charProgress > 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(charProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Contador de palabras */}
      {maxWords && (
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Palabras</span>
          <div className="flex items-center space-x-2">
            <span className={wordCount > maxWords ? 'text-red-500' : 'text-gray-600'}>
              {wordCount.toLocaleString()} / {maxWords.toLocaleString()}
            </span>
            <div className="w-16 bg-gray-200 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-200 ${
                  wordProgress > 100 ? 'bg-red-500' : 
                  wordProgress > 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(wordProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Tiempo de lectura */}
      {readingTime > 0 && (
        <div className="flex justify-between items-center text-gray-500">
          <span>Tiempo de lectura estimado</span>
          <span>{readingTime} min</span>
        </div>
      )}
    </div>
  );
}

/**
 * Componente de input con validación integrada
 */
export function ValidatedInput({ 
  type = 'text',
  value,
  onChange,
  onBlur,
  validation,
  fieldName,
  placeholder,
  className = '',
  showPasswordStrength = false,
  ...props 
}) {
  const [validationResult, setValidationResult] = useState(null);
  const [isTouched, setIsTouched] = useState(false);

  const handleBlur = useCallback((e) => {
    setIsTouched(true);
    
    if (validation && value) {
      const result = typeof validation === 'function' ? validation(value) : validation;
      setValidationResult(result);
    }
    
    onBlur?.(e);
  }, [validation, value, onBlur]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    onChange?.(e);
    
    // Validación en tiempo real solo después del primer blur
    if (validation && isTouched) {
      const result = typeof validation === 'function' ? validation(newValue) : validation;
      setValidationResult(result);
    }
  }, [validation, onChange, isTouched]);

  const hasError = validationResult && !validationResult.isValid;
  const hasWarning = validationResult && validationResult.hasWarnings;

  return (
    <div className="space-y-1">
      <input
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2 border rounded-md transition-colors duration-200
          ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' :
            hasWarning ? 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-200' :
            'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          ${className}
        `}
        {...props}
      />
      
      {validationResult && (
        <>
          <ValidationError 
            error={validationResult.errors?.[0]} 
            fieldName={fieldName} 
          />
          
          {validationResult.warnings?.map((warning, index) => (
            <ValidationWarning 
              key={index}
              warning={warning} 
              fieldName={fieldName} 
            />
          ))}
          
          {showPasswordStrength && type === 'password' && (
            <PasswordStrengthIndicator result={validationResult} />
          )}
        </>
      )}
    </div>
  );
}

/**
 * Textarea con validación y contador
 */
export function ValidatedTextarea({ 
  value,
  onChange,
  onBlur,
  validation,
  fieldName,
  placeholder,
  className = '',
  maxChars,
  maxWords,
  showCounter = true,
  ...props 
}) {
  const [validationResult, setValidationResult] = useState(null);
  const [isTouched, setIsTouched] = useState(false);

  const handleBlur = useCallback((e) => {
    setIsTouched(true);
    
    if (validation && value) {
      const result = typeof validation === 'function' ? validation(value) : validation;
      setValidationResult(result);
    }
    
    onBlur?.(e);
  }, [validation, value, onBlur]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    onChange?.(e);
    
    if (validation && isTouched) {
      const result = typeof validation === 'function' ? validation(newValue) : validation;
      setValidationResult(result);
    }
  }, [validation, onChange, isTouched]);

  const hasError = validationResult && !validationResult.isValid;

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2 border rounded-md transition-colors duration-200 resize-vertical
          ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' :
            'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          ${className}
        `}
        {...props}
      />
      
      {validationResult && (
        <ValidationError 
          error={validationResult.errors?.[0]} 
          fieldName={fieldName} 
        />
      )}
      
      {showCounter && validationResult && (
        <ContentCounter 
          result={validationResult}
          maxChars={maxChars}
          maxWords={maxWords}
        />
      )}
    </div>
  );
}
