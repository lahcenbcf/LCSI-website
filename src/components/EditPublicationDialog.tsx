"use client";

import { useState, useEffect } from "react";
import {
  X,
  Save,
  Loader2,
  Calendar,
  Users,
  Building,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

type Publication = {
  id: string;
  title_fr?: string;
  title_en?: string;
  abstract_fr?: string;
  abstract_en?: string;
  keywords_fr?: string[];
  keywords_en?: string[];
  authors: Array<{
    id: string;
    firstname: string;
    lastname: string;
    email?: string;
    order: number;
  }>;
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
};

type Member = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
};

type Team = {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
};

interface EditPublicationDialogProps {
  publication: Publication;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedPublication: Publication) => void;
}

export default function EditPublicationDialog({
  publication,
  isOpen,
  onClose,
  onSuccess,
}: EditPublicationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title_fr: publication.title_fr || "",
    title_en: publication.title_en || "",
    abstract_fr: publication.abstract_fr || "",
    abstract_en: publication.abstract_en || "",
    keywords_fr: publication.keywords_fr || [],
    keywords_en: publication.keywords_en || [],
    journal: publication.journal || "",
    volume: publication.volume || "",
    issue: publication.issue || "",
    pages: publication.pages || "",
    doi: publication.doi || "",
    url: publication.url || "",
    publishedAt: publication.publishedAt
      ? new Date(publication.publishedAt).toISOString().split("T")[0]
      : "",
    teamSlug: publication.team || "",
    selectedAuthors: publication.authors.map((a) => a.id),
  });

  const [keywordInput_fr, setKeywordInput_fr] = useState("");
  const [keywordInput_en, setKeywordInput_en] = useState("");

  // Load members and teams
  useEffect(() => {
    if (isOpen) {
      loadData();
      setError(null); // Reset error when dialog opens
    }
  }, [isOpen]);

  // Reset form when publication changes
  useEffect(() => {
    if (publication) {
      setFormData({
        title_fr: publication.title_fr || "",
        title_en: publication.title_en || "",
        abstract_fr: publication.abstract_fr || "",
        abstract_en: publication.abstract_en || "",
        keywords_fr: publication.keywords_fr || [],
        keywords_en: publication.keywords_en || [],
        journal: publication.journal || "",
        volume: publication.volume || "",
        issue: publication.issue || "",
        pages: publication.pages || "",
        doi: publication.doi || "",
        url: publication.url || "",
        publishedAt: publication.publishedAt
          ? new Date(publication.publishedAt).toISOString().split("T")[0]
          : "",
        teamSlug: publication.team || "",
        selectedAuthors: publication.authors.map((a) => a.id),
      });
    }
  }, [publication]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [membersRes, teamsRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/teams"),
      ]);

      if (membersRes.ok && teamsRes.ok) {
        const membersData = await membersRes.json();
        const teamsData = await teamsRes.json();

        // L'API retourne { members: [...] } et { teams: [...] }
        setMembers(
          Array.isArray(membersData.members) ? membersData.members : []
        );
        setTeams(Array.isArray(teamsData.teams) ? teamsData.teams : []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authors = formData.selectedAuthors.map((memberId, index) => ({
        memberId,
        order: index + 1,
      }));

      const payload = {
        translations: {
          FR: {
            title: formData.title_fr,
            abstract: formData.abstract_fr,
            keywords: formData.keywords_fr,
          },
          EN: {
            title: formData.title_en,
            abstract: formData.abstract_en,
            keywords: formData.keywords_en,
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
        teamSlug: formData.teamSlug || null,
        authors,
      };

      const response = await fetch(`/api/publications/${publication.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      const updatedPublication = await response.json();
      onSuccess(updatedPublication);
      onClose();
    } catch (error) {
      console.error("Error:", error);
      setError(
        "Erreur lors de la mise à jour de la publication. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorToggle = (memberId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedAuthors: prev.selectedAuthors.includes(memberId)
        ? prev.selectedAuthors.filter((id) => id !== memberId)
        : [...prev.selectedAuthors, memberId],
    }));
  };

  const moveAuthorUp = (index: number) => {
    if (index === 0) return;
    const newAuthors = [...formData.selectedAuthors];
    [newAuthors[index - 1], newAuthors[index]] = [
      newAuthors[index],
      newAuthors[index - 1],
    ];
    setFormData((prev) => ({ ...prev, selectedAuthors: newAuthors }));
  };

  const moveAuthorDown = (index: number) => {
    if (index === formData.selectedAuthors.length - 1) return;
    const newAuthors = [...formData.selectedAuthors];
    [newAuthors[index], newAuthors[index + 1]] = [
      newAuthors[index + 1],
      newAuthors[index],
    ];
    setFormData((prev) => ({ ...prev, selectedAuthors: newAuthors }));
  };

  const addKeyword = (lang: "fr" | "en") => {
    const input = lang === "fr" ? keywordInput_fr : keywordInput_en;
    if (!input.trim()) return;

    const field = lang === "fr" ? "keywords_fr" : "keywords_en";
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], input.trim()],
    }));

    if (lang === "fr") setKeywordInput_fr("");
    else setKeywordInput_en("");
  };

  const removeKeyword = (lang: "fr" | "en", index: number) => {
    const field = lang === "fr" ? "keywords_fr" : "keywords_en";
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-grayBorder p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-darkgrayTxt">
            Modifier la publication
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-grayRectangle rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-mainBlue" />
              <span className="ml-2">Chargement...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <div className="flex-shrink-0 text-red-600">
                    <X size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="flex-shrink-0 text-red-400 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    Titre (Français)
                  </label>
                  <input
                    type="text"
                    value={formData.title_fr}
                    onChange={(e) =>
                      setFormData({ ...formData, title_fr: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    Titre (English)
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) =>
                      setFormData({ ...formData, title_en: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                  />
                </div>
              </div>

              {/* Abstracts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    Résumé (Français)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.abstract_fr}
                    onChange={(e) =>
                      setFormData({ ...formData, abstract_fr: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    Abstract (English)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.abstract_en}
                    onChange={(e) =>
                      setFormData({ ...formData, abstract_en: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue resize-none"
                  />
                </div>
              </div>

              {/* Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    Mots-clés (Français)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={keywordInput_fr}
                      onChange={(e) => setKeywordInput_fr(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addKeyword("fr"))
                      }
                      placeholder="Ajouter un mot-clé"
                      className="flex-1 px-4 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                    />
                    <button
                      type="button"
                      onClick={() => addKeyword("fr")}
                      className="px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.keywords_fr.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword("fr", index)}
                          className="hover:text-blue-900"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    Keywords (English)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={keywordInput_en}
                      onChange={(e) => setKeywordInput_en(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addKeyword("en"))
                      }
                      placeholder="Add keyword"
                      className="flex-1 px-4 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                    />
                    <button
                      type="button"
                      onClick={() => addKeyword("en")}
                      className="px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.keywords_en.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword("en", index)}
                          className="hover:text-blue-900"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Journal info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    Journal
                  </label>
                  <input
                    type="text"
                    value={formData.journal}
                    onChange={(e) =>
                      setFormData({ ...formData, journal: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Date de publication
                  </label>
                  <input
                    type="date"
                    value={formData.publishedAt}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publishedAt: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                  />
                </div>
              </div>

              {/* Volume, Issue, Pages */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    Volume
                  </label>
                  <input
                    type="text"
                    value={formData.volume}
                    onChange={(e) =>
                      setFormData({ ...formData, volume: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    Issue
                  </label>
                  <input
                    type="text"
                    value={formData.issue}
                    onChange={(e) =>
                      setFormData({ ...formData, issue: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    Pages
                  </label>
                  <input
                    type="text"
                    value={formData.pages}
                    onChange={(e) =>
                      setFormData({ ...formData, pages: e.target.value })
                    }
                    placeholder="ex: 1-10"
                    className="w-full px-4 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                  />
                </div>
              </div>

              {/* DOI and URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    DOI
                  </label>
                  <input
                    type="text"
                    value={formData.doi}
                    onChange={(e) =>
                      setFormData({ ...formData, doi: e.target.value })
                    }
                    placeholder="10.1234/example"
                    className="w-full px-4 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                  />
                </div>
              </div>

              {/* Team */}
              <div>
                <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                  <Building size={16} className="inline mr-1" />
                  Équipe
                </label>
                <select
                  value={formData.teamSlug}
                  onChange={(e) =>
                    setFormData({ ...formData, teamSlug: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                >
                  <option value="">Aucune équipe</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.slug}>
                      {team.name_fr || team.slug}
                    </option>
                  ))}
                </select>
              </div>

              {/* Authors */}
              <div>
                <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                  <Users size={16} className="inline mr-1" />
                  Auteurs
                </label>

                {/* Selected Authors with reorder */}
                {formData.selectedAuthors.length > 0 && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-darkgrayTxt mb-3">
                      Auteurs sélectionnés (ordre de publication)
                    </h4>
                    <div className="space-y-2">
                      {formData.selectedAuthors.map((authorId, index) => {
                        const member = members.find((m) => m.id === authorId);
                        if (!member) return null;
                        return (
                          <div
                            key={authorId}
                            className="flex items-center gap-2 bg-white p-2 rounded border border-blue-300"
                          >
                            <span className="text-sm font-medium text-blue-800 w-8">
                              #{index + 1}
                            </span>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-darkgrayTxt">
                                {member.firstname} {member.lastname}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => moveAuthorUp(index)}
                                disabled={index === 0}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Monter"
                              >
                                <ChevronUp size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveAuthorDown(index)}
                                disabled={
                                  index === formData.selectedAuthors.length - 1
                                }
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Descendre"
                              >
                                <ChevronDown size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAuthorToggle(authorId)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                title="Retirer"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* All members list */}
                <div className="border border-grayBorder rounded-lg max-h-60 overflow-y-auto">
                  {members.length === 0 ? (
                    <div className="p-4 text-center text-lightgrayTxt">
                      Aucun membre disponible
                    </div>
                  ) : (
                    members.map((member) => (
                      <label
                        key={member.id}
                        className="flex items-center gap-3 p-3 hover:bg-grayRectangle cursor-pointer border-b border-grayBorder last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={formData.selectedAuthors.includes(member.id)}
                          onChange={() => handleAuthorToggle(member.id)}
                          className="rounded border-grayBorder text-mainBlue focus:ring-mainBlue"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-darkgrayTxt">
                            {member.firstname} {member.lastname}
                          </div>
                          <div className="text-sm text-lightgrayTxt">
                            {member.email}
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-sm text-lightgrayTxt mt-2">
                  {formData.selectedAuthors.length} auteur(s) sélectionné(s)
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-grayBorder">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-2 border border-grayBorder rounded-lg hover:bg-grayRectangle transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
