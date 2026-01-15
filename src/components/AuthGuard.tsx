"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "MEMBER" ;
  redirectTo?: string;
}

export default function AuthGuard({
  children,
  requiredRole,
  redirectTo = "/auth/signin",
}: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    // Pas connecté -> rediriger vers login
    if (!session) {
      router.push(redirectTo);
      return;
    }

    // Vérifier le rôle si requis
    if (requiredRole && session.user?.role !== requiredRole) {
      // Si pas le bon rôle, rediriger vers une page d'erreur ou accueil
      router.push("/auth/error?error=AccessDenied");
      return;
    }
  }, [session, status, router, requiredRole, redirectTo]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grayRectangle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mainBlue mb-4"></div>
          <p className="text-darkgrayTxt">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grayRectangle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mainBlue mb-4"></div>
          <p className="text-darkgrayTxt">Redirection...</p>
        </div>
      </div>
    );
  }

  // Wrong role
  if (requiredRole && session.user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grayRectangle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mainBlue mb-4"></div>
          <p className="text-darkgrayTxt">Accès non autorisé...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
