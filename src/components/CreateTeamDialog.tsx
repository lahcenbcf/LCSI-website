"use client";

import { useState } from "react";
import { X, Building, Loader2 } from "lucide-react";
import { teamsAPI } from "@/lib/api";
import ImageUpload from "./ui/ImageUpload";

interface CreateTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: () => void;
}

interface CreateTeamData {
  slug: string;
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
  valueAdded_fr: string;
  valueAdded_en: string;
  keywords_fr: string;
  keywords_en: string;
  domains_fr: string;
  domains_en: string;
  expertises_fr: string;
  expertises_en: string;
  image: string;
}

export default function CreateTeamDialog({
  isOpen,
  onClose,
  onTeamCreated,
}: CreateTeamDialogProps) {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });
  const [formData, setFormData] = useState<CreateTeamData>({
    slug: "",
    name_fr: "",
    name_en: "",
    description_fr: "",
    description_en: "",
    valueAdded_fr: "",
    valueAdded_en: "",
    keywords_fr: "",
    keywords_en: "",
    domains_fr: "",
    domains_en: "",
    expertises_fr: "",
    expertises_en: "",
    image: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from French name
    if (name === "name_fr" && !formData.slug) {
      const slug = value
        .toUpperCase()
        .replace(/\s+/g, "_")
        .replace(/[^A-Z0-9_]/g, "");
      setFormData((prev) => ({
        ...prev,
        slug: slug.substring(0, 10), // Limit slug length
      }));
    }
  };

  const parseArrayField = (value: string): string[] => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name_fr.trim() ||
      !formData.name_en.trim() ||
      !formData.slug.trim()
    ) {
      setNotification({
        show: true,
        message: "Le nom (FR et EN) et le slug sont obligatoires",
        type: "error",
      });

      setTimeout(() => {
        setNotification({ show: false, message: "", type: "error" });
      }, 5000);
      return;
    }

    setLoading(true);
    try {
      const teamData = {
        slug: formData.slug.trim(),
        image: formData.image.trim() || undefined,
        translations: {
          FR: {
            name: formData.name_fr.trim(),
            description: formData.description_fr.trim() || "",
            valueAdded: formData.valueAdded_fr.trim() || undefined,
            keywords: parseArrayField(formData.keywords_fr),
            domains: parseArrayField(formData.domains_fr),
            expertises: parseArrayField(formData.expertises_fr),
          },
          EN: {
            name: formData.name_en.trim(),
            description: formData.description_en.trim() || "",
            valueAdded: formData.valueAdded_en.trim() || undefined,
            keywords: parseArrayField(formData.keywords_en),
            domains: parseArrayField(formData.domains_en),
            expertises: parseArrayField(formData.expertises_en),
          },
        },
      };

      await teamsAPI.create(teamData);

      // Reset form
      setFormData({
        slug: "",
        name_fr: "",
        name_en: "",
        description_fr: "",
        description_en: "",
        valueAdded_fr: "",
        valueAdded_en: "",
        keywords_fr: "",
        keywords_en: "",
        domains_fr: "",
        domains_en: "",
        expertises_fr: "",
        expertises_en: "",
        image: "",
      });

      onTeamCreated();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la création:", error);

      setNotification({
        show: true,
        message: "Erreur lors de la création de l'équipe",
        type: "error",
      });

      setTimeout(() => {
        setNotification({ show: false, message: "", type: "error" });
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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

      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-grayBorder">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-darkgrayTxt flex items-center">
              <Building className="mr-2" size={24} />
              Créer une nouvelle équipe
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-grayRectangle rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]"
        >
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-darkgrayTxt">
              Informations de base
            </h3>

            {/* Slug */}
            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-darkgrayTxt mb-2"
              >
                Slug/Code *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: DDD"
              />
            </div>

            {/* Nom - FR et EN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name_fr"
                  className="block text-sm font-medium text-darkgrayTxt mb-2"
                >
                  Nom (Français) *
                </label>
                <input
                  type="text"
                  id="name_fr"
                  name="name_fr"
                  value={formData.name_fr}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ex: Développement et Déploiement Distribué"
                />
              </div>

              <div>
                <label
                  htmlFor="name_en"
                  className="block text-sm font-medium text-darkgrayTxt mb-2"
                >
                  Nom (English) *
                </label>
                <input
                  type="text"
                  id="name_en"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ex: Distributed Development and Deployment"
                />
              </div>
            </div>

            {/* Description - FR et EN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="description_fr"
                  className="block text-sm font-medium text-darkgrayTxt mb-2"
                >
                  Description (Français)
                </label>
                <textarea
                  id="description_fr"
                  name="description_fr"
                  value={formData.description_fr}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Description de l'équipe..."
                />
              </div>

              <div>
                <label
                  htmlFor="description_en"
                  className="block text-sm font-medium text-darkgrayTxt mb-2"
                >
                  Description (English)
                </label>
                <textarea
                  id="description_en"
                  name="description_en"
                  value={formData.description_en}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Team description..."
                />
              </div>
            </div>

            {/* Value Added - FR et EN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="valueAdded_fr"
                  className="block text-sm font-medium text-darkgrayTxt mb-2"
                >
                  Valeur ajoutée (Français)
                </label>
                <textarea
                  id="valueAdded_fr"
                  name="valueAdded_fr"
                  value={formData.valueAdded_fr}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Valeur apportée..."
                />
              </div>

              <div>
                <label
                  htmlFor="valueAdded_en"
                  className="block text-sm font-medium text-darkgrayTxt mb-2"
                >
                  Valeur ajoutée (English)
                </label>
                <textarea
                  id="valueAdded_en"
                  name="valueAdded_en"
                  value={formData.valueAdded_en}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Added value..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                Image de Equipe
              </label>
              <ImageUpload
                value={formData.image}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, image: url }))
                }
                placeholder="Ajouter une image d'équipe"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-darkgrayTxt">
              Catégories et spécialisations
            </h3>
            <p className="text-sm text-lightgrayTxt">
              Séparez les éléments par des virgules
            </p>

            {/* Keywords - FR et EN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="keywords_fr"
                  className="block text-sm font-medium text-darkgrayTxt mb-2"
                >
                  Mots-clés (Français)
                </label>
                <input
                  type="text"
                  id="keywords_fr"
                  name="keywords_fr"
                  value={formData.keywords_fr}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ex: développement, déploiement"
                />
              </div>

              <div>
                <label
                  htmlFor="keywords_en"
                  className="block text-sm font-medium text-darkgrayTxt mb-2"
                >
                  Mots-clés (English)
                </label>
                <input
                  type="text"
                  id="keywords_en"
                  name="keywords_en"
                  value={formData.keywords_en}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ex: development, deployment"
                />
              </div>
            </div>

            {/* Domains - FR et EN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="domains_fr"
                  className="block text-sm font-medium text-darkgrayTxt mb-2"
                >
                  Domaines (Français)
                </label>
                <input
                  type="text"
                  id="domains_fr"
                  name="domains_fr"
                  value={formData.domains_fr}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ex: cloud computing, IoT"
                />
              </div>

              <div>
                <label
                  htmlFor="domains_en"
                  className="block text-sm font-medium text-darkgrayTxt mb-2"
                >
                  Domaines (English)
                </label>
                <input
                  type="text"
                  id="domains_en"
                  name="domains_en"
                  value={formData.domains_en}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ex: cloud computing, IoT"
                />
              </div>
            </div>

            {/* Expertises - FR et EN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="expertises_fr"
                  className="block text-sm font-medium text-darkgrayTxt mb-2"
                >
                  Expertises (Français)
                </label>
                <input
                  type="text"
                  id="expertises_fr"
                  name="expertises_fr"
                  value={formData.expertises_fr}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ex: architecture logicielle, DevOps"
                />
              </div>

              <div>
                <label
                  htmlFor="expertises_en"
                  className="block text-sm font-medium text-darkgrayTxt mb-2"
                >
                  Expertises (English)
                </label>
                <input
                  type="text"
                  id="expertises_en"
                  name="expertises_en"
                  value={formData.expertises_en}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ex: software architecture, DevOps"
                />
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-grayBorder">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-darkgrayTxt border border-grayBorder rounded-lg hover:bg-grayRectangle transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Création...
                </>
              ) : (
                "Créer l'équipe"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
