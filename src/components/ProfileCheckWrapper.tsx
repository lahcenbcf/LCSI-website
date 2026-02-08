"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import FirstLoginForm from "@/components/FirstLoginForm";
import { Loader2 } from "lucide-react";

interface ProfileCheckWrapperProps {
  children: React.ReactNode;
}

export default function ProfileCheckWrapper({
  children,
}: ProfileCheckWrapperProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Pages qui ne nécessitent pas de vérification de profil
  const excludedPaths = ["/", "/auth", "/complete-profile"];
  const isDashboardPath = pathname.includes("/dash");
  const isExcluded = excludedPaths.some((path) => pathname.startsWith(path));

  useEffect(() => {
    const checkProfile = async () => {
      // Si pas connecté ou sur une page exclue, pas besoin de vérifier
      if (isLoading || !user?.email || isExcluded) {
        setLoading(false);
        return;
      }

      // Vérifier seulement pour les utilisateurs @esi.dz
      if (!user.email.endsWith("@esi.dz")) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/profile/check");
        const data = await response.json();

        setHasProfile(data.hasProfile);

        // Si pas de profil et on essaie d'accéder au dashboard, rediriger
        if (!data.hasProfile && isDashboardPath) {
          router.push("/complete-profile");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du profil:", error);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [user, isLoading, pathname, router, isExcluded, isDashboardPath]);

  // Loading state - Afficher seulement pour les pages dashboard ou si authentifié
  if (
    (loading || isLoading) &&
    (isDashboardPath || !!user)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4 text-mainBlue"
            size={32}
          />
          <p className="text-lightgrayTxt">Vérification du profil...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'a pas de profil et essaie d'accéder au dashboard
  if (
    user?.email?.endsWith("@esi.dz") &&
    hasProfile === false &&
    isDashboardPath
  ) {
    return <FirstLoginForm />;
  }

  // Si on est sur /complete-profile et qu'on a déjà un profil, rediriger
  if (pathname === "/complete-profile" && hasProfile === true) {
    router.push("/fr/dash");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4 text-mainBlue"
            size={32}
          />
          <p className="text-lightgrayTxt">Redirection...</p>
        </div>
      </div>
    );
  }

  // Afficher le contenu normal
  return <>{children}</>;
}
