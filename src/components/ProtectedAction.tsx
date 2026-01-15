"use client";

import { usePermissions } from "@/contexts/PermissionsContext";

interface ProtectedActionProps {
  action:
    | "edit"
    | "delete"
    | "create"
    | "createMembers"
    | "createPublications"
    | "createTeams"
    | "editMembers"
    | "editTeamInfo"
    | "editOwnProfile";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedAction({
  action,
  children,
  fallback = null,
}: ProtectedActionProps) {
  const {
    canEdit,
    canDelete,
    canCreate,
    canCreateMembers,
    canCreatePublications,
    canCreateTeams,
    canEditMembers,
    canEditTeamInfo,
    canEditOwnProfile,
    loading,
  } = usePermissions();

  if (loading) {
    return null;
  }

  const hasPermission = () => {
    switch (action) {
      case "edit":
        return canEdit;
      case "delete":
        return canDelete;
      case "create":
        return canCreate;
      case "createMembers":
        return canCreateMembers;
      case "createPublications":
        return canCreatePublications;
      case "createTeams":
        return canCreateTeams;
      case "editMembers":
        return canEditMembers;
      case "editTeamInfo":
        return canEditTeamInfo;
      case "editOwnProfile":
        return canEditOwnProfile;
      default:
        return false;
    }
  };

  return hasPermission() ? <>{children}</> : <>{fallback}</>;
}
