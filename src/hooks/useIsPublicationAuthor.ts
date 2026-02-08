import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";

interface Publication {
  id: string;
  authors: Array<{
    id: string;
    email?: string;
  }>;
}

/**
 * Hook pour vérifier si l'utilisateur connecté est auteur d'une publication
 */
export function useIsPublicationAuthor(publication: Publication | null): {
  isAuthor: boolean;
  isAdmin: boolean;
  canModify: boolean;
  loading: boolean;
} {
  const { user, isLoading } = useAuth();
  const [memberData, setMemberData] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const userRole = user?.role || "MEMBER";
  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    async function fetchMember() {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          if (data.exists) {
            setMemberData({ id: data.id });
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMember();
  }, [user]);

  const isAuthor =
    !!memberData &&
    !!publication &&
    publication.authors.some((author) => author.id === memberData.id);

  const canModify = isAdmin || isAuthor;

  return {
    isAuthor,
    isAdmin,
    canModify,
    loading: isLoading || loading,
  };
}
