import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebaseConfig";

// Configuration limits
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Validates a file against size and format limits
 */
const validateImage = (file: File) => {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Invalid file format. Only JPG, PNG, and WEBP are allowed.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
  }
};

/**
 * Handles Firebase storage error translations
 */
const handleStorageError = (error: any) => {
  console.error("Storage Error:", error);
  if (error.code === 'storage/unauthorized') {
    throw new Error("You do not have permission to upload files.");
  } else if (error.code === 'storage/canceled') {
    throw new Error("Upload was canceled.");
  } else {
    throw new Error("An error occurred during file upload. Please try again.");
  }
};

export const storageService = {
  /**
   * Internal reusable upload method
   */
  _uploadInternal: async (
    file: File, 
    pathPrefix: string, 
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    validateImage(file);

    return new Promise((resolve, reject) => {
      // Create a unique, clean filename
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_').toLowerCase();
      const uniqueFilename = `${Date.now()}_${safeName}`;
      const storageRef = ref(storage, `${pathPrefix}/${uniqueFilename}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot: any) => {
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            // Round to 1 decimal place for clean UI
            onProgress(Math.round(progress * 10) / 10);
          }
        },
        (error: any) => {
          try {
            handleStorageError(error);
          } catch (translatedError) {
            reject(translatedError);
          }
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  },

  /**
   * Upload a product image to the products collection
   */
  uploadProductImage: async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
    return storageService._uploadInternal(file, "products", onProgress);
  },

  /**
   * Upload a promotional banner image
   */
  uploadOfferBanner: async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
    return storageService._uploadInternal(file, "offers", onProgress);
  },

  /**
   * Upload a category image
   */
  uploadCategoryImage: async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
    return storageService._uploadInternal(file, "categories", onProgress);
  },

  /**
   * Upload a customer payment screenshot
   */
  uploadPaymentScreenshot: async (file: File, orderId: string, onProgress?: (progress: number) => void): Promise<string> => {
    return storageService._uploadInternal(file, `screenshots/${orderId}`, onProgress);
  },

  /**
   * Delete an image from storage using its public URL
   */
  deleteImage: async (downloadUrl: string): Promise<void> => {
    try {
      // Decode the URL to extract the storage path
      // Firebase Storage URLs follow this pattern: .../v0/b/[bucket]/o/[path]?alt=media...
      const urlObject = new URL(downloadUrl);
      const pathname = urlObject.pathname;
      const pathStartIndex = pathname.indexOf('/o/') + 3;
      if (pathStartIndex < 3) {
        throw new Error("Invalid Firebase Storage URL");
      }
      const encodedFilePath = pathname.substring(pathStartIndex);
      const filePath = decodeURIComponent(encodedFilePath);

      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Failed to delete image:", error);
      throw new Error("Failed to delete image from storage.");
    }
  }
};
