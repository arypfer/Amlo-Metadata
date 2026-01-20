import { ShutterstockMetadata } from "../types";

// Helper: Resize and compress image
const optimizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // Calculate new dimensions (max 1536px works well for Gemini)
        const MAX_SIZE = 1536;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG at 80% quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85); // Slightly higher for better AI perception
        const base64Content = dataUrl.split(',')[1];
        resolve(base64Content);
      };
      img.onerror = (err) => reject(new Error("Failed to load image for optimization"));
    };
    reader.onerror = (err) => reject(new Error("Failed to read file"));
  });
};

// Retry logic wrapper
const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    // If rate limited (504, 503, 429), throw to retry
    if (!response.ok && [503, 504, 429].includes(response.status) && retries > 0) {
      throw new Error(`Retrying due to status ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries === 0) throw error;
    console.log(`Retrying... attempts left: ${retries}`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(url, options, retries - 1, delay * 2);
  }
};

export const generateMetadata = async (imageFile: File, additionalInstructions?: string): Promise<ShutterstockMetadata> => {
  try {
    // 1. Optimize image (Resize & Compress)
    console.log("Optimizing image...", imageFile.name);
    const imageData = await optimizeImage(imageFile);

    // 2. Call API with Retry Logic
    const response = await fetchWithRetry("/api/generate-metadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageData,
        mimeType: "image/jpeg",
        additionalInstructions: additionalInstructions || undefined // Pass custom rules
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
    const msg = error instanceof Error ? error.message : "Unknown error";
    if (msg.includes("413")) throw new Error("Image too large. Please use a smaller file.");
    if (msg.includes("504")) throw new Error("Analysis timed out. Please try again.");
    throw error;
  }
};