// src/features/auth/components/shared/form-input.tsx

import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';

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
}: FormInputProps) {
  return (
    <div className="grid gap-3">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
}
