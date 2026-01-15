"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "AccessDenied":
        return {
          title: "Accès refusé",
          description:
            "Seuls les emails @esi.dz sont autorisés à accéder à cette plateforme.",
          suggestion:
            "Veuillez utiliser votre adresse email institutionnelle ESI.",
        };
      case "Configuration":
        return {
          title: "Erreur de configuration",
          description:
            "Il y a un problème avec la configuration d'authentification.",
          suggestion: "Veuillez contacter l'administrateur.",
        };
      default:
        return {
          title: "Erreur d'authentification",
          description: "Une erreur s'est produite lors de la connexion.",
          suggestion: "Veuillez réessayer ou contacter l'administrateur.",
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {errorInfo.title}
          </h2>

          <p className="mt-2 text-sm text-gray-600">{errorInfo.description}</p>

          <p className="mt-4 text-sm text-blue-600 font-medium">
            {errorInfo.suggestion}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Link
            href="/auth/signin"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Essayer de nouveau
          </Link>

          <Link
            href="/"
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Retour à l'accueil
          </Link>
        </div>

        {error === "AccessDenied" && (
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <div className="text-sm text-blue-700">
              <strong>Information :</strong> Cette plateforme est réservée aux
              membres de l'ESI. Si vous êtes membre de l'ESI et que vous n'avez
              pas d'adresse @esi.dz, veuillez contacter l'administration.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
