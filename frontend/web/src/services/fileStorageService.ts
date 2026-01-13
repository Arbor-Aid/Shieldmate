import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  listAll
} from "firebase/storage";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  serverTimestamp,
  doc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { trackEvent } from "@/lib/firebase";

const storage = getStorage();

export interface FileMetadata {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  storagePath: string;
  downloadUrl: string;
  userId: string;
}

export interface OrganizationFileMetadata {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  storagePath: string;
  downloadUrl: string;
  organizationId: string;
  uploadedBy: string;
  description?: string;
  category?: string;
}

// Upload a file to Firebase Storage
export const uploadFile = async (
  userId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<FileMetadata> => {
  try {
    // Create a reference to the file in Firebase Storage
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `users/${userId}/documents/${fileName}`;
    const storageRef = ref(storage, filePath);

    // Upload the file
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Return a promise that resolves when the upload is complete
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress if a callback is provided
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          }
        },
        (error) => {
          // Handle upload errors
          console.error('Upload error:', error);
          trackEvent('file_upload_error', { error: error.message, fileType: file.type });
          reject(error);
        },
        async () => {
          // Upload completed successfully
          try {
            // Get the download URL
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Save file metadata to Firestore
            const fileData = {
              name: file.name,
              type: file.type,
              size: file.size,
              uploadDate: serverTimestamp(),
              storagePath: filePath,
              downloadUrl,
              userId
            };
            
            const docRef = await addDoc(collection(db, 'userDocuments'), fileData);
            
            // Track successful upload
            trackEvent('file_uploaded', { 
              fileType: file.type, 
              fileSize: file.size 
            });
            
            resolve({
              id: docRef.id,
              ...fileData,
              uploadDate: new Date(),
            } as FileMetadata);
          } catch (err) {
            console.error('Error saving file metadata:', err);
            reject(err);
          }
        }
      );
    });
  } catch (error) {
    console.error('Upload initialization error:', error);
    throw error;
  }
};

// Get all files for a user
export const getUserFiles = async (userId: string): Promise<FileMetadata[]> => {
  try {
    const filesQuery = query(
      collection(db, 'userDocuments'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(filesQuery);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        type: data.type,
        size: data.size,
        uploadDate: data.uploadDate?.toDate() || new Date(),
        storagePath: data.storagePath,
        downloadUrl: data.downloadUrl,
        userId: data.userId
      } as FileMetadata;
    });
  } catch (error) {
    console.error('Error getting user files:', error);
    throw error;
  }
};

// Delete a file
export const deleteFile = async (fileId: string, storagePath: string): Promise<boolean> => {
  try {
    // Delete from Storage
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    
    // Delete from Firestore
    await deleteDoc(doc(db, 'userDocuments', fileId));
    
    trackEvent('file_deleted', { fileId });
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    trackEvent('file_delete_error', { error: (error as Error).message, fileId });
    throw error;
  }
};

// Upload organization outreach materials
export const uploadOrganizationFile = async (
  organizationId: string,
  userId: string,
  file: File,
  description?: string,
  category?: string,
  onProgress?: (progress: number) => void
): Promise<OrganizationFileMetadata> => {
  try {
    // Create a reference to the file in Firebase Storage
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `organizations/${organizationId}/materials/${fileName}`;
    const storageRef = ref(storage, filePath);

    // Upload the file
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Return a promise that resolves when the upload is complete
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress if a callback is provided
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          }
        },
        (error) => {
          // Handle upload errors
          console.error('Organization file upload error:', error);
          trackEvent('org_file_upload_error', { 
            error: error.message, 
            fileType: file.type,
            organizationId 
          });
          reject(error);
        },
        async () => {
          // Upload completed successfully
          try {
            // Get the download URL
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Save file metadata to Firestore
            const fileData = {
              name: file.name,
              type: file.type,
              size: file.size,
              uploadDate: serverTimestamp(),
              storagePath: filePath,
              downloadUrl,
              organizationId,
              uploadedBy: userId,
              description: description || "",
              category: category || "General"
            };
            
            const docRef = await addDoc(collection(db, 'organizationMaterials'), fileData);
            
            // Track successful upload
            trackEvent('org_file_uploaded', { 
              fileType: file.type, 
              fileSize: file.size,
              organizationId
            });
            
            resolve({
              id: docRef.id,
              ...fileData,
              uploadDate: new Date(),
            } as OrganizationFileMetadata);
          } catch (err) {
            console.error('Error saving organization file metadata:', err);
            reject(err);
          }
        }
      );
    });
  } catch (error) {
    console.error('Organization upload initialization error:', error);
    throw error;
  }
};

// Get all files for an organization
export const getOrganizationFiles = async (organizationId: string): Promise<OrganizationFileMetadata[]> => {
  try {
    const filesQuery = query(
      collection(db, 'organizationMaterials'),
      where('organizationId', '==', organizationId)
    );
    
    const querySnapshot = await getDocs(filesQuery);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        type: data.type,
        size: data.size,
        uploadDate: data.uploadDate?.toDate() || new Date(),
        storagePath: data.storagePath,
        downloadUrl: data.downloadUrl,
        organizationId: data.organizationId,
        uploadedBy: data.uploadedBy,
        description: data.description || "",
        category: data.category || "General"
      } as OrganizationFileMetadata;
    });
  } catch (error) {
    console.error('Error getting organization files:', error);
    throw error;
  }
};

// Delete an organization file
export const deleteOrganizationFile = async (fileId: string, storagePath: string): Promise<boolean> => {
  try {
    // Delete from Storage
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    
    // Delete from Firestore
    await deleteDoc(doc(db, 'organizationMaterials', fileId));
    
    trackEvent('org_file_deleted', { fileId });
    
    return true;
  } catch (error) {
    console.error('Error deleting organization file:', error);
    trackEvent('org_file_delete_error', { error: (error as Error).message, fileId });
    throw error;
  }
};

// Get all files across all organizations (admin only)
export const getAllOrganizationFiles = async (): Promise<OrganizationFileMetadata[]> => {
  try {
    const filesQuery = query(
      collection(db, 'organizationMaterials')
    );
    
    const querySnapshot = await getDocs(filesQuery);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        type: data.type,
        size: data.size,
        uploadDate: data.uploadDate?.toDate() || new Date(),
        storagePath: data.storagePath,
        downloadUrl: data.downloadUrl,
        organizationId: data.organizationId,
        uploadedBy: data.uploadedBy,
        description: data.description || "",
        category: data.category || "General"
      } as OrganizationFileMetadata;
    });
  } catch (error) {
    console.error('Error getting all organization files:', error);
    throw error;
  }
};

// Upload profile image to Firebase Storage
export const uploadProfileImage = async (
  userId: string,
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Create a reference to the file in Firebase Storage
    const fileName = `profile_${Date.now()}.${imageFile.name.split('.').pop()}`;
    const filePath = `users/${userId}/profile/${fileName}`;
    const storageRef = ref(storage, filePath);

    // Upload the file
    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    // Return a promise that resolves when the upload is complete
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress if a callback is provided
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          }
        },
        (error) => {
          // Handle upload errors
          console.error('Profile image upload error:', error);
          trackEvent('profile_image_upload_error', { error: error.message });
          reject(error);
        },
        async () => {
          try {
            // Get the download URL
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Track successful upload
            trackEvent('profile_image_uploaded', { 
              fileSize: imageFile.size 
            });
            
            resolve(downloadUrl);
          } catch (err) {
            console.error('Error getting download URL:', err);
            reject(err);
          }
        }
      );
    });
  } catch (error) {
    console.error('Profile image upload initialization error:', error);
    throw error;
  }
};
