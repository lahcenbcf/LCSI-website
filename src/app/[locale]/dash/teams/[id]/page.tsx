"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Users,
  BookOpen,
  Edit,
  Target,
  Code,
  Award,
  Lightbulb,
  Building,
  Calendar,
  ExternalLink,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { useTeam } from "@/hooks/useTeams";
import { useMembers } from "@/hooks/useMembers";
import { useTeamPublications } from "@/hooks/usePublications";
import type { Team, Member, Publication } from "@/lib/api";
import { usePermissions } from "@/contexts/PermissionsContext";
import ProtectedAction from "@/components/ProtectedAction";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";

// Types
interface EditFormData {
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
  valueAdded_fr: string;
  valueAdded_en: string;
  keywords_fr: string[];
  keywords_en: string[];
  domains_fr: string[];
  domains_en: string[];
  expertises_fr: string[];
  expertises_en: string[];
}

const MemberCard = ({ member }: { member: Member }) => (
  <div className="bg-white border border-grayBorder rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
        {member.image ? (
          <Image
            src={member.image}
            alt={member.name}
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
        ) : (
          <span className="text-blue-600 font-semibold">
            {member.name.substring(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-darkgrayTxt">{member.name}</h4>
        <p className="text-sm text-lightgrayTxt">{member.position}</p>
        {member.email && (
          <p className="text-sm text-blue-600">{member.email}</p>
        )}
        {member.isTeamLeader && (
          <span className="inline-block mt-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Chef d'équipe
          </span>
        )}
      </div>
    </div>
  </div>
);

const PublicationCard = ({ publication }: { publication: any }) => {
  // Utiliser le titre français par défaut
  const title =
    publication.title_fr ||
    publication.title_en ||
    publication.title ||
    "Sans titre";
  const abstract =
    publication.abstract_fr || publication.abstract_en || publication.abstract;

  // Formatter les auteurs
  const authorsString = Array.isArray(publication.authors)
    ? publication.authors
        .map((author: any) =>
          typeof author === "string"
            ? author
            : `${author.firstname || ""} ${author.lastname || ""}`.trim()
        )
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <div className="bg-white border border-grayBorder rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-darkgrayTxt mb-2">{title}</h4>
          {authorsString && (
            <p className="text-sm text-lightgrayTxt mb-2">
              Auteurs: {authorsString}
            </p>
          )}
          {publication.journal && (
            <p className="text-sm text-blue-600 mb-2">{publication.journal}</p>
          )}
          {publication.year && (
            <div className="flex items-center space-x-1 text-sm text-lightgrayTxt">
              <Calendar size={14} />
              <span>{publication.year}</span>
            </div>
          )}
        </div>
        {publication.doi && (
          <a
            href={`https://doi.org/${publication.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            title="Voir la publication"
          >
            <ExternalLink size={16} />
          </a>
        )}
      </div>
    </div>
  );
};

const TagInput = ({
  label,
  tags,
  onAdd,
  onRemove,
  placeholder,
}: {
  label: string;
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      onAdd(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-darkgrayTxt mb-2">
        {label}
      </label>
      <div className="space-y-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors"
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component
export default function TeamDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const teamId = params.id as string;
  const { canEditTeamInfo } = usePermissions();
  const shouldStartEditing = searchParams.get("edit") === "true";

  // States
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(""); // Filtre année pour publications
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });
  const [editForm, setEditForm] = useState<EditFormData>({
    name_fr: "",
    name_en: "",
    description_fr: "",
    description_en: "",
    valueAdded_fr: "",
    valueAdded_en: "",
    keywords_fr: [],
    keywords_en: [],
    domains_fr: [],
    domains_en: [],
    expertises_fr: [],
    expertises_en: [],
  });
  const [initialForm, setInitialForm] = useState<EditFormData>({
    name_fr: "",
    name_en: "",
    description_fr: "",
    description_en: "",
    valueAdded_fr: "",
    valueAdded_en: "",
    keywords_fr: [],
    keywords_en: [],
    domains_fr: [],
    domains_en: [],
    expertises_fr: [],
    expertises_en: [],
  });

  // Hooks
  const {
    data: team,
    loading: teamLoading,
    error: teamError,
    refetch: refetchTeam,
  } = useTeam(teamId, "FR");

  // ✅ FIXED: Only call useMembers when team is loaded to avoid fetching all members
  const membersParams = team?.slug
    ? { teams: [team.slug], language: "FR" }
    : null;
  const {
    data: membersData,
    loading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useMembers(membersParams || undefined);

  const {
    data: publicationsData,
    loading: publicationsLoading,
    error: publicationsError,
    refetch: refetchPublications,
  } = useTeamPublications(teamId);

  // Computed values - Force empty if no data or loading
  const members =
    membersData?.members && !membersLoading ? membersData.members : [];
  const publications =
    publicationsData?.publications && !publicationsLoading
      ? publicationsData.publications
      : [];

  // Filtrer les publications par année
  const filteredPublications = selectedYear
    ? publications.filter((pub) => pub.year?.toString() === selectedYear)
    : publications;

  // Extraire les années uniques des publications pour le filtre
  const availableYears = Array.from(
    new Set(publications.map((pub) => pub.year).filter(Boolean))
  ).sort((a, b) => (b as number) - (a as number));

  // Effects
  useEffect(() => {
    if (team) {
      const formData: EditFormData = {
        name_fr: (team as any).name_fr || team.name || "",
        name_en: (team as any).name_en || "",
        description_fr: (team as any).description_fr || team.description || "",
        description_en: (team as any).description_en || "",
        valueAdded_fr: (team as any).valueAdded_fr || team.valueAdded || "",
        valueAdded_en: (team as any).valueAdded_en || "",
        keywords_fr: (team as any).keywords_fr || team.keywords || [],
        keywords_en: (team as any).keywords_en || [],
        domains_fr: (team as any).domains_fr || team.domains || [],
        domains_en: (team as any).domains_en || [],
        expertises_fr: (team as any).expertises_fr || team.expertises || [],
        expertises_en: (team as any).expertises_en || [],
      };
      setEditForm(formData);
      setInitialForm(formData);

      if (shouldStartEditing && canEditTeamInfo) {
        setIsEditing(true);
      }
    }
  }, [team, shouldStartEditing, canEditTeamInfo]);

  // Handlers
  const hasChanges = () =>
    JSON.stringify(editForm) !== JSON.stringify(initialForm);

  const handleInputChange = (field: keyof EditFormData, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagAdd = (field: keyof EditFormData, value: string) => {
    if (value.trim()) {
      setEditForm((prev) => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()],
      }));
    }
  };

  const handleTagRemove = (field: keyof EditFormData, index: number) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  const handleEditClick = () => setIsEditing(true);

  const handleCancel = () => {
    setEditForm(initialForm);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        slug: team?.slug,
        image: team?.image,
        translations: {
          FR: {
            name: editForm.name_fr,
            description: editForm.description_fr || "",
            valueAdded: editForm.valueAdded_fr || undefined,
            keywords: editForm.keywords_fr || [],
            domains: editForm.domains_fr || [],
            expertises: editForm.expertises_fr || [],
          },
          EN: {
            name: editForm.name_en,
            description: editForm.description_en || "",
            valueAdded: editForm.valueAdded_en || undefined,
            keywords: editForm.keywords_en || [],
            domains: editForm.domains_en || [],
            expertises: editForm.expertises_en || [],
          },
        },
      };

      const response = await fetch(`/api/teams/${teamId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error("Erreur lors de la sauvegarde");

      setInitialForm(editForm);
      setIsEditing(false);
      refetchTeam();

      // Afficher notification de succès
      setNotification({
        show: true,
        message: "Équipe mise à jour avec succès !",
        type: "success",
      });

      // Cacher la notification après 5 secondes
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "success" });
      }, 5000);
    } catch (error) {
      console.error("Erreur:", error);

      // Afficher notification d'erreur
      setNotification({
        show: true,
        message: "Erreur lors de la sauvegarde de l'équipe",
        type: "error",
      });

      // Cacher la notification après 5 secondes
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "error" });
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  // Render loading/error states
  if (teamLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/dash/teams"
            className="p-2 hover:bg-grayRectangle rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-darkgrayTxt font-integralCF">
            Details de equipe
          </h1>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (teamError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/dash/teams"
            className="p-2 hover:bg-grayRectangle rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-darkgrayTxt font-integralCF">
            Details de l equipe
          </h1>
        </div>
        <ErrorMessage error={teamError} onRetry={refetchTeam} />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/dash/teams"
            className="p-2 hover:bg-grayRectangle rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-darkgrayTxt font-integralCF">
            Équipe non trouvée
          </h1>
        </div>
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-lightgrayTxt" />
          <h3 className="mt-2 text-sm font-medium text-darkgrayTxt">
            Équipe non trouvée
          </h3>
          <p className="mt-1 text-sm text-lightgrayTxt">
            L'équipe demandée n'existe pas ou a été supprimée.
          </p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 animate-in slide-in-from-bottom ${
            notification.type === "success"
              ? "bg-green-50 border-green-500 text-green-800"
              : "bg-red-50 border-red-500 text-red-800"
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() =>
                setNotification({ show: false, message: "", type: "success" })
              }
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dash/teams"
            className="p-2 hover:bg-grayRectangle rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-darkgrayTxt font-integralCF">
              {team.name}
            </h1>
            <span
              className={`text-sm px-2 py-1 rounded-full bg-gray-100 text-gray-800 border-gray-200`}
            >
              {team.slug}
            </span>
          </div>
        </div>

        <ProtectedAction action="editTeamInfo">
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X size={20} />
                  <span>Annuler</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges()}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 disabled:cursor-not-allowed ${
                    hasChanges() && !saving
                      ? "bg-mainBlue text-white hover:bg-mainBlue/90 shadow-md"
                      : "bg-gray-400 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  {saving ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Sauvegarde...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>
                        {hasChanges() ? "Sauvegarder" : "Aucune modification"}
                      </span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={handleEditClick}
                className="flex items-center space-x-2 px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-colors"
              >
                <Edit size={20} />
                <span>Modifier</span>
              </button>
            )}
          </div>
        </ProtectedAction>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Info - Main Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-grayBorder p-6 space-y-6">
            {isEditing ? (
              /* Edit Form - Bilingual */
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-darkgrayTxt border-b border-grayBorder pb-2">
                  Modification de l'équipe (Bilingue)
                </h3>

                {/* Name - FR and EN side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                      <Building size={16} className="inline mr-1" />
                      Nom (Français) *
                    </label>
                    <input
                      type="text"
                      value={editForm.name_fr}
                      onChange={(e) =>
                        handleInputChange("name_fr", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors"
                      placeholder="Nom de l'équipe en français"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                      <Building size={16} className="inline mr-1" />
                      Nom (English) *
                    </label>
                    <input
                      type="text"
                      value={editForm.name_en}
                      onChange={(e) =>
                        handleInputChange("name_en", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors"
                      placeholder="Team name in English"
                    />
                  </div>
                </div>

                {/* Description - FR and EN side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                      Description (Français)
                    </label>
                    <textarea
                      value={editForm.description_fr}
                      onChange={(e) =>
                        handleInputChange("description_fr", e.target.value)
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors resize-none"
                      placeholder="Description en français..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                      Description (English)
                    </label>
                    <textarea
                      value={editForm.description_en}
                      onChange={(e) =>
                        handleInputChange("description_en", e.target.value)
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors resize-none"
                      placeholder="Description in English..."
                    />
                  </div>
                </div>

                {/* Value Added - FR and EN side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                      <Award size={16} className="inline mr-1" />
                      Valeur Ajoutée (Français)
                    </label>
                    <textarea
                      value={editForm.valueAdded_fr}
                      onChange={(e) =>
                        handleInputChange("valueAdded_fr", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors resize-none"
                      placeholder="Valeur en français..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                      <Award size={16} className="inline mr-1" />
                      Valeur Ajoutée (English)
                    </label>
                    <textarea
                      value={editForm.valueAdded_en}
                      onChange={(e) =>
                        handleInputChange("valueAdded_en", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors resize-none"
                      placeholder="Value in English..."
                    />
                  </div>
                </div>

                {/* Keywords - FR and EN side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TagInput
                    label="Mots-clés (Français)"
                    tags={editForm.keywords_fr}
                    onAdd={(tag) => handleTagAdd("keywords_fr", tag)}
                    onRemove={(index) => handleTagRemove("keywords_fr", index)}
                    placeholder="Ajouter un mot-clé FR (Entrée)"
                  />
                  <TagInput
                    label="Keywords (English)"
                    tags={editForm.keywords_en}
                    onAdd={(tag) => handleTagAdd("keywords_en", tag)}
                    onRemove={(index) => handleTagRemove("keywords_en", index)}
                    placeholder="Add keyword EN (Enter)"
                  />
                </div>

                {/* Domains - FR and EN side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TagInput
                    label="Domaines (Français)"
                    tags={editForm.domains_fr}
                    onAdd={(tag) => handleTagAdd("domains_fr", tag)}
                    onRemove={(index) => handleTagRemove("domains_fr", index)}
                    placeholder="Ajouter un domaine FR (Entrée)"
                  />
                  <TagInput
                    label="Domains (English)"
                    tags={editForm.domains_en}
                    onAdd={(tag) => handleTagAdd("domains_en", tag)}
                    onRemove={(index) => handleTagRemove("domains_en", index)}
                    placeholder="Add domain EN (Enter)"
                  />
                </div>

                {/* Expertises - FR and EN side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TagInput
                    label="Expertises (Français)"
                    tags={editForm.expertises_fr}
                    onAdd={(tag) => handleTagAdd("expertises_fr", tag)}
                    onRemove={(index) =>
                      handleTagRemove("expertises_fr", index)
                    }
                    placeholder="Ajouter une expertise FR (Entrée)"
                  />
                  <TagInput
                    label="Expertises (English)"
                    tags={editForm.expertises_en}
                    onAdd={(tag) => handleTagAdd("expertises_en", tag)}
                    onRemove={(index) =>
                      handleTagRemove("expertises_en", index)
                    }
                    placeholder="Add expertise EN (Enter)"
                  />
                </div>
              </div>
            ) : (
              /* Display Mode */
              <>
                {/* Team Header */}
                <div className="flex items-start space-x-4">
                  {team.image ? (
                    <Image
                      src={team.image}
                      alt={team.name ?? "Team image"}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div
                      className={`w-20 h-20 rounded-lg flex items-center justify-center bg-gray-100 text-gray-800 border-gray-200`}
                    >
                      <Building size={40} />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-darkgrayTxt mb-2">
                      {team.name}
                    </h2>
                    {team.description && (
                      <p className="text-lightgrayTxt">{team.description}</p>
                    )}
                    {team.createdAt && (
                      <p className="text-sm text-lightgrayTxt mt-2">
                        Créée le{" "}
                        {new Date(team.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Value Added */}
                {team.valueAdded && (
                  <div>
                    <h3 className="text-lg font-semibold text-darkgrayTxt mb-2 flex items-center">
                      <Award size={20} className="mr-2 text-yellow-600" />
                      Valeur Ajoutée
                    </h3>
                    <p className="text-lightgrayTxt">{team.valueAdded}</p>
                  </div>
                )}
                {/* Tags Sections */}
                {[
                  {
                    title: "Mots-clés",
                    data: team.keywords,
                    icon: Lightbulb,
                    color: "yellow",
                  },
                  {
                    title: "Domaines",
                    data: team.domains,
                    icon: Target,
                    color: "red",
                  },
                  {
                    title: "Technologies",
                    data: team.technologies,
                    icon: Code,
                    color: "purple",
                  },
                  {
                    title: "Expertises",
                    data: team.expertises,
                    icon: Award,
                    color: "green",
                  },
                ].map(
                  ({ title, data, icon: Icon, color }) =>
                    data &&
                    data.length > 0 && (
                      <div key={title}>
                        <h3 className="text-lg font-semibold text-darkgrayTxt mb-3 flex items-center">
                          <Icon
                            size={20}
                            className={`mr-2 text-${color}-600`}
                          />
                          {title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {data.map((item, idx) => (
                            <span
                              key={idx}
                              className={`bg-${color}-100 text-${color}-800 px-3 py-1 rounded-full text-sm`}
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                )}
              </>
            )}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-grayBorder p-6">
            <h3 className="text-lg font-semibold text-darkgrayTxt mb-4">
              Statistiques
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users size={20} className="text-blue-600" />
                  <span className="text-darkgrayTxt">Membres</span>
                </div>
                <span className="font-semibold text-darkgrayTxt">
                  {members.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen size={20} className="text-green-600" />
                  <span className="text-darkgrayTxt">Publications</span>
                </div>
                <span className="font-semibold text-darkgrayTxt">
                  {publications.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-white rounded-lg border border-grayBorder">
        <div className="p-6 border-b border-grayBorder">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-darkgrayTxt flex items-center">
              <Users size={20} className="mr-2" />
              Membres ({members.length})
            </h3>
          </div>
        </div>
        <div className="p-6">
          {membersLoading ? (
            <LoadingSpinner text="Chargement des membres..." />
          ) : membersError ? (
            <ErrorMessage error={membersError} onRetry={refetchMembers} />
          ) : members.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-lightgrayTxt" />
              <h4 className="mt-2 text-sm font-medium text-darkgrayTxt">
                Aucun membre
              </h4>
              <p className="mt-1 text-sm text-lightgrayTxt">
                Les membres rejoignent automatiquement cette équipe via leur
                profil personnel.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Publications Section */}
      <div className="bg-white rounded-lg border border-grayBorder">
        <div className="p-6 border-b border-grayBorder">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-lg font-semibold text-darkgrayTxt flex items-center">
              <BookOpen size={20} className="mr-2" />
              Publications ({filteredPublications.length}
              {selectedYear && ` sur ${publications.length}`})
            </h3>
            <div className="flex items-center gap-4">
              {/* Filtre par année */}
              {availableYears.length > 0 && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-4 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors bg-white text-sm"
                >
                  <option value="">Toutes les années</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year?.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
        <div className="p-6">
          {publicationsLoading ? (
            <LoadingSpinner text="Chargement des publications..." />
          ) : publicationsError ? (
            <ErrorMessage
              error={publicationsError}
              onRetry={refetchPublications}
            />
          ) : publications.length > 0 ? (
            filteredPublications.length > 0 ? (
              <div className="space-y-4">
                {filteredPublications.map((publication) => (
                  <PublicationCard
                    key={publication.id}
                    publication={publication}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-lightgrayTxt" />
                <h4 className="mt-2 text-sm font-medium text-darkgrayTxt">
                  Aucune publication pour {selectedYear}
                </h4>
                <p className="mt-1 text-sm text-lightgrayTxt">
                  Essayez de sélectionner une autre année.
                </p>
                <button
                  onClick={() => setSelectedYear("")}
                  className="mt-4 px-4 py-2 text-sm text-mainBlue hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Voir toutes les publications
                </button>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-lightgrayTxt" />
              <h4 className="mt-2 text-sm font-medium text-darkgrayTxt">
                Aucune publication
              </h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
