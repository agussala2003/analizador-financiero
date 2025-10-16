// src/features/auth/components/shared/form-input.tsx

import { useState } from 'react';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

/**
 * Props para el componente FormInput.
 * @property id - ID del input
 * @property label - Label del input
 * @property type - Tipo de input
 * @property placeholder - Placeholder opcional
 * @property value - Valor actual
 * @property onChange - Callback cuando cambia el valor
 * @property required - Si el campo es requerido
 * @property autoComplete - Valor de autocomplete HTML
 * @property error - Mensaje de error opcional
 * @property success - Mensaje de éxito opcional
 */
interface FormInputProps {
  id: string;
  label: string;
  type: 'email' | 'password' | 'text';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  error?: string;
  success?: string;
}

/**
 * Input reutilizable para formularios de autenticación.
 * Incluye label y manejo de cambios simplificado.
 * 
 * @example
 * ```tsx
 * <FormInput
 *   id="email"
 *   label="Correo Electrónico"
 *   type="email"
 *   value={email}
 *   onChange={setEmail}
 *   required
 * />
 * ```
 */
export function FormInput({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
  error,
  success,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="grid gap-2 sm:gap-3">
      <Label htmlFor={id} className={`text-sm ${error ? 'text-destructive' : ''}`}>
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
          required={required}
          autoComplete={autoComplete}
          className={`h-10 sm:h-11 text-sm sm:text-base ${error ? 'border-destructive focus-visible:ring-destructive' : success ? 'border-green-500 focus-visible:ring-green-500' : ''}`}
        />
        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-2 sm:px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>
      {error && (
        <p className="text-xs sm:text-sm text-destructive animate-slide-down">{error}</p>
      )}
      {success && (
        <p className="text-xs sm:text-sm text-green-600 dark:text-green-500 animate-slide-down">{success}</p>
      )}
    </div>
  );
}
