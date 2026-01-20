import { ShutterstockMetadata } from "../types";

// Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const base64Content = base64Data.split(",")[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Determine API base URL (works for both local dev and production)
const getApiBaseUrl = (): string => {
  // In production (Vercel), use relative path
  // In development, use the Vite proxy or direct API
  return "";
};

export const generateMetadata = async (imageFile: File): Promise<ShutterstockMetadata> => {
  try {
    const imageData = await fileToBase64(imageFile);
    const mimeType = imageFile.type;

    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/generate-metadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageData,
        mimeType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = (await response.json()) as ShutterstockMetadata;
    return data;
  } catch (error) {
    console.error("Error generating metadata:", error);
    throw error;
  }
};