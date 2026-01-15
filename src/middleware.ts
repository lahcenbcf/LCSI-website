import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

// Routes qui nécessitent une authentification
const protectedRoutes = ["/admin", "/dashboard", "/profile", "/dash"];

// Routes réservées aux admins
const adminRoutes = ["/admin"];

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extraire la locale du pathname
  const localeMatch = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  const pathWithoutLocale = localeMatch ? localeMatch[2] || "/" : pathname;

  // Vérifier si la route est protégée (sans vérifier la session pour éviter l'edge runtime)
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  );

  // Pour les routes protégées, on laisse les pages individuelles gérer l'authentification
  // Cela évite les problèmes avec Prisma dans le middleware edge
  if (isProtectedRoute) {
    // On laisse passer, la protection se fera côté page
    console.log(`Route protégée détectée: ${pathWithoutLocale}`);
  }

  // Appliquer le middleware d'internationalisation
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
