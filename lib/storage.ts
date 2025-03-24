import { storage } from "./firebase"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

// Upload a file to Firebase Storage
export async function uploadFile(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(storageRef)
  return downloadURL
}

// Upload course material
export async function uploadCourseMaterial(courseId: string, file: File, fileName?: string): Promise<string> {
  const fileExtension = file.name.split(".").pop()
  const safeFileName = fileName
    ? `${fileName.replace(/[^a-z0-9]/gi, "_")}.${fileExtension}`
    : file.name.replace(/[^a-z0-9.]/gi, "_")

  const path = `courses/${courseId}/materials/${safeFileName}`
  return uploadFile(file, path)
}

// Upload assignment submission
export async function uploadSubmission(
  courseId: string,
  assessmentId: string,
  userId: string,
  file: File,
): Promise<string> {
  const fileExtension = file.name.split(".").pop()
  const safeFileName = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, "_")}`

  const path = `courses/${courseId}/assessments/${assessmentId}/submissions/${userId}/${safeFileName}`
  return uploadFile(file, path)
}

// Upload user profile image
export async function uploadProfileImage(userId: string, file: File): Promise<string> {
  const fileExtension = file.name.split(".").pop()
  const path = `users/${userId}/profile.${fileExtension}`
  return uploadFile(file, path)
}

// Delete a file from Firebase Storage
export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path)
  await deleteObject(storageRef)
}

