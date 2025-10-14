// src/features/profile/pages/profile-page.tsx

import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/use-auth";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { logger } from "../../../lib/logger";
import { UserCircle } from "lucide-react";
import { OnboardingProfile, UserProfile } from "../types/profile.types";
import { extractOnboardingProfile, formatSupabaseError } from "../lib/profile.utils";
import {
  ProfileSkeleton,
  PersonalInfoForm,
  InvestmentPreferencesForm,
} from "../components";

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
      setFirstName((profile as UserProfile).first_name ?? "");
      setLastName((profile as UserProfile).last_name ?? "");
      const onboarding = extractOnboardingProfile((profile as UserProfile).onboarding_profile);
      setInvestorProfile(onboarding.investorProfile ?? "");
      setExperience(onboarding.experience ?? "");
      setInterests(onboarding.interests ?? {});
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

    const onboardingProfile: OnboardingProfile = { investorProfile, experience, interests };

    try {
      const { error }: { error: unknown } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          onboarding_profile: onboardingProfile,
        })
        .eq("id", user.id);

      if (error) throw new Error(formatSupabaseError(error));

      await refreshProfile();
      toast.success("¡Perfil actualizado con éxito!", { id: toastId });
      void logger.info(
        "PROFILE_UPDATE_SUCCESS",
        `User ${user.id} updated their profile.`
      );
    } catch (error: unknown) {
      toast.error("No se pudo actualizar el perfil.", { id: toastId });
      const errorMessage = formatSupabaseError(error);
      void logger.error(
        "PROFILE_UPDATE_FAILED",
        `Failed to update profile for user ${user.id}`,
        { error: errorMessage }
      );
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
      className="container-wide stack-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center gap-4 section-divider">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UserCircle className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="heading-2">
              Mi Perfil
            </h1>
            <p className="text-muted-foreground">
              Actualiza tu información y personaliza tu experiencia.
            </p>
          </div>
        </div>
      </motion.div>

      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="space-y-8"
      >
        {/* Información Personal */}
        <PersonalInfoForm
          firstName={firstName}
          lastName={lastName}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
        />

        {/* Preferencias de Inversión */}
        <InvestmentPreferencesForm
          investorProfile={investorProfile}
          experience={experience}
          interests={interests}
          onInvestorProfileChange={setInvestorProfile}
          onExperienceChange={setExperience}
          onInterestChange={handleInterestChange}
        />

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