"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

interface PermissionsContextType {
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
  canCreateMembers: boolean;
  canCreatePublications: boolean;
  canCreateTeams: boolean;
  canEditMembers: boolean;
  canEditTeamInfo: boolean;
  canEditOwnProfile: boolean;
  userRole: string | null;
  loading: boolean;
}

const PermissionsContext = createContext<PermissionsContextType>({
  canEdit: false,
  canDelete: false,
  canCreate: false,
  canCreateMembers: false,
  canCreatePublications: false,
  canCreateTeams: false,
  canEditMembers: false,
  canEditTeamInfo: false,
  canEditOwnProfile: false,
  userRole: null,
  loading: true,
});

export function PermissionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (isLoading || !user?.email) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/role");
        const data = await response.json();
        setUserRole(data.user.role);
      } catch (error) {
        console.error("Erreur lors de la récupération du rôle:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user, isLoading]);

  // Permissions générales
  const canEdit = userRole === "ADMIN";
  const canDelete = userRole === "ADMIN";
  const canCreate = userRole === "ADMIN";

  // Permissions spécifiques selon les nouvelles règles
  const canCreateMembers = false; // Plus personne ne peut créer des membres (auto-création OAuth)
  const canCreatePublications = userRole === "ADMIN" || userRole === "MEMBER"; // Admin ET membres peuvent créer
  const canCreateTeams = userRole === "ADMIN";
  const canEditMembers = false; // Plus personne ne peut modifier les autres membres
  const canEditTeamInfo = userRole === "ADMIN"; // Admin peut modifier les infos d'équipe (pas les membres)
  const canEditOwnProfile = true; // Tout le monde peut modifier son propre profil

  return (
    <PermissionsContext.Provider
      value={{
        canEdit,
        canDelete,
        canCreate,
        canCreateMembers,
        canCreatePublications,
        canCreateTeams,
        canEditMembers,
        canEditTeamInfo,
        canEditOwnProfile,
        userRole,
        loading,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
};
