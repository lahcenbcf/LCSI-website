"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  User,
  Mail,
  Phone,
  Building,
  Save,
  Loader2,
  MapPin,
} from "lucide-react";
import { useTeams } from "@/hooks/useTeams";
import { man, woman } from "@/assets";

const positions = [
  "Professeur",
  "Maître de conférences",
  "Professeur assistant",
  "Chercheur",
  "Doctorant",
  "Ingénieur de recherche",
];

type ProfileData = {
  firstname: string;
  lastname: string;
  email: string;
  position: string;
  teamSlug: string;
  gender: "MALE" | "FEMALE" | "";
  phone: string;
  bio_fr: string;
  bio_en: string;
  institution_fr: string;
  institution_en: string;
  image: string;
  isTeamLeader: boolean;
};

interface NotificationProps {
  show: boolean;
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Notification = ({ show, message, type, onClose }: NotificationProps) => {
  if (!show) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 animate-in slide-in-from-bottom ${
        type === "success"
          ? "bg-green-50 border-green-500 text-green-800"
          : "bg-red-50 border-red-500 text-red-800"
      }`}
    >
      <div className="flex items-center space-x-3">
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

interface ProfileImageProps {
  image?: string | null;
  gender: "MALE" | "FEMALE" | "";
}

const ProfileImage = ({ image, gender }: ProfileImageProps) => {
  const getDefaultImage = () => {
    if (gender === "FEMALE") {
      return typeof woman === "string" ? woman : woman.src;
    }
    return typeof man === "string" ? man : man.src;
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-grayBorder">
      <h3 className="text-lg font-semibold text-darkgrayTxt mb-4">
        Photo de profil
      </h3>
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <img
            src={image || getDefaultImage()}
            alt="Photo de profil"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = getDefaultImage();
            }}
          />
        </div>
        <p className="text-sm text-lightgrayTxt text-center">
          Photo de profil Google
        </p>
      </div>
    </div>
  );
};

interface InputFieldProps {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
  helperText?: string;
}

const InputField = ({
  label,
  icon,
  value,
  onChange,
  disabled = false,
  type = "text",
  placeholder,
  helperText,
}: InputFieldProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-darkgrayTxt mb-2">
        {icon && <span className="inline mr-1">{icon}</span>}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg transition-colors ${
          disabled
            ? "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
            : "border-grayBorder focus:ring-2 focus:ring-mainBlue focus:border-mainBlue"
        }`}
        placeholder={placeholder}
      />
      {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
    </div>
  );
};

interface SelectFieldProps {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}

