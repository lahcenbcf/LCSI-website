"use client";

import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";

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

export default function SecurityPage() {
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordNotification, setPasswordNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async () => {
    // Validate form
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordNotification({
        show: true,
        message: "✗ Tous les champs sont obligatoires",
        type: "error",
      });
      setTimeout(() => {
        setPasswordNotification({ show: false, message: "", type: "error" });
      }, 5000);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordNotification({
        show: true,
        message: "✗ Les mots de passe ne correspondent pas",
        type: "error",
      });
      setTimeout(() => {
        setPasswordNotification({ show: false, message: "", type: "error" });
      }, 5000);
      return;
    }

    setPasswordUpdating(true);
    try {
      const response = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      setPasswordNotification({
        show: true,
        message: "✓ Mot de passe mis à jour avec succès !",
        type: "success",
      });

      // Reset form
      setPasswordForm({
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        setPasswordNotification({ show: false, message: "", type: "success" });
      }, 5000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error);

      setPasswordNotification({
        show: true,
        message:
          error instanceof Error
            ? `✗ ${error.message}`
            : "✗ Erreur lors de la mise à jour",
        type: "error",
      });

      setTimeout(() => {
        setPasswordNotification({ show: false, message: "", type: "error" });
      }, 5000);
    } finally {
      setPasswordUpdating(false);
    }
  };

  const closePasswordNotification = () => {
    setPasswordNotification({ show: false, message: "", type: "success" });
  };

  return (
    <div className="space-y-6">
      <Notification
        show={passwordNotification.show}
        message={passwordNotification.message}
        type={passwordNotification.type}
        onClose={closePasswordNotification}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-darkgrayTxt font-integralCF">
            Sécurité
          </h1>
          <p className="text-lightgrayTxt">
            Gérez vos paramètres de sécurité et mots de passe
          </p>
        </div>
      </div>

      <Section title="Modifier le mot de passe">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Nouveau mot de passe *"
            icon={<Lock size={16} />}
            value={passwordForm.newPassword}
            onChange={(value) =>
              setPasswordForm((prev) => ({ ...prev, newPassword: value }))
            }
            type="password"
            placeholder="Entrez votre nouveau mot de passe"
            helperText="Au moins 8 caractères"
          />

          <InputField
            label="Confirmer le mot de passe *"
            icon={<Lock size={16} />}
            value={passwordForm.confirmPassword}
            onChange={(value) =>
              setPasswordForm((prev) => ({
                ...prev,
                confirmPassword: value,
              }))
            }
            type="password"
            placeholder="Confirmez votre nouveau mot de passe"
          />
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handlePasswordChange}
            disabled={passwordUpdating}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 disabled:cursor-not-allowed ${
              !passwordUpdating
                ? "bg-mainBlue text-white hover:bg-mainBlue/90 shadow-md"
                : "bg-gray-400 text-gray-600 cursor-not-allowed"
            }`}
          >
            {passwordUpdating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Mise à jour...</span>
              </>
            ) : (
              <>
                <Lock size={20} />
                <span>Mettre à jour le mot de passe</span>
              </>
            )}
          </button>
        </div>
      </Section>
    </div>
  );
}
