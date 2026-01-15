"use client";

import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  placeholder?: string;
}

export default function ImageUpload({
  value,
  onChange,
  className = "",
  placeholder = "Sélectionner une image",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onChange(result.url);
      } else {
        alert(result.error || "Erreur lors de l'upload");
      }
    } catch (error) {
      console.error("Erreur upload:", error);
      alert("Erreur lors de l'upload du fichier");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      uploadFile(file);
    }
  }, []);

  const removeImage = () => {
    onChange("");
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {value ? (
        <div className="relative group">
          <div className="relative w-full h-48 border-2 border-grayBorder rounded-lg overflow-hidden">
            <Image
              src={value}
              alt="Image uploadée"
              fill
              className="object-cover"
              onError={() => {
                console.error("Erreur de chargement de l'image:", value);
                onChange(""); // Supprimer l'URL invalide
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={removeImage}
                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : uploading
              ? "border-gray-300 bg-gray-50"
              : "border-grayBorder hover:border-blue-400 hover:bg-blue-50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() =>
            !uploading && document.getElementById("image-upload")?.click()
          }
        >
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          <div className="space-y-2">
            {uploading ? (
              <>
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600">Upload en cours...</p>
              </>
            ) : (
              <>
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-darkgrayTxt">
                    {placeholder}
                  </p>
                  <p className="text-xs text-lightgrayTxt">
                    Glissez-déposez ou cliquez pour sélectionner
                  </p>
                  <p className="text-xs text-lightgrayTxt">
                    JPG, PNG, WEBP (max 5MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
