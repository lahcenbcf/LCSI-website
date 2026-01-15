"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Attendre que la session soit chargée

    if (!session) {
      // Rediriger vers la page de connexion si pas connecté
      router.push("/auth/signin");
      return;
    }
  }, [session, status, router]);

  // Afficher un loader pendant la vérification
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grayRectangle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mainBlue mb-4"></div>
          <p className="text-darkgrayTxt">
            Vérification de l'authentification...
          </p>
        </div>
      </div>
    );
  }

  // Afficher un loader pendant la redirection si pas connecté
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grayRectangle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mainBlue mb-4"></div>
          <p className="text-darkgrayTxt">Redirection vers la connexion...</p>
        </div>
      </div>
    );
  }

  // Utilisateur connecté, afficher le contenu
  return <>{children}</>;
}
