import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier reçu" },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non supporté. Utilisez JPG, PNG ou WEBP" },
        { status: 400 }
      );
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Le fichier est trop volumineux. Taille maximum: 5MB" },
        { status: 400 }
      );
    }

    // Convertir le fichier en base64
    const bytes = await file.arrayBuffer();
    const base64File = Buffer.from(bytes).toString("base64");
    const dataUri = `data:${file.type};base64,${base64File}`;

    // Upload vers Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(dataUri, {
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    });

    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url,
      fileName: uploadResponse.public_id,
    });
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'upload du fichier",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
