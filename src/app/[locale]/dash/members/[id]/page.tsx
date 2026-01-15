"use client";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  BookOpen,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMember } from "@/hooks/useMembers";
import { usePublications } from "@/hooks/usePublications";
import type { Member } from "@/lib/api";
import PublicationComp from "@/components/PublicationComp";
export default function MemberDetailPage() {
  const params = useParams();
  const memberId = params.id as string;

  const {
    data: member,
    loading: memberLoading,
    error: memberError,
  } = useMember(memberId, "FR");

  const { data: publicationsData, loading: publicationsLoading } =
    usePublications({
      language: "FR",
    });

  const publications =
    publicationsData?.publications?.filter((pub) =>
      pub.authors?.some((author) => author.id === memberId)
    ) || [];

  console.log("publications", publications);

  if (memberLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lightgrayTxt">Chargement...</span>
      </div>
    );
  }

  if (memberError || !member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-darkgrayTxt mb-2">
            Membre introuvable
          </h2>
          <p className="text-lightgrayTxt mb-6">
            Le membre que vous recherchez n'existe pas.
          </p>
          <Link
            href="/dash/members"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Retour à la liste</span>
          </Link>
        </div>
      </div>
    );
  }

  const getAvatarFallback = (member: Member) => {
    const names = member.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return member.name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dash/members"
          className="inline-flex items-center space-x-2 text-lightgrayTxt hover:text-mainBlue transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Retour à la liste des membres</span>
        </Link>
      </div>

      {/* Profil principal */}
      <div className="bg-white rounded-lg border border-grayBorder overflow-hidden">
        <div className="bg-gradient-to-r from-mainBlue to-mainBlue/80 px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex-shrink-0">
              {member.image ? (
                <Image
                  src={member.image}
                  alt={member.name}
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-white"
                />
              ) : (
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-4 border-white">
                  <span className="text-mainBlue font-bold text-3xl">
                    {getAvatarFallback(member)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 text-white">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold font-integralCF">
                  {member.name}
                </h1>
                {member.isTeamLeader && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Chef d'équipe
                  </span>
                )}
              </div>
              <p className="text-xl text-blue-100 mb-1">{member.position}</p>
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800`}
                >
                  {member.team}
                </span>
                <span className="text-blue-100">•</span>
                <span className="text-blue-100">{member.teamName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informations de contact */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-darkgrayTxt mb-4 font-integralCF">
                Informations de contact
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="text-lightgrayTxt" size={20} />
                  <a
                    href={`mailto:${member.email}`}
                    className="text-mainBlue hover:underline"
                  >
                    {member.email}
                  </a>
                </div>
                {member.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="text-lightgrayTxt" size={20} />
                    <a
                      href={`tel:${member.phone}`}
                      className="text-darkgrayTxt"
                    >
                      {member.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Biographie */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-darkgrayTxt mb-4 font-integralCF">
                Biographie
              </h3>
              {member.bio ? (
                <p className="text-darkgrayTxt leading-relaxed">{member.bio}</p>
              ) : (
                <p className="text-lightgrayTxt italic">
                  Aucune biographie disponible.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Publications */}
      <div className="bg-white rounded-lg border border-grayBorder p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="text-mainBlue" size={24} />
          <h3 className="text-lg font-semibold text-darkgrayTxt font-integralCF">
            Publications
          </h3>
        </div>

        {publications.length > 0 ? (
          <div className="space-y-1">
            {publications.map((pub) => {
              return (
                <PublicationComp
                  key={pub.id}
                  publicationData={{
                    id: pub.id,
                    title: pub.title_fr || pub.title_en || "",
                    authors: pub.authors.map(
                      (author) => `${author.firstname} ${author.lastname}`
                    ),
                    journal: pub.journal,
                    url : pub.url,
                    date: new Date(pub.publishedAt).toLocaleDateString("fr-FR"),
                    volume: pub.volume
                      ? `Vol.${pub.volume}${
                          pub.issue ? ` Issue${pub.issue}` : ""
                        }${pub.pages ? `, ${pub.pages}` : ""}`
                      : undefined,
                  }}
                  disableHover={true}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-lightgrayTxt italic">
            Aucune publication enregistrée.
          </p>
        )}
      </div>
    </div>
  );
}
