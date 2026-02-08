"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { User, Building, Users, Phone, FileText, Loader2 } from "lucide-react";
import { useTeams } from "@/hooks/useTeams";
import { membersAPI } from "@/lib/api";
import { man, woman } from "@/assets";
import { useProfileState } from "@/contexts/ProfileStateContext";

const positions = [
  "Professeur",
  "Maître de conférences",
  "Professeur assistant",
  "Chercheur",
  "Doctorant",
  "Ingénieur de recherche",
];

interface ProfileFormData {
  // Données communes (non traduites)
  firstname: string;
  lastname: string;
  position: string;
  teamSlug: string;
  gender: "MALE" | "FEMALE" | "";
  phone: string;
  image: string;
  isTeamLeader: boolean;

  // Données traduites FR/EN
  bio_fr: string;
  institution_fr: string;
  bio_en: string;
  institution_en: string;
}

export default function FirstLoginForm() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const { data: teamsData, loading: teamsLoading } = useTeams();
  const { notifyProfileCreated } = useProfileState();

  const [loading, setLoading] = useState(false);

  // Extraire firstname et lastname du nom Google
  const getFirstLastName = () => {
    if (!user?.name) return { firstname: "", lastname: "" };

    const nameParts = user.name.trim().split(" ");
    if (nameParts.length === 1) {
      return { firstname: nameParts[0], lastname: "" };
    }

    // Le premier mot est le nom de famille, le reste est le prénom
    const lastname = nameParts[0];
    const firstname = nameParts.slice(1).join(" ");

    return { firstname, lastname };
  };
  const { firstname: googleFirstname, lastname: googleLastname } =
    getFirstLastName();

  const [formData, setFormData] = useState<ProfileFormData>({
    firstname: googleFirstname,
    lastname: googleLastname,
    position: "",
    teamSlug: "",
    gender: "",
    phone: "",
    image: user?.image || "",
    isTeamLeader: false,
    bio_fr: "",
    institution_fr: "",
    bio_en: "",
    institution_en: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mettre à jour firstname et lastname quand l'utilisateur est chargé
  useEffect(() => {
    if (user?.name) {
      const { firstname, lastname } = getFirstLastName();
      setFormData((prev) => ({
        ...prev,
        firstname,
        lastname,
      }));
    }
  }, [user?.name]);

  // Mettre à jour l'image automatiquement selon le genre si pas de photo utilisateur
  useEffect(() => {
    if (!user?.image && formData.gender) {
      const defaultImage = formData.gender === "MALE" ? man.src : woman.src;
      setFormData((prev) => ({ ...prev, image: defaultImage }));
    }
  }, [formData.gender, user?.image]); // Format teams data for dropdown
  const teams = teamsData?.teams
    ? [
        { value: "", label: "Sélectionner une équipe" },
        ...teamsData.teams.map((team) => ({
          value: team.slug,
          label: team.name,
        })),
      ]
    : [{ value: "", label: "Chargement des équipes..." }];

  const handleInputChange = (
    field: keyof ProfileFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Champs communs obligatoires
    if (!formData.firstname.trim())
      newErrors.firstname = "Le prénom est requis";
    if (!formData.lastname.trim()) newErrors.lastname = "Le nom est requis";
    if (!formData.position) newErrors.position = "La position est requise";
    if (!formData.gender) newErrors.gender = "Le genre est requis";

    // Team, phone, biography, and institution fields are now optional

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.email) {
      alert("Informations utilisateur manquantes");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Créer le membre avec les traductions FR et EN
      const memberData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: user.email,
        phone: formData.phone,
        gender: formData.gender as "MALE" | "FEMALE",
        position: formData.position,
        image: formData.image || undefined,
        teamSlug: formData.teamSlug,
        isTeamLeader: formData.isTeamLeader,
        translations: {
          FR: {
            bio: formData.bio_fr,
            institution: formData.institution_fr,
          },
          EN: {
            bio: formData.bio_en,
            institution: formData.institution_en,
          },
        },
      };

      await membersAPI.create(memberData);

      // Notifier que le profil a été créé
      notifyProfileCreated();

      // Forcer le rechargement de l'utilisateur pour mettre à jour les états
      await refresh();

      // Rediriger vers le dashboard avec un délai pour laisser le temps à l'état de se mettre à jour
      setTimeout(() => {
        router.push("/fr/dash");
        router.refresh();
      }, 200);
    } catch (error) {
      console.error("Erreur lors de la création du profil:", error);
      alert("Erreur lors de la création du profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-mainBlue rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-darkgrayTxt mb-2">
            Bienvenue au LCSI !
          </h1>
          <p className="text-lightgrayTxt">
            Complétez votre profil pour accéder au laboratoire
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-800">
              <strong>Connecté en tant que :</strong> {user?.name} (
              {user?.email})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-darkgrayTxt border-b border-grayBorder pb-2">
              Informations personnelles
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                  <User size={16} className="inline mr-1" />
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.firstname}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed border-grayBorder"
                  placeholder="Ex: Yasser"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Récupéré depuis votre compte Google
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                  <User size={16} className="inline mr-1" />
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.lastname}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed border-grayBorder"
                  placeholder="Ex: Bachta"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Récupéré depuis votre compte Google
                </p>
              </div>
            </div>
          </div>

          {/* Position et Équipe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                <Building size={16} className="inline mr-1" />
                Position *
              </label>
              <select
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors ${
                  errors.position ? "border-red-500" : "border-grayBorder"
                }`}
              >
                <option value="">Sélectionner une position</option>
                {positions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
              {errors.position && (
                <p className="text-red-500 text-xs mt-1">{errors.position}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                <Users size={16} className="inline mr-1" />
                Equipe (optionnel)
              </label>
              <select
                value={formData.teamSlug}
                onChange={(e) => handleInputChange("teamSlug", e.target.value)}
                disabled={teamsLoading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors ${
                  errors.teamSlug ? "border-red-500" : "border-grayBorder"
                } ${teamsLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {teams.map((team) => (
                  <option key={team.value} value={team.value}>
                    {team.label}
                  </option>
                ))}
              </select>
              {errors.teamSlug && (
                <p className="text-red-500 text-xs mt-1">{errors.teamSlug}</p>
              )}
            </div>
          </div>

          {/* Genre et Téléphone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                Genre *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors ${
                  errors.gender ? "border-red-500" : "border-grayBorder"
                }`}
              >
                <option value="">Sélectionner</option>
                <option value="MALE">Homme</option>
                <option value="FEMALE">Femme</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                <Phone size={16} className="inline mr-1" />
                Téléphone (optionnel)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors ${
                  errors.phone ? "border-red-500" : "border-grayBorder"
                }`}
                placeholder="+213 555 123 456"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Photo de profil automatique */}
          {formData.image && (
            <div>
              <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                Photo de profil
              </label>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={formData.image}
                  alt="Photo de profil"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="text-sm text-gray-600">
                  {user?.image
                    ? "Photo récupérée depuis votre compte"
                    : "Photo par défaut selon votre genre"}
                </div>
              </div>
            </div>
          )}

          {/* Biographies (FR et EN côte à côte) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-darkgrayTxt border-b border-grayBorder pb-2">
              Biographies (Français et Anglais) - Optionnel
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Biographie FR */}
              <div>
                <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                  🇫🇷 Biographie (Français)
                </label>
                <textarea
                  value={formData.bio_fr}
                  onChange={(e) => handleInputChange("bio_fr", e.target.value)}
                  rows={5}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors resize-none ${
                    errors.bio_fr ? "border-red-500" : "border-grayBorder"
                  }`}
                  placeholder="Parlez-nous de votre parcours, vos recherches, vos intérêts..."
                />
                {errors.bio_fr && (
                  <p className="text-red-500 text-xs mt-1">{errors.bio_fr}</p>
                )}
              </div>

              {/* Biographie EN */}
              <div>
                <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                  🇬🇧 Biography (English)
                </label>
                <textarea
                  value={formData.bio_en}
                  onChange={(e) => handleInputChange("bio_en", e.target.value)}
                  rows={5}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors resize-none ${
                    errors.bio_en ? "border-red-500" : "border-grayBorder"
                  }`}
                  placeholder="Tell us about your background, research, and interests..."
                />
                {errors.bio_en && (
                  <p className="text-red-500 text-xs mt-1">{errors.bio_en}</p>
                )}
              </div>
            </div>
          </div>

          {/* Institutions (FR et EN côte à côte) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-darkgrayTxt border-b border-grayBorder pb-2">
              Institutions (Français et Anglais) - Optionnel
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Institution FR */}
              <div>
                <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                  🇫🇷 Institution (Français)
                </label>
                <input
                  type="text"
                  value={formData.institution_fr}
                  onChange={(e) =>
                    handleInputChange("institution_fr", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors ${
                    errors.institution_fr
                      ? "border-red-500"
                      : "border-grayBorder"
                  }`}
                  placeholder="Ex: École Nationale Supérieure d'Informatique"
                />
                {errors.institution_fr && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.institution_fr}
                  </p>
                )}
              </div>

              {/* Institution EN */}
              <div>
                <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                  🇬🇧 Institution (English)
                </label>
                <input
                  type="text"
                  value={formData.institution_en}
                  onChange={(e) =>
                    handleInputChange("institution_en", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors ${
                    errors.institution_en
                      ? "border-red-500"
                      : "border-grayBorder"
                  }`}
                  placeholder="Ex: National Higher School of Computer Science"
                />
                {errors.institution_en && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.institution_en}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Chef d'équipe */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isTeamLeader"
              checked={formData.isTeamLeader}
              onChange={(e) =>
                handleInputChange("isTeamLeader", e.target.checked)
              }
              className="w-4 h-4 text-mainBlue focus:ring-mainBlue border-grayBorder rounded"
            />
            <label htmlFor="isTeamLeader" className="text-sm text-darkgrayTxt">
              Je suis responsable de cette équipe
            </label>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || teamsLoading}
              className="w-full bg-mainBlue text-white py-3 px-4 rounded-lg hover:bg-mainBlue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Création du profil...
                </>
              ) : (
                "Créer mon profil"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
