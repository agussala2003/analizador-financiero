// src/features/profile/components/forms/personal-info-form.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { User } from "lucide-react";
import { PersonalInfoFormProps } from "../../types/profile.types";

/**
 * Formulario de información personal del usuario
 */
export function PersonalInfoForm({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
}: PersonalInfoFormProps) {
  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <CardTitle className="text-base sm:text-lg font-semibold">Información Personal</CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm">
          Estos datos se mostrarán en la plataforma y en tus interacciones.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="firstName" className="text-xs sm:text-sm font-medium">
              Nombre
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              placeholder="Tu nombre"
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="lastName" className="text-xs sm:text-sm font-medium">
              Apellido
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              placeholder="Tu apellido"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
