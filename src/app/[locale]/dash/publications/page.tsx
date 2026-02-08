"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  X,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import CreatePublicationDialog from "@/components/CreatePublicationDialog";
import EditPublicationDialog from "@/components/EditPublicationDialog";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import ProtectedAction from "@/components/ProtectedAction";

// Types pour les publications
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
  createdAt?: string;
};

const getAuthorsString = (authors: Publication["authors"]): string[] => {
  if (!authors || authors.length === 0) return [];
  return authors.map((a) => `${a.firstname} ${a.lastname}`);
};

export default function PublicationsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Array<{ label: string; value: string }>>(
    []
  );
  const [currentUserMemberId, setCurrentUserMemberId] = useState<string | null>(
    null
  );

  const userRole = user?.role || "MEMBER";
  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    async function fetchUserMemberId() {
      if (!user?.email) return;

      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          if (data.exists) {
            setCurrentUserMemberId(data.id);
          }
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du profil utilisateur:",
          error
        );
      }
    }

    fetchUserMemberId();
  }, [user]);

  // Edit/Delete states
  const [editingPublication, setEditingPublication] =
    useState<Publication | null>(null);
  const [deletingPublication, setDeletingPublication] =
    useState<Publication | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Charger les équipes depuis l'API
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const response = await fetch("/api/teams");
        if (response.ok) {
          const data = await response.json();
          const teamsList = Array.isArray(data.teams) ? data.teams : [];
          setTeams([
            { label: "Toutes les équipes", value: "" },
            ...teamsList.map((team: any) => ({
              label: `${team.slug} - ${
                team.name_fr || team.name_en || team.slug
              }`,
              value: team.slug,
            })),
          ]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des équipes:", error);
        // Fallback to empty list if API fails
        setTeams([{ label: "Toutes les équipes", value: "" }]);
      }
    };
    loadTeams();
  }, []);

  // Charger les publications depuis l'API
  useEffect(() => {
    const loadPublications = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/publications");
        if (response.ok) {
          const data = await response.json();
          setPublications(data.publications || []);
        } else {
          console.error("Erreur lors du chargement des publications");
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPublications();
  }, []);

  const handlePublicationCreated = (newPublication: Publication) => {
    setPublications((prev) => {
      // S'assurer que prev est un tableau
      const prevArray = Array.isArray(prev) ? prev : [];
      return [newPublication, ...prevArray];
    });
  };

  const handleEditClick = (publication: Publication) => {
    setEditingPublication(publication);
    setShowEditDialog(true);
  };

  const handleEditSuccess = (updatedPublication: Publication) => {
    setPublications((prev) => {
      const prevArray = Array.isArray(prev) ? prev : [];
      return prevArray.map((pub) =>
        pub.id === updatedPublication.id ? updatedPublication : pub
      );
    });
    setShowEditDialog(false);
    setEditingPublication(null);
  };

  const handleDeleteClick = (publication: Publication) => {
    setDeletingPublication(publication);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPublication) return;

    try {
      const response = await fetch(
        `/api/publications/${deletingPublication.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      // Remove from list
      setPublications((prev) => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.filter((pub) => pub.id !== deletingPublication.id);
      });

      setShowDeleteDialog(false);
      setDeletingPublication(null);
    } catch (error) {
      console.error("Error deleting publication:", error);
      throw error; // Let the DeleteConfirmDialog handle the error
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDeletingPublication(null);
  };

  // Gestion des filtres par équipe
  const handleTeamToggle = (teamValue: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamValue)
        ? prev.filter((t) => t !== teamValue)
        : [...prev, teamValue]
    );
  };

  // Filtrage et recherche
  const filteredPublications = useMemo(() => {
    // S'assurer que publications est un tableau
    if (!Array.isArray(publications)) {
      return [];
    }

    return publications.filter((publication) => {
      // Filtre par recherche (titre ou auteurs)
      const pubTitle = publication.title_fr || publication.title_en || "";
      const authorsArray = getAuthorsString(publication.authors);

      const searchMatch =
        pubTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(authorsArray) &&
          authorsArray.some((author: string) =>
            author.toLowerCase().includes(searchQuery.toLowerCase())
          )) ||
        publication.journal.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtre par équipes
      const teamMatch =
        selectedTeams.length === 0 ||
        (publication.team && selectedTeams.includes(publication.team));

      return searchMatch && teamMatch;
    });
  }, [publications, searchQuery, selectedTeams]);


  // Vérifier si l'utilisateur peut modifier/supprimer une publication
  const canUserModifyPublication = (publication: Publication): boolean => {
    // Admin peut tout faire
    if (isAdmin) return true;

    // Membre : vérifier s'il est auteur
    if (currentUserMemberId) {
      const isAuthor = publication.authors.some(
        (author) => author.id === currentUserMemberId
      );
      return isAuthor;
    }

    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-col gap-2 md:gap-0 md:flex-row">
            <div>
              <h1 className="text-3xl font-bold text-darkgrayTxt flex items-center gap-3">
                <BookOpen className="text-mainBlue" size={32} />
                Publications Scientifiques
              </h1>
              <p className="text-lightgrayTxt mt-2">
                Gérez et consultez les publications du laboratoire
              </p>
            </div>
            <ProtectedAction action="createPublications">
              <CreatePublicationDialog
                onPublicationCreated={handlePublicationCreated}
              />
            </ProtectedAction>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg border border-grayBorder p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lightgrayTxt"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher une publication, auteur, journal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue focus:border-transparent"
              />
            </div>

            {/* Bouton Filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-grayBorder rounded-lg hover:bg-grayRectangle transition-colors"
            >
              <Filter size={20} />
              <span>Filtres</span>
              {selectedTeams.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-mainBlue text-white text-xs rounded-full">
                  {selectedTeams.length}
                </span>
              )}
            </button>
          </div>

          {/* Panneau de filtres */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-grayBorder">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Filtres par équipe */}
                <div>
                  <h3 className="text-sm font-medium text-darkgrayTxt mb-3">
                    Équipes
                  </h3>
                  <div className="space-y-2">
                    {teams.slice(1).map((team) => (
                      <label
                        key={team.value}
                        className="flex items-center gap-2 cursor-pointer hover:bg-grayRectangle p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTeams.includes(team.value)}
                          onChange={() => handleTeamToggle(team.value)}
                          className="rounded border-grayBorder text-mainBlue focus:ring-mainBlue"
                        />
                        <span className="text-sm text-darkgrayTxt">
                          {team.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Statistiques */}
              <div className="mt-6 pt-6 border-t border-grayBorder">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-grayRectangle rounded-lg text-center">
                    <div className="font-semibold text-lg text-mainBlue">
                      {Array.isArray(publications) ? publications.length : 0}
                    </div>
                    <div className="text-lightgrayTxt text-sm">
                      Total publications
                    </div>
                  </div>
                  <div className="p-3 bg-grayRectangle rounded-lg text-center">
                    <div className="font-semibold text-lg text-mainBlue">
                      {Array.isArray(publications)
                        ? new Set(
                            publications.flatMap((p) => {
                              const authors = getAuthorsString(p.authors);
                              return authors;
                            })
                          ).size
                        : 0}
                    </div>
                    <div className="text-lightgrayTxt text-sm">
                      Auteurs uniques
                    </div>
                  </div>
                  <div className="p-3 bg-grayRectangle rounded-lg text-center">
                    <div className="font-semibold text-lg text-mainBlue">
                      {filteredPublications.length}
                    </div>
                    <div className="text-lightgrayTxt text-sm">Résultats</div>
                  </div>
                  <div className="p-3 bg-grayRectangle rounded-lg text-center">
                    <div className="font-semibold text-lg text-mainBlue">
                      {Array.isArray(publications) && publications.length > 0
                        ? new Date().getFullYear() -
                          Math.min(...publications.map((p) => p.year)) +
                          1
                        : 0}
                    </div>
                    <div className="text-lightgrayTxt text-sm">Années</div>
                  </div>
                </div>
              </div>

              {/* Filtres actifs */}
              {selectedTeams.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {selectedTeams.map((teamValue) => {
                      const team = teams.find((t) => t.value === teamValue);
                      return (
                        <span
                          key={teamValue}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-mainBlue text-white rounded-full text-sm"
                        >
                          {team?.label}
                          <button
                            onClick={() => handleTeamToggle(teamValue)}
                            className="hover:bg-white/20 rounded-full p-0.5"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setSelectedTeams([])}
                    className="text-sm text-mainBlue hover:underline"
                  >
                    Effacer tous les filtres
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message de chargement */}
        {loading && (
          <div className="bg-white rounded-lg border border-grayBorder p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainBlue mx-auto mb-4"></div>
            <p className="text-lightgrayTxt">Chargement des publications...</p>
          </div>
        )}

        {/* Message si aucune publication */}
        {!loading &&
          (!Array.isArray(publications) || publications.length === 0) && (
            <div className="bg-white rounded-lg border border-grayBorder p-12 text-center">
              <BookOpen className="mx-auto text-lightgrayTxt mb-4" size={48} />
              <h3 className="text-lg font-medium text-darkgrayTxt mb-2">
                Aucune publication
              </h3>
              <p className="text-lightgrayTxt mb-4">
                Commencez par créer votre première publication scientifique.
              </p>
              <ProtectedAction action="createPublications">
                <CreatePublicationDialog
                  onPublicationCreated={handlePublicationCreated}
                />
              </ProtectedAction>
            </div>
          )}

        {/* Tableau des publications */}
        {!loading && Array.isArray(publications) && publications.length > 0 && (
          <div className="bg-white rounded-lg border border-grayBorder overflow-hidden">
            {/* Vue tableau pour desktop */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead className="bg-grayRectangle">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-darkgrayTxt uppercase tracking-wider">
                      Publication
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-darkgrayTxt uppercase tracking-wider">
                      Auteurs
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-darkgrayTxt uppercase tracking-wider">
                      Équipe
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-darkgrayTxt uppercase tracking-wider">
                      Année
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-darkgrayTxt uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grayBorder">
                  {filteredPublications.map((publication) => (
                    <tr
                      key={publication.id}
                      className="hover:bg-grayRectangle/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-medium text-darkgrayTxt line-clamp-2">
                            {publication.title_fr || publication.title_en}
                          </h3>
                          <p className="text-sm text-lightgrayTxt truncate mt-1">
                            {publication.journal}
                          </p>
                          {publication.doi && (
                            <p className="text-xs text-mainBlue mt-1">
                              DOI: {publication.doi}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-darkgrayTxt">
                          {getAuthorsString(publication.authors)
                            .slice(0, 2)
                            .map((author, index) => (
                              <div key={index} className="truncate">
                                {author}
                              </div>
                            ))}
                          {getAuthorsString(publication.authors).length > 2 && (
                            <div className="text-xs text-lightgrayTxt">
                              +
                              {getAuthorsString(publication.authors).length - 2}{" "}
                              autres
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {publication.team ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}
                          >
                            {publication.team}
                          </span>
                        ) : (
                          <span className="text-sm text-lightgrayTxt">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-darkgrayTxt">
                          <Calendar
                            size={16}
                            className="mr-2 text-lightgrayTxt"
                          />
                          {publication.year}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/dash/publications/${publication.id}`}
                            className="text-mainBlue hover:text-mainBlue/80 p-2 rounded-full hover:bg-gray-100"
                          >
                            <Eye size={18} />
                          </Link>
                          {canUserModifyPublication(publication) && (
                            <>
                              <button
                                onClick={() => handleEditClick(publication)}
                                className="text-gray-600 hover:text-mainBlue p-2 rounded-full hover:bg-gray-100"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(publication)}
                                className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-gray-100"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vue liste pour mobile */}
            <div className="lg:hidden divide-y divide-grayBorder">
              {filteredPublications.map((publication) => (
                <div
                  key={publication.id}
                  className="p-4 hover:bg-grayRectangle/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-sm font-medium text-darkgrayTxt line-clamp-2 mb-2">
                        {publication.title_fr || publication.title_en}
                      </h3>
                      <div className="space-y-2">
                        <p className="text-xs text-lightgrayTxt">
                          {getAuthorsString(publication.authors)
                            .slice(0, 2)
                            .join(", ")}
                          {getAuthorsString(publication.authors).length > 2 &&
                            ` +${
                              getAuthorsString(publication.authors).length - 2
                            } autres`}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {publication.team && (
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}
                            >
                              {publication.team}
                            </span>
                          )}
                          <span className="text-xs text-lightgrayTxt">
                            {publication.year}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <Link
                        href={`/dash/publications/${publication.id}`}
                        className="text-mainBlue hover:text-mainBlue/80 p-2 rounded-full hover:bg-gray-100"
                      >
                        <Eye size={18} />
                      </Link>
                      {canUserModifyPublication(publication) && (
                        <>
                          <button
                            onClick={() => handleEditClick(publication)}
                            className="text-gray-600 hover:text-mainBlue p-2 rounded-full hover:bg-gray-100"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(publication)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-gray-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message si aucun résultat après filtrage */}
        {!loading &&
          Array.isArray(publications) &&
          publications.length > 0 &&
          filteredPublications.length === 0 && (
            <div className="bg-white rounded-lg border border-grayBorder p-12 text-center">
              <Search className="mx-auto text-lightgrayTxt mb-4" size={48} />
              <h3 className="text-lg font-medium text-darkgrayTxt mb-2">
                Aucun résultat trouvé
              </h3>
              <p className="text-lightgrayTxt mb-4">
                Essayez de modifier vos critères de recherche ou filtres.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTeams([]);
                }}
                className="text-mainBlue hover:underline"
              >
                Réinitialiser la recherche
              </button>
            </div>
          )}
      </div>

      {/* Edit Dialog */}
      {editingPublication && (
        <EditPublicationDialog
          publication={editingPublication}
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setEditingPublication(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingPublication && (
        <DeleteConfirmDialog
          isOpen={showDeleteDialog}
          title="Supprimer la publication"
          message="Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible."
          itemName={
            deletingPublication.title_fr ||
            deletingPublication.title_en ||
            "Sans titre"
          }
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}
