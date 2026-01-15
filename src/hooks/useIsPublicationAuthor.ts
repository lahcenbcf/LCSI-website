import { useSession } from "next-auth/react";
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
  const { data: session, status } = useSession();
  const [memberData, setMemberData] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const userRole = (session?.user as any)?.role || "MEMBER";
  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    async function fetchMember() {
      if (!session?.user?.email) {
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
  }, [session]);

  const isAuthor =
    !!memberData &&
    !!publication &&
    publication.authors.some((author) => author.id === memberData.id);

  const canModify = isAdmin || isAuthor;

  return {
    isAuthor,
    isAdmin,
    canModify,
    loading: status === "loading" || loading,
  };
}
