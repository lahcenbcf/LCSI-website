"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");
  const [mounted, setMounted] = useState(false);

  // Éviter les erreurs d'hydration en attendant le montage côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirection automatique vers le dashboard si l'utilisateur est connecté
  useEffect(() => {
    if (session) {
      router.push("/dash");
    }
  }, [session, router]);

  // Afficher un loader pendant le montage initial pour éviter l'erreur d'hydration
  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center flex items-center flex-col justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center flex items-center flex-col justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">
            Redirection vers le tableau de bord...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Connexion LCSI Lab
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Réservé aux membres de l'ESI
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">
              {error === "AccessDenied" &&
                "Seuls les emails @esi.dz sont autorisés."}
              {error === "OAuthSignin" &&
                "Erreur lors de la connexion avec Google."}
              {error === "OAuthCallback" && "Erreur de configuration OAuth."}
              {!["AccessDenied", "OAuthSignin", "OAuthCallback"].includes(
                error
              ) && "Une erreur s'est produite."}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <button
            onClick={() => signIn("google", { callbackUrl: "/dash" })}
            className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Se connecter avec Google (@esi.dz)
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              En vous connectant, vous acceptez que seuls les emails
              <span className="font-medium text-blue-600"> @esi.dz</span> sont
              autorisés.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
