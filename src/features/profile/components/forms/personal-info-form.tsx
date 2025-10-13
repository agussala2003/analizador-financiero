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
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-muted-foreground" />
          <CardTitle className="heading-4">Información Personal</CardTitle>
        </div>
        <CardDescription>
          Estos datos se mostrarán en la plataforma y en tus interacciones.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="body-sm font-medium">
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
          <div className="space-y-2">
            <Label htmlFor="lastName" className="body-sm font-medium">
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
