"use client";

import { useState } from "react";
import { X, Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({
  isOpen,
  title,
  message,
  itemName,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error during deletion:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-grayBorder">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-darkgrayTxt">{title}</h2>
            </div>
            <button
              onClick={onCancel}
              disabled={loading}
              className="p-2 hover:bg-grayRectangle rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-darkgrayTxt">{message}</p>
          {itemName && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800">{itemName}</p>
            </div>
          )}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Cette action est irréversible et ne peut pas être annulée.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-grayBorder flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 border border-grayBorder rounded-lg hover:bg-grayRectangle transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 size={20} />
                Supprimer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
