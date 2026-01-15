import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import ProfileCheckWrapper from "@/components/ProfileCheckWrapper";
import localFont from "next/font/local";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const integralCF = localFont({
  src: [
    {
      path: "../../../public/fonts/Fontspring-DEMO-integralcf-regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Fontspring-DEMO-integralcf-medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Fontspring-DEMO-integralcf-demibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Fontspring-DEMO-integralcf-bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Fontspring-DEMO-integralcf-extrabold.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Fontspring-DEMO-integralcf-heavy.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-integralCF",
});

export const metadata: Metadata = {
  title:
    "LCSI Lab - Innovation et Recherche | LCSI Lab - Innovation and Research",
  description:
    "Découvrez les dernières avancées en recherche et innovation au LCSI Lab. | Discover the latest advancements in research and innovation at LCSI Lab.",
  keywords:
    "LCSI, recherche, innovation, laboratoire, publications, équipes | LCSI, research, innovation, laboratory, publications, teams",
  authors: [{ name: "LCSI Lab", url: "https://lcsi-lab.com" }],
  openGraph: {
    title:
      "LCSI Lab - Innovation et Recherche | LCSI Lab - Innovation and Research",
    description:
      "Découvrez les dernières avancées en recherche et innovation au LCSI Lab. | Discover the latest advancements in research and innovation at LCSI Lab.",
    url: "https://lcsi-lab.com",
    siteName: "LCSI Lab",
    images: [
      {
        url: "https://res.cloudinary.com/dnbun3s0j/image/upload/v1760807421/logo_qhu4qd.png",
        width: 1200,
        height: 630,
        alt: "LCSI Lab - Innovation et Recherche | LCSI Lab - Innovation and Research",
      },
    ],
    locale: "fr_FR",
    type: "website",
  }
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body
        className={`${poppins.variable} ${integralCF.variable} font-poppins antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <ProfileCheckWrapper>
            <NextIntlClientProvider>{children}</NextIntlClientProvider>
          </ProfileCheckWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
