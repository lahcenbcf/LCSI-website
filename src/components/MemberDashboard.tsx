"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  Users,
  FileText,
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Loader2,
} from "lucide-react";
import Image from "next/image";

interface UserRole {
  user: {
    id: string;
    email: string;
    role: string;
  };
  member: {
    id: string;
    isTeamLeader: boolean;
    team: {
      id: string;
      slug: string;
    };
  } | null;
  hasProfile: boolean;
  isAdmin: boolean;
  isTeamLeader: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  position: string;
  image?: string;
  isTeamLeader: boolean;
}

interface TeamPublication {
  id: string;
  title: string;
  journal: string;
  year: number;
  authors: string[];
}

export default function MemberDashboard() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamPublications, setTeamPublications] = useState<TeamPublication[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer le rôle de l'utilisateur
        const roleResponse = await fetch("/api/auth/role");
        const roleData = await roleResponse.json();
        setUserRole(roleData);

        if (roleData.member?.team?.id) {
          // Récupérer les membres de l'équipe
          const membersResponse = await fetch(
            `/api/teams/${roleData.member.team.id}/members`
          );
          if (membersResponse.ok) {
            const membersData = await membersResponse.json();
            setTeamMembers(membersData.members || []);
          }

          // Récupérer les publications de l'équipe
          const publicationsResponse = await fetch(
            `/api/teams/${roleData.member.team.id}/publications`
          );
          if (publicationsResponse.ok) {
            const publicationsData = await publicationsResponse.json();
            setTeamPublications(publicationsData.publications || []);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4 text-mainBlue"
            size={32}
          />
          <p className="text-lightgrayTxt">Chargement de votre dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userRole?.member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="mx-auto mb-4 text-lightgrayTxt" size={48} />
          <p className="text-lightgrayTxt">Profil membre introuvable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-darkgrayTxt font-integralCF">
                Dashboard Membre
              </h1>
              <p className="text-lightgrayTxt">
                Bienvenue, {user?.name}
              </p>
            </div>
            {userRole.isTeamLeader && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Chef d'équipe
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profil personnel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-darkgrayTxt mb-4 flex items-center">
                <User className="mr-2" size={20} />
                Mon Profil
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "Photo de profil"}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="text-blue-600" size={24} />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-darkgrayTxt">
                      {user?.name}
                    </p>
                    <p className="text-sm text-lightgrayTxt">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-lightgrayTxt">
                    <Building className="mr-2" size={16} />
                    Équipe: {userRole.member.team?.slug || "Aucune équipe"}
                  </div>
                  {userRole.isTeamLeader && (
                    <div className="flex items-center text-sm text-blue-600">
                      <Users className="mr-2" size={16} />
                      Responsable d'équipe
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <Users className="text-blue-600 mr-2" size={20} />
                  <div>
                    <p className="text-sm text-lightgrayTxt">Membres équipe</p>
                    <p className="text-lg font-semibold text-darkgrayTxt">
                      {teamMembers.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <FileText className="text-green-600 mr-2" size={20} />
                  <div>
                    <p className="text-sm text-lightgrayTxt">Publications</p>
                    <p className="text-lg font-semibold text-darkgrayTxt">
                      {teamPublications.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Membres de l'équipe */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-darkgrayTxt flex items-center">
                  <Users className="mr-2" size={20} />
                  Membres de mon équipe
                </h2>
              </div>
              <div className="p-6">
                {teamMembers.length === 0 ? (
                  <p className="text-lightgrayTxt text-center py-4">
                    Aucun membre dans votre équipe
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          {member.image ? (
                            <Image
                              src={member.image}
                              alt={member.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="text-gray-500" size={20} />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-darkgrayTxt">
                                {member.name}
                              </p>
                              {member.isTeamLeader && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                  Chef
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-lightgrayTxt">
                              {member.position}
                            </p>
                            <p className="text-xs text-lightgrayTxt">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Publications de l'équipe */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-darkgrayTxt flex items-center">
                  <FileText className="mr-2" size={20} />
                  Publications de l Equipe
                </h2>
              </div>
              <div className="p-6">
                {teamPublications.length === 0 ? (
                  <p className="text-lightgrayTxt text-center py-4">
                    Aucune publication dans votre équipe
                  </p>
                ) : (
                  <div className="space-y-4">
                    {teamPublications.map((publication) => (
                      <div
                        key={publication.id}
                        className="border-l-4 border-blue-500 pl-4 py-2"
                      >
                        <h3 className="font-medium text-darkgrayTxt">
                          {publication.title}
                        </h3>
                        <p className="text-sm text-lightgrayTxt">
                          {publication.journal} ({publication.year})
                        </p>
                        <p className="text-xs text-lightgrayTxt mt-1">
                          Auteurs: {publication.authors.join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
