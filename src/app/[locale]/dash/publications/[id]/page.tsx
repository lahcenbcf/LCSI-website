"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Calendar,
  Users,
  BookOpen,
  ExternalLink,
  Tag,
  Building,
  Trash2,
  FileText,
} from "lucide-react";
import Link from "next/link";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import EditPublicationDialog from "@/components/EditPublicationDialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";

// Type pour une publication détaillée
type Author = {
  id: string;
  firstname: string;
  lastname: string;
  email?: string;
  order: number;
};

type PublicationDetail = {
  id: string;
  title_fr?: string;
  title_en?: string;
  abstract_fr?: string;
  abstract_en?: string;
  keywords_fr?: string[];
  keywords_en?: string[];
  authors: Author[];
  journal: string;
  year: number;
  team?: string;
  teamName_fr?: string;
  teamName_en?: string;
  doi?: string;
  url?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publishedAt: string;
  createdAt?: string;
};

export default function PublicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const publicationId = params.id as string;

  const [publication, setPublication] = useState<PublicationDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState<"fr" | "en">("fr");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentUserMemberId, setCurrentUserMemberId] = useState<string | null>(
    null
  );
  const [userRole, setUserRole] = useState<string | null>(null);

  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    async function fetchUserData() {
      try {
        const [profileResponse, roleResponse] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/auth/role"),
        ]);

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.exists) {
            setCurrentUserMemberId(profileData.id);
          }
        }

        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          setUserRole(roleData.user.role);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données utilisateur:",
          error
        );
      }
    }

    fetchUserData();
  }, []);

  useEffect(() => {
    const loadPublication = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/publications/${publicationId}`);

        if (response.ok) {
          const data = await response.json();
          setPublication(data);
          setError(null);
        } else if (response.status === 404) {
          setError("Publication introuvable");
        } else {
          setError("Erreur lors du chargement de la publication");
        }
      } catch (err) {
        console.error("Erreur:", err);
        setError("Erreur lors du chargement de la publication");
      } finally {
        setLoading(false);
      }
    };

    loadPublication();
  }, [publicationId]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/publications/${publicationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dash/publications");
      } else {
        setError("Erreur lors de la suppression de la publication");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setError("Erreur lors de la suppression de la publication");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleEditSuccess = async () => {
    // Recharger la publication après modification
    try {
      const response = await fetch(`/api/publications/${publicationId}`);
      if (response.ok) {
        const data = await response.json();
        setPublication(data);
        setError(null);
      }
    } catch (err) {
      console.error("Erreur lors du rechargement:", err);
    }
    setShowEditDialog(false);
  };

  const canUserModifyPublication = (): boolean => {
    if (!publication) return false;
    if (isAdmin) return true;
    if (currentUserMemberId) {
      return publication.authors.some(
        (author) => author.id === currentUserMemberId
      );
    }
    return false;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !publication) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <div className="text-center">
          <BookOpen className="mx-auto text-lightgrayTxt mb-4" size={64} />
          <h2 className="text-2xl font-bold text-darkgrayTxt mb-2">
            {error || "Publication introuvable"}
          </h2>
          <p className="text-lightgrayTxt mb-6">
            La publication que vous recherchez n'existe pas.
          </p>
          <Link
            href="/dash/publications"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Retour à la liste</span>
          </Link>
        </div>
      </div>
    );
  }

  // Obtenir le titre et le résumé selon la langue sélectionnée
  const title =
    locale === "en"
      ? publication.title_en || publication.title_fr
      : publication.title_fr || publication.title_en;
  const abstract =
    locale === "en"
      ? publication.abstract_en || publication.abstract_fr
      : publication.abstract_fr || publication.abstract_en;
  const keywords =
    locale === "en"
      ? publication.keywords_en || publication.keywords_fr || []
      : publication.keywords_fr || publication.keywords_en || [];

  return (
    <div className="space-y-6">
      {/* Error notification */}
      {error && !loading && publication && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="font-medium">{error}</p>
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Header avec navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dash/publications"
          className="inline-flex items-center space-x-2 text-lightgrayTxt hover:text-mainBlue transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Retour à la liste des publications</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Sélecteur de langue */}
          <div className="flex bg-grayRectangle rounded-lg p-1">
            <button
              onClick={() => setLocale("fr")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                locale === "fr"
                  ? "bg-mainBlue text-white"
                  : "text-lightgrayTxt hover:text-darkgrayTxt"
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLocale("en")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                locale === "en"
                  ? "bg-mainBlue text-white"
                  : "text-lightgrayTxt hover:text-darkgrayTxt"
              }`}
            >
              EN
            </button>
          </div>

          {canUserModifyPublication() && (
            <>
              <button
                onClick={() => setShowEditDialog(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-colors"
              >
                <Edit size={20} />
                <span>Modifier</span>
              </button>

              <button
                onClick={() => setShowDeleteDialog(true)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Détails de la publication */}
      <div className="bg-white rounded-lg border border-grayBorder overflow-hidden">
        <div className="bg-gradient-to-r from-mainBlue to-mainBlue/80 px-6 py-8">
          <div className="text-white">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {publication.team && (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 bg-opacity-90`}
                >
                  {publication.team}
                </span>
              )}
              <div className="flex items-center space-x-2 text-blue-100">
                <Calendar size={16} />
                <span>{publication.year}</span>
              </div>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold uppercase mb-4 leading-tight">
              {title}
            </h1>
            <div className="flex items-center space-x-2 text-blue-100">
              <BookOpen size={16} />
              <span>{publication.journal}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informations principales */}
            <div className="lg:col-span-2">
              {/* Auteurs */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-darkgrayTxt mb-3 font-integralCF flex items-center">
                  <Users className="mr-2" size={20} />
                  Auteurs
                </h3>
                <div className="space-y-3">
                  {publication.authors
                    .sort((a, b) => a.order - b.order)
                    .map((author, index) => (
                      <div
                        key={author.id}
                        className="flex items-center gap-3 p-3 bg-grayRectangle rounded-lg"
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-mainBlue text-white rounded-full font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-darkgrayTxt">
                            {author.firstname} {author.lastname}
                          </p>
                          {author.email && (
                            <p className="text-sm text-lightgrayTxt">
                              {author.email}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Résumé */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-darkgrayTxt mb-3 font-integralCF flex items-center">
                  <FileText className="mr-2" size={20} />
                  Resume
                </h3>
                {abstract ? (
                  <p className="text-darkgrayTxt leading-relaxed whitespace-pre-wrap">
                    {abstract}
                  </p>
                ) : (
                  <p className="text-lightgrayTxt italic">
                    Aucun résumé disponible.
                  </p>
                )}
              </div>

              {/* Mots-clés */}
              {keywords && keywords.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-darkgrayTxt mb-3 font-integralCF flex items-center">
                    <Tag className="mr-2" size={20} />
                    Mots cles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-mainBlue/10 text-mainBlue rounded-full text-sm font-medium"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Informations de publication */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-darkgrayTxt mb-4 font-integralCF flex items-center">
                <Building className="mr-2" size={20} />
                Details de publication
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-grayRectangle rounded-lg">
                  <h4 className="font-medium text-darkgrayTxt mb-2">Journal</h4>
                  <p className="text-sm text-lightgrayTxt">
                    {publication.journal}
                  </p>
                </div>

                {publication.team && (
                  <div className="p-4 bg-grayRectangle rounded-lg">
                    <h4 className="font-medium text-darkgrayTxt mb-2">
                      Équipe
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}
                      >
                        {publication.team}
                      </span>
                    </div>
                  </div>
                )}

                {(publication.volume ||
                  publication.issue ||
                  publication.pages) && (
                  <div className="p-4 bg-grayRectangle rounded-lg">
                    <h4 className="font-medium text-darkgrayTxt mb-2">
                      Références
                    </h4>
                    <div className="text-sm space-y-1">
                      {publication.volume && (
                        <p>
                          <span className="text-lightgrayTxt">Volume:</span>{" "}
                          {publication.volume}
                        </p>
                      )}
                      {publication.issue && (
                        <p>
                          <span className="text-lightgrayTxt">Numéro:</span>{" "}
                          {publication.issue}
                        </p>
                      )}
                      {publication.pages && (
                        <p>
                          <span className="text-lightgrayTxt">Pages:</span>{" "}
                          {publication.pages}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-grayRectangle rounded-lg">
                  <h4 className="font-medium text-darkgrayTxt mb-2">
                    Date de publication
                  </h4>
                  <p className="text-sm text-lightgrayTxt">
                    {new Date(publication.publishedAt).toLocaleDateString(
                      "fr-FR",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>

                {publication.doi && (
                  <div className="p-4 bg-grayRectangle rounded-lg">
                    <h4 className="font-medium text-darkgrayTxt mb-2">DOI</h4>
                    <a
                      href={`https://doi.org/${publication.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-sm text-mainBlue hover:underline break-all"
                    >
                      <span>{publication.doi}</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}

                {publication.url && (
                  <div className="p-4 bg-grayRectangle rounded-lg">
                    <h4 className="font-medium text-darkgrayTxt mb-2">URL</h4>
                    <a
                      href={publication.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-sm text-mainBlue hover:underline break-all"
                    >
                      <span className="truncate">{publication.url}</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Edit Dialog */}
      {publication && (
        <EditPublicationDialog
          publication={publication}
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {publication && (
        <DeleteConfirmDialog
          isOpen={showDeleteDialog}
          title="Supprimer la publication"
          message="Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible."
          itemName={
            publication.title_fr || publication.title_en || "Sans titre"
          }
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
}
