"use client";

import { useAuth } from "@/components/AuthProvider";
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
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Pas connecté -> rediriger vers login
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // Vérifier le rôle si requis
    if (requiredRole && user.role !== requiredRole) {
      // Si pas le bon rôle, rediriger vers une page d'erreur ou accueil
      router.push("/auth/error?error=AccessDenied");
      return;
    }
  }, [user, isLoading, router, requiredRole, redirectTo]);

  // Loading state
  if (isLoading) {
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
  if (!user) {
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
  if (requiredRole && user.role !== requiredRole) {
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
