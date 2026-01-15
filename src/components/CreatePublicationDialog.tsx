"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  BookOpen,
  Users,
  Calendar,
  Tag,
  Building,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface CreatePublicationDialogProps {
  onPublicationCreated?: (publication: any) => void;
}

interface PublicationFormData {
  title_fr: string;
  title_en: string;
  abstract_fr: string;
  abstract_en: string;
  keywords_fr: string;
  keywords_en: string;
  journal: string;
  publishedAt: string; // Date de publication (contient jour/mois/année)
  team: string;
  doi: string;
  pages: string;
  volume: string;
  issue: string;
  url: string;
  selectedAuthors: { memberId: string; order: number }[];
}

interface Member {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  position: string;
  team?: string;
  teamName?: string;
}

interface Team {
  id: string;
  slug: string;
  name: string;
}

export default function CreatePublicationDialog({
  onPublicationCreated,
}: CreatePublicationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [formData, setFormData] = useState<PublicationFormData>({
    title_fr: "",
    title_en: "",
    abstract_fr: "",
    abstract_en: "",
    keywords_fr: "",
    keywords_en: "",
    journal: "",
    publishedAt: "", // Date de publication
    team: "",
    doi: "",
    pages: "",
    volume: "",
    issue: "",
    url: "",
    selectedAuthors: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Charger les membres et les équipes
  useEffect(() => {
    if (open) {
      loadMembers();
      loadTeams();
    }
  }, [open]);

  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      const response = await fetch("/api/members");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors du chargement des membres"
        );
      }
      const data = await response.json();
      console.log("Members loaded:", data.members?.length || 0); // Debug
      setMembers(data.members || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des membres:", error);
      showNotification(
        error.message || "Erreur lors du chargement des membres",
        "error"
      );
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadTeams = async () => {
    setLoadingTeams(true);
    try {
      const response = await fetch("/api/teams?language=FR");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors du chargement des équipes"
        );
      }
      const data = await response.json();
      console.log("Teams loaded:", data.teams?.length || 0); // Debug
      setTeams(data.teams || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des équipes:", error);
      showNotification(
        error.message || "Erreur lors du chargement des équipes",
        "error"
      );
    } finally {
      setLoadingTeams(false);
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleInputChange = (field: keyof PublicationFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const toggleAuthor = (memberId: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedAuthors.some(
        (a) => a.memberId === memberId
      );
      if (isSelected) {
        return {
          ...prev,
          selectedAuthors: prev.selectedAuthors.filter(
            (a) => a.memberId !== memberId
          ),
        };
      } else {
        return {
          ...prev,
          selectedAuthors: [
            ...prev.selectedAuthors,
            { memberId, order: prev.selectedAuthors.length + 1 },
          ],
        };
      }
    });
  };

  const moveAuthorUp = (index: number) => {
    if (index === 0) return;
    setFormData((prev) => {
      const newAuthors = [...prev.selectedAuthors];
      [newAuthors[index - 1], newAuthors[index]] = [
        newAuthors[index],
        newAuthors[index - 1],
      ];
      return {
        ...prev,
        selectedAuthors: newAuthors.map((a, i) => ({ ...a, order: i + 1 })),
      };
    });
  };

  const moveAuthorDown = (index: number) => {
    if (index === formData.selectedAuthors.length - 1) return;
    setFormData((prev) => {
      const newAuthors = [...prev.selectedAuthors];
      [newAuthors[index], newAuthors[index + 1]] = [
        newAuthors[index + 1],
        newAuthors[index],
      ];
      return {
        ...prev,
        selectedAuthors: newAuthors.map((a, i) => ({ ...a, order: i + 1 })),
      };
    });
  };

  const removeAuthor = (memberId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedAuthors: prev.selectedAuthors
        .filter((a) => a.memberId !== memberId)
        .map((a, i) => ({ ...a, order: i + 1 })),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title_fr.trim())
      newErrors.title_fr = "Le titre FR est requis";
    if (!formData.title_en.trim())
      newErrors.title_en = "Le titre EN est requis";
    if (!formData.journal.trim()) newErrors.journal = "Le journal est requis";
    if (!formData.publishedAt.trim()) {
      newErrors.publishedAt = "La date de publication est requise";
    }
    if (!formData.team) newErrors.team = "L'équipe est requise";
    if (formData.selectedAuthors.length === 0) {
      newErrors.authors = "Au moins un auteur est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const keywordsFR = formData.keywords_fr
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k);
      const keywordsEN = formData.keywords_en
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k);

      const response = await fetch("/api/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          translations: {
            FR: {
              title: formData.title_fr,
              abstract: formData.abstract_fr || null,
              keywords: keywordsFR,
            },
            EN: {
              title: formData.title_en,
              abstract: formData.abstract_en || null,
              keywords: keywordsEN,
            },
          },
          journal: formData.journal,
          volume: formData.volume || null,
          issue: formData.issue || null,
          pages: formData.pages || null,
          doi: formData.doi || null,
          url: formData.url || null,
          year: formData.publishedAt
            ? new Date(formData.publishedAt).getFullYear()
            : new Date().getFullYear(),
          publishedAt: formData.publishedAt
            ? new Date(formData.publishedAt).toISOString()
            : new Date().toISOString(),
          teamSlug: formData.team,
          authors: formData.selectedAuthors,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la création");
      }

      const newPublication = await response.json();
      onPublicationCreated?.(newPublication);
      showNotification("Publication créée avec succès!", "success");

      // Reset form
      setFormData({
        title_fr: "",
        title_en: "",
        abstract_fr: "",
        abstract_en: "",
        keywords_fr: "",
        keywords_en: "",
        journal: "",
        publishedAt: "",
        team: "",
        doi: "",
        pages: "",
        volume: "",
        issue: "",
        url: "",
        selectedAuthors: [],
      });

      setTimeout(() => setOpen(false), 1500);
    } catch (error: any) {
      console.error("Erreur:", error);
      showNotification(error.message || "Erreur lors de la création", "error");
    } finally {
      setLoading(false);
    }
  };

  const getAuthorName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    return member ? `${member.firstname} ${member.lastname}` : "";
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center space-x-2 px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-colors"
      >
        <Plus size={20} />
        <span className="hidden sm:inline">Ajouter une publication</span>
        <span className="sm:hidden">Ajouter</span>
      </button>
    );
  }

  return (
    <>
      {/* Dialog Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-grayBorder p-6 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="text-mainBlue" size={24} />
                <h2 className="text-xl font-semibold">
                  Créer une nouvelle publication
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-lightgrayTxt hover:text-darkgrayTxt"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-sm text-lightgrayTxt mt-2">
              Remplissez les informations en français et en anglais.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Titre - Bilingue */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-darkgrayTxt border-b border-grayBorder pb-2">
                Titre (Français et Anglais) *
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-darkgrayTxt mb-1">
                    🇫🇷 Français
                  </label>
                  <input
                    type="text"
                    value={formData.title_fr}
                    onChange={(e) =>
                      handleInputChange("title_fr", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors ${
                      errors.title_fr ? "border-red-500" : "border-grayBorder"
                    }`}
                    placeholder="Titre de la publication en français"
                  />
                  {errors.title_fr && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.title_fr}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-darkgrayTxt mb-1">
                    🇬🇧 English
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) =>
                      handleInputChange("title_en", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors ${
                      errors.title_en ? "border-red-500" : "border-grayBorder"
                    }`}
                    placeholder="Publication title in English"
                  />
                  {errors.title_en && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.title_en}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Résumé - Bilingue */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-darkgrayTxt border-b border-grayBorder pb-2">
                Résumé / Abstract
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-darkgrayTxt mb-1">
                    🇫🇷 Français
                  </label>
                  <textarea
                    value={formData.abstract_fr}
                    onChange={(e) =>
                      handleInputChange("abstract_fr", e.target.value)
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors resize-none"
                    placeholder="Résumé en français..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-darkgrayTxt mb-1">
                    🇬🇧 English
                  </label>
                  <textarea
                    value={formData.abstract_en}
                    onChange={(e) =>
                      handleInputChange("abstract_en", e.target.value)
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors resize-none"
                    placeholder="Abstract in English..."
                  />
                </div>
              </div>
            </div>

            {/* Mots-clés - Bilingue */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-darkgrayTxt border-b border-grayBorder pb-2">
                <Tag size={16} className="inline mr-1" />
                Mots-clés / Keywords
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-darkgrayTxt mb-1">
                    🇫🇷 Français
                  </label>
                  <input
                    type="text"
                    value={formData.keywords_fr}
                    onChange={(e) =>
                      handleInputChange("keywords_fr", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors"
                    placeholder="mot-clé1, mot-clé2, mot-clé3..."
                  />
                  <p className="text-xs text-lightgrayTxt mt-1">
                    Séparez les mots-clés par des virgules
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-darkgrayTxt mb-1">
                    🇬🇧 English
                  </label>
                  <input
                    type="text"
                    value={formData.keywords_en}
                    onChange={(e) =>
                      handleInputChange("keywords_en", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors"
                    placeholder="keyword1, keyword2, keyword3..."
                  />
                  <p className="text-xs text-lightgrayTxt mt-1">
                    Separate keywords with commas
                  </p>
                </div>
              </div>
            </div>

            {/* Informations de publication */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-darkgrayTxt border-b border-grayBorder pb-2">
                Détails de publication
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-1">
                    Journal/Conférence *
                  </label>
                  <input
                    type="text"
                    value={formData.journal}
                    onChange={(e) =>
                      handleInputChange("journal", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors ${
                      errors.journal ? "border-red-500" : "border-grayBorder"
                    }`}
                    placeholder="Nom du journal ou de la conférence"
                  />
                  {errors.journal && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.journal}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-1">
                    <Building size={16} className="inline mr-1" />
                    Équipe *
                  </label>
                  <select
                    value={formData.team}
                    onChange={(e) => handleInputChange("team", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors ${
                      errors.team ? "border-red-500" : "border-grayBorder"
                    }`}
                    disabled={loadingTeams}
                  >
                    <option value="">Sélectionner une équipe</option>
                    {teams.map((team) => (
                      <option key={team.slug} value={team.slug}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  {errors.team && (
                    <p className="text-red-500 text-xs mt-1">{errors.team}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-1">
                    <Calendar size={16} className="inline mr-1" />
                    Date de publication *
                  </label>
                  <input
                    type="date"
                    value={formData.publishedAt}
                    onChange={(e) =>
                      handleInputChange("publishedAt", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors ${
                      errors.publishedAt
                        ? "border-red-500"
                        : "border-grayBorder"
                    }`}
                  />
                  {errors.publishedAt && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.publishedAt}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-1">
                    Volume
                  </label>
                  <input
                    type="text"
                    value={formData.volume}
                    onChange={(e) =>
                      handleInputChange("volume", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors"
                    placeholder="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-1">
                    Numéro
                  </label>
                  <input
                    type="text"
                    value={formData.issue}
                    onChange={(e) => handleInputChange("issue", e.target.value)}
                    className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors"
                    placeholder="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-1">
                    Pages
                  </label>
                  <input
                    type="text"
                    value={formData.pages}
                    onChange={(e) => handleInputChange("pages", e.target.value)}
                    className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors"
                    placeholder="45-62"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-1">
                    DOI
                  </label>
                  <input
                    type="text"
                    value={formData.doi}
                    onChange={(e) => handleInputChange("doi", e.target.value)}
                    className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors"
                    placeholder="10.1234/journal.2024.001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => handleInputChange("url", e.target.value)}
                    className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Auteurs */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-darkgrayTxt border-b border-grayBorder pb-2">
                <Users size={16} className="inline mr-1" />
                Auteurs *
              </h3>
              {errors.authors && (
                <p className="text-red-500 text-sm">{errors.authors}</p>
              )}

              {/* Auteurs sélectionnés */}
              {formData.selectedAuthors.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-darkgrayTxt mb-2">
                    Auteurs sélectionnés (ordre de publication):
                  </p>
                  {formData.selectedAuthors.map((author, index) => (
                    <div
                      key={author.memberId}
                      className="flex items-center justify-between bg-white p-2 rounded border border-grayBorder"
                    >
                      <span className="text-sm">
                        {index + 1}. {getAuthorName(author.memberId)}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => moveAuthorUp(index)}
                          disabled={index === 0}
                          className="text-mainBlue hover:text-mainBlue/70 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveAuthorDown(index)}
                          disabled={
                            index === formData.selectedAuthors.length - 1
                          }
                          className="text-mainBlue hover:text-mainBlue/70 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeAuthor(author.memberId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Liste des membres disponibles */}
              <div className="border border-grayBorder rounded-lg p-4 max-h-60 overflow-y-auto">
                {loadingMembers ? (
                  <p className="text-center text-lightgrayTxt">
                    Chargement des membres...
                  </p>
                ) : members.length === 0 ? (
                  <p className="text-center text-lightgrayTxt">
                    Aucun membre disponible
                  </p>
                ) : (
                  <div className="space-y-2">
                    {members.map((member) => {
                      const isSelected = formData.selectedAuthors.some(
                        (a) => a.memberId === member.id
                      );
                      return (
                        <label
                          key={member.id}
                          className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-mainBlue/10 border border-mainBlue"
                              : "hover:bg-grayRectangle border border-transparent"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleAuthor(member.id)}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-darkgrayTxt">
                              {member.firstname} {member.lastname}
                            </p>
                            <p className="text-xs text-lightgrayTxt">
                              {member.email}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-grayBorder">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-darkgrayTxt border border-grayBorder rounded-lg hover:bg-grayRectangle transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Création...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Créer la publication</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {notification.message}
        </div>
      )}
    </>
  );
}
