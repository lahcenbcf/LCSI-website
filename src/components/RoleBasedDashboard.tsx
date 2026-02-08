"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import FirstLoginForm from "@/components/FirstLoginForm";
import { useProfileState } from "@/contexts/ProfileStateContext";

interface RoleBasedDashboardProps {
  children: React.ReactNode;
}

export default function RoleBasedDashboard({
  children,
}: RoleBasedDashboardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { profileCreated, resetProfileState } = useProfileState();

  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRoleAndProfile = async () => {
      if (isLoading || !user?.email) {
        setLoading(false);
        return;
      }

      try {
        // Vérifier le rôle et le profil en même temps
        const [roleResponse, profileResponse] = await Promise.all([
          fetch("/api/auth/role"),
          fetch("/api/profile/check"),
        ]);

        const roleData = await roleResponse.json();
        const profileData = await profileResponse.json();

        setUserRole(roleData.user.role);
        setHasProfile(profileData.hasProfile);

        // Les membres peuvent maintenant accéder à toutes les pages du dashboard
        // mais en mode lecture seule
      } catch (error) {
        console.error("Erreur lors de la vérification du rôle/profil:", error);
      } finally {
        setLoading(false);
      }
    };

    checkRoleAndProfile();
  }, [user, isLoading, pathname, router, profileCreated]);

  // Reset profile state après vérification
  useEffect(() => {
    if (profileCreated && hasProfile) {
      resetProfileState();
    }
  }, [profileCreated, hasProfile, resetProfileState]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4 text-mainBlue"
            size={32}
          />
          <p className="text-lightgrayTxt">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur @esi.dz n'a pas de profil membre, afficher le formulaire
  if (user?.email?.endsWith("@esi.dz") && hasProfile === false) {
    return <FirstLoginForm />;
  }

  // Si c'est un admin ou un membre avec profil, afficher le dashboard
  if ((userRole === "ADMIN" || userRole === "MEMBER") && hasProfile) {
    return <>{children}</>;
  }


  // Si l'utilisateur n'est pas @esi.dz, bloquer l'accès
  if (!user?.email?.endsWith("@esi.dz")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">🚫</span>
          </div>
          <h1 className="text-xl font-bold text-darkgrayTxt mb-2">
            Accès restreint
          </h1>
          <p className="text-lightgrayTxt mb-4">
            Seuls les membres du laboratoire (@esi.dz) peuvent accéder à cette
            section.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