const SelectField = ({
  label,
  icon,
  value,
  onChange,
  options,
  disabled = false,
}: SelectFieldProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-darkgrayTxt mb-2">
        {icon && <span className="inline mr-1">{icon}</span>}
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors disabled:opacity-50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const TextAreaField = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 6,
}: TextAreaFieldProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-darkgrayTxt mb-2">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue transition-colors resize-none"
        placeholder={placeholder}
      />
    </div>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Section = ({ title, children, className = "" }: SectionProps) => {
  return (
    <div
      className={`bg-white rounded-lg p-6 shadow-sm border border-grayBorder ${className}`}
    >
      <h3 className="text-lg font-semibold text-darkgrayTxt mb-6">{title}</h3>
      {children}
    </div>
  );
};

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: teamsData, loading: teamsLoading } = useTeams();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const [profile, setProfile] = useState<ProfileData>({
    firstname: "",
    lastname: "",
    email: "",
    position: "",
    teamSlug: "",
    gender: "",
    phone: "",
    bio_fr: "",
    bio_en: "",
    institution_fr: "",
    institution_en: "",
    image: "",
    isTeamLeader: false,
  });

  const [initialProfile, setInitialProfile] = useState<ProfileData>({
    firstname: "",
    lastname: "",
    email: "",
    position: "",
    teamSlug: "",
    gender: "",
    phone: "",
    bio_fr: "",
    bio_en: "",
    institution_fr: "",
    institution_en: "",
    image: "",
    isTeamLeader: false,
  });

  const loadProfile = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const response = await fetch("/api/profile");

      if (!response.ok) {
        throw new Error("Erreur lors du chargement du profil");
      }

      const data = await response.json();
      const baseImage = user.image || "";

      const profileData: ProfileData = data.exists
        ? {
            firstname: data.firstname || "",
            lastname: data.lastname || "",
            email: data.email,
            position: data.position || "",
            teamSlug: data.teamSlug || "",
            gender: data.gender || "",
            phone: data.phone || "",
            bio_fr: data.bio_fr || "",
            bio_en: data.bio_en || "",
            institution_fr: data.institution_fr || "",
            institution_en: data.institution_en || "",
            image: data.image || baseImage,
            isTeamLeader: data.isTeamLeader || false,
          }
        : {
            firstname:
              (user.name || "").trim().split(" ").slice(1).join(" ") ||
              "",
            lastname: (user.name || "").trim().split(" ")[0] || "",
            email: user.email,
            position: "",
            teamSlug: "",
            gender: "",
            phone: "",
            bio_fr: "",
            bio_en: "",
            institution_fr: "",
            institution_en: "",
            image: baseImage,
            isTeamLeader: false,
          };

      setProfile(profileData);
      setInitialProfile(profileData);
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
      const nameParts = (user?.name || "").trim().split(" ");
      const profileData: ProfileData = {
        firstname: nameParts.slice(1).join(" ") || "",
        lastname: nameParts[0] || "",
        email: user?.email || "",
        position: "",
        teamSlug: "",
        gender: "",
        phone: "",
        bio_fr: "",
        bio_en: "",
        institution_fr: "",
        institution_en: "",
        image: user?.image || "",
        isTeamLeader: false,
      };
      setProfile(profileData);
      setInitialProfile(profileData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      setNotification({
        show: true,
        message: "✓ Profil mis à jour avec succès !",
        type: "success",
      });

      setInitialProfile(profile);

      setTimeout(() => {
        setNotification({ show: false, message: "", type: "success" });
      }, 5000);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);

      setNotification({
        show: true,
        message:
          error instanceof Error
            ? `✗ ${error.message}`
            : "✗ Erreur lors de la sauvegarde",
        type: "error",
      });

      setTimeout(() => {
        setNotification({ show: false, message: "", type: "error" });
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    return JSON.stringify(profile) !== JSON.stringify(initialProfile);
  };

  const handleInputChange = (
    field: keyof ProfileData,
    value: string | boolean
  ) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const closeNotification = () => {
    setNotification({ show: false, message: "", type: "success" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-mainBlue" />
        <span className="ml-2 text-lightgrayTxt">Chargement du profil...</span>
      </div>
    );
  }

  const teams = teamsData?.teams
    ? [
        { value: "", label: "Sélectionner une équipe" },
        ...teamsData.teams.map((team) => ({
          value: team.slug,
          label: team.name || "",
        })),
      ]
    : [{ value: "", label: "Chargement des équipes..." }];

  const positionOptions = [
    { value: "", label: "Sélectionner une position" },
    ...positions.map((pos) => ({ value: pos, label: pos })),
  ];

  const genderOptions = [
    { value: "", label: "Sélectionner" },
    { value: "MALE", label: "Homme" },
    { value: "FEMALE", label: "Femme" },
  ];

  return (
    <div className="space-y-6">
      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={closeNotification}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-darkgrayTxt font-integralCF">
            Mes Parametres
          </h1>
          <p className="text-lightgrayTxt">
            Modifiez vos informations personnelles et professionnelles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProfileImage
          image={user?.image || profile.image}
          gender={profile.gender}
        />

        <Section title="Informations personnelles" className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Prénom *"
              icon={<User size={16} />}
              value={profile.firstname}
              disabled
            />

            <InputField
              label="Nom *"
              icon={<User size={16} />}
              value={profile.lastname}
              disabled
            />

            <InputField
              label="Email"
              icon={<Mail size={16} />}
              value={profile.email}
              type="email"
              disabled
              helperText="L'email ne peut pas être modifié"
            />

            <InputField
              label="Téléphone"
              icon={<Phone size={16} />}
              value={profile.phone}
              onChange={(value) => handleInputChange("phone", value)}
              type="tel"
              placeholder="+213 555 123 456"
            />

            <SelectField
              label="Genre *"
              value={profile.gender}
              onChange={(value) => handleInputChange("gender", value)}
              options={genderOptions}
            />
          </div>
        </Section>
      </div>

      <Section title="Informations professionnelles">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            label="Position *"
            icon={<Building size={16} />}
            value={profile.position}
            onChange={(value) => handleInputChange("position", value)}
            options={positionOptions}
          />

          <SelectField
            label="Equipe *"
            value={profile.teamSlug}
            onChange={(value) => handleInputChange("teamSlug", value)}
            options={teams}
            disabled={teamsLoading}
          />

          <InputField
            label="Institution (Français)"
            icon={<MapPin size={16} />}
            value={profile.institution_fr}
            onChange={(value) => handleInputChange("institution_fr", value)}
            placeholder="ex: École Nationale Supérieure d'Informatique"
          />

          <InputField
            label="Institution (English)"
            icon={<MapPin size={16} />}
            value={profile.institution_en}
            onChange={(value) => handleInputChange("institution_en", value)}
            placeholder="ex: National Higher School of Computer Science"
          />

          <div className="flex items-center space-x-3 pt-8">
            <input
              type="checkbox"
              id="isTeamLeader"
              checked={profile.isTeamLeader}
              onChange={(e) =>
                handleInputChange("isTeamLeader", e.target.checked)
              }
              className="w-4 h-4 text-mainBlue focus:ring-mainBlue border-grayBorder rounded"
            />
            <label htmlFor="isTeamLeader" className="text-sm text-darkgrayTxt">
              Je suis responsable de cette équipe
            </label>
          </div>
        </div>
      </Section>

      <Section title="Biographie">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextAreaField
            label="Français"
            value={profile.bio_fr}
            onChange={(value) => handleInputChange("bio_fr", value)}
            placeholder="Parlez-nous de votre parcours, vos recherches, vos intérêts..."
          />

          <TextAreaField
            label="English"
            value={profile.bio_en}
            onChange={(value) => handleInputChange("bio_en", value)}
            placeholder="Tell us about your background, research, interests..."
          />
        </div>
      </Section>

      <div className="flex justify-end space-x-3">
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges()}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 disabled:cursor-not-allowed ${
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
                {hasChanges()
                  ? "Sauvegarder les modifications"
                  : "Aucune modification"}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
