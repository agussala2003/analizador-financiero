// src/pages/ProfilePage.tsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/use-auth";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Skeleton } from "../ui/skeleton";
import { logger } from "../../lib/logger";
import { UserCircle, User, Target, Heart } from "lucide-react";

const interestOptions = [
  { id: "fundamental_analysis", label: "Análisis Fundamental" },
  { id: "technical_analysis", label: "Análisis Técnico" },
  { id: "dividends", label: "Inversión por Dividendos" },
  { id: "growth_investing", label: "Acciones de Crecimiento" },
  { id: "value_investing", label: "Acciones de Valor" },
  { id: "etfs", label: "ETFs y Fondos Indexados" },
  { id: "market_news", label: "Noticias de Mercado" },
];

const ProfileSkeleton = () => (
  <div className="space-y-8">
    <div className="flex items-center gap-4">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>

    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-60" />
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-md">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function ProfilePage() {
  const { user, profile, refreshProfile, isLoaded } = useAuth();
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [investorProfile, setInvestorProfile] = useState("");
  const [experience, setExperience] = useState("");
  const [interests, setInterests] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
      setInvestorProfile((profile.onboarding_profile as any)?.investorProfile ?? "");
      setExperience((profile.onboarding_profile as any)?.experience ?? "");
      setInterests((profile.onboarding_profile as any)?.interests ?? {});
    }
  }, [profile]);

  const handleInterestChange = (interestId: string) => {
    setInterests((prev) => ({ ...prev, [interestId]: !prev[interestId] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const toastId = toast.loading("Guardando cambios...");

    const onboardingProfile = { investorProfile, experience, interests };

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          onboarding_profile: onboardingProfile,
        })
        .eq("id", user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success("¡Perfil actualizado con éxito!", { id: toastId });
      void logger.info("PROFILE_UPDATE_SUCCESS", `User ${user.id} updated their profile.`);
    } catch (error: unknown) {
      toast.error("No se pudo actualizar el perfil.", { id: toastId });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      void logger.error("PROFILE_UPDATE_FAILED", `Failed to update profile for user ${user.id}`, {
        error: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="p-4 sm:p-6">
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-full">
          <UserCircle className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground">Actualiza tu información y personaliza tu experiencia.</p>
        </div>
      </div>
      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-8">
        {/* Información Personal */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-xl">Información Personal</CardTitle>
            </div>
            <CardDescription>
              Estos datos se mostrarán en la plataforma y en tus interacciones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  Nombre
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Apellido
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferencias de Inversión */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-xl">Preferencias de Inversión</CardTitle>
            </div>
            <CardDescription>
              Ayúdanos a personalizar el contenido, alertas y recomendaciones que recibes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Perfil de Inversor</Label>
                <Select value={investorProfile} onValueChange={setInvestorProfile}>
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Selecciona tu perfil..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservador</SelectItem>
                    <SelectItem value="moderate">Moderado</SelectItem>
                    <SelectItem value="aggressive">Agresivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Nivel de Experiencia</Label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Selecciona tu experiencia..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Principiante</SelectItem>
                    <SelectItem value="intermediate">Intermedio</SelectItem>
                    <SelectItem value="advanced">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Áreas de Interés
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                {interestOptions.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={item.id}
                      checked={interests[item.id] || false}
                      onCheckedChange={() => handleInterestChange(item.id)}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor={item.id}
                      className="text-sm font-medium leading-relaxed cursor-pointer text-foreground/90 hover:text-foreground"
                    >
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botón de acción */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-base font-medium transition-all hover:scale-[1.02] active:scale-100"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}