"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Attendre que la session soit chargée

    if (!user) {
      // Rediriger vers la page de connexion si pas connecté
      router.push("/auth/signin");
      return;
    }
  }, [user, isLoading, router]);

  // Afficher un loader pendant la vérification
  if (isLoading) {
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
  if (!user) {
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
