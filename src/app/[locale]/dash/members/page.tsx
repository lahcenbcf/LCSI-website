"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Eye,
  Users,
  X,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LoadingSpinner } from "@/components/LoadingSpinner";

import { useMembers } from "@/hooks/useMembers";
import { useTeams } from "@/hooks/useTeams";
import type { Member } from "@/lib/api";
import ProtectedAction from "@/components/ProtectedAction";
import { ErrorMessage } from "@/components/ErrorMessage";

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: membersData,
    loading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
    deleteMember,
  } = useMembers({
    search: searchQuery,
    teams: selectedTeams.length > 0 ? selectedTeams : undefined,
    language: "FR",
  });

  const {
    data: teamsData,
    loading: teamsLoading,
    error: teamsError,
  } = useTeams("FR");

  const members = membersData?.members || [];
  const teams = teamsData?.teams || [];

  const handleMemberCreated = () => {
    refetchMembers();
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) {
      return;
    }

    try {
      setDeletingId(memberId);
      await deleteMember(memberId);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du membre");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTeamToggle = (teamSlug: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamSlug)
        ? prev.filter((t) => t !== teamSlug)
        : [...prev, teamSlug]
    );
  };

  const getAvatarFallback = (member: Member) => {
    const names = member.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return member.name.substring(0, 2).toUpperCase();
  };

  const getTeamOptions = () => {
    return [
      { value: "", label: "Toutes les équipes" },
      ...teams.map((team) => ({
        value: team.slug,
        label: team.name,
      })),
    ];
  };

  if (membersError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-darkgrayTxt font-integralCF">
          Membres
        </h1>
        <ErrorMessage error={membersError} onRetry={refetchMembers} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-darkgrayTxt font-integralCF">
            Membres
          </h1>
          {!membersLoading && (
            <p className="text-lightgrayTxt">
              {members.length} membre{members.length > 1 ? "s" : ""} trouvé
              {members.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <p className="text-blue-800 text-sm">
              <strong>Info :</strong> Les membres se créent automatiquement lors
              de leur première connexion avec un email @esi.dz
            </p>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg p-6 border border-grayBorder">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Barre de recherche */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lightgrayTxt"
              size={20}
            />
            <input
              type="text"
              placeholder="Rechercher par nom, email, position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Bouton filtre */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-3 border rounded-lg transition-colors ${
              showFilters || selectedTeams.length > 0
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-grayBorder text-darkgrayTxt hover:bg-grayRectangle"
            }`}
          >
            <Filter size={20} />
            <span>Filtres</span>
            {selectedTeams.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {selectedTeams.length}
              </span>
            )}
          </button>
        </div>

        {/* Filtres étendus */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-grayBorder">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filtre par équipe */}
              <div>
                <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                  Équipes
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {!teamsLoading &&
                    getTeamOptions()
                      .slice(1)
                      .map((team) => (
                        <label
                          key={team.value}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTeams.includes(team.value)}
                            onChange={() => handleTeamToggle(team.value)}
                            className="rounded border-grayBorder text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-darkgrayTxt">
                            {team.label}
                          </span>
                        </label>
                      ))}
                </div>
              </div>
            </div>

            {/* Reset filters */}
            {selectedTeams.length > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setSelectedTeams([])}
                  className="flex items-center space-x-2 text-sm text-lightgrayTxt hover:text-darkgrayTxt"
                >
                  <X size={16} />
                  <span>Réinitialiser les filtres</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {membersLoading && <LoadingSpinner />}

      {/* Table des membres */}
      {!membersLoading && (
        <div className="bg-white rounded-lg border border-grayBorder overflow-hidden">
          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4 p-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-grayRectangle rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
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
                        {getAvatarFallback(member)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2">
                      <h3 className="font-medium text-darkgrayTxt truncate">
                        {member.name}
                      </h3>
                      {member.isTeamLeader && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 `}
                        >
                          Chef d'équipe
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-lightgrayTxt truncate">
                      {member.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-lightgrayTxt">Position:</span>
                    <span className="text-sm text-darkgrayTxt">
                      {member.position}
                    </span>
                  </div>
                  {member.team && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-lightgrayTxt">Équipe:</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800`}
                      >
                        {member.teamName || member.team}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-lightgrayTxt">
                      Téléphone:
                    </span>
                    <span className="text-sm text-darkgrayTxt">
                      {member.phone || "Non renseigné"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-grayBorder">
                  <Link
                    href={`/dash/members/${member.id}`}
                    className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                    title="Voir les détails"
                  >
                    <Eye size={16} />
                  </Link>
                  <ProtectedAction action="delete">
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      disabled={deletingId === member.id}
                      className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      {deletingId === member.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </ProtectedAction>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block">
            <table className="w-full">
              <thead className="bg-grayRectangle">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-darkgrayTxt">
                    Membre
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-darkgrayTxt">
                    Position
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-darkgrayTxt">
                    Équipe
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-darkgrayTxt">
                    Contact
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-darkgrayTxt">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grayBorder">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-grayRectangle/50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {member.image ? (
                            <Image
                              src={member.image}
                              alt={member.name}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-blue-600 font-semibold text-sm">
                              {getAvatarFallback(member)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex gap-2">
                            <div className="font-medium text-darkgrayTxt">
                              {member.name}
                            </div>
                            {member.isTeamLeader && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 `}
                              >
                                Chef d'équipe
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-lightgrayTxt">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-darkgrayTxt">
                        {member.position}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {member.team && (
                        <span
                          className={`px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800`}
                        >
                          {member.teamName || member.team}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-lightgrayTxt">
                        {member.phone || "Non renseigné"}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          href={`/dash/members/${member.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye size={16} />
                        </Link>
                        <ProtectedAction action="delete">
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            disabled={deletingId === member.id}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            {deletingId === member.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </ProtectedAction>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {members.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-lightgrayTxt" />
              <h3 className="mt-2 text-sm font-medium text-darkgrayTxt">
                Aucun membre trouvé
              </h3>
              <p className="mt-1 text-sm text-lightgrayTxt">
                {searchQuery || selectedTeams.length > 0
                  ? "Essayez de modifier vos critères de recherche."
                  : "Commencez par ajouter un nouveau membre."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
