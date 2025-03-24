import { db } from "./firebase"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore"

// User functions
export async function getUser(userId: string) {
  const userDoc = await getDoc(doc(db, "users", userId))
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() }
  }
  return null
}

export async function getUsers(role?: string, limitCount = 50) {
  let usersQuery = query(collection(db, "users"), limit(limitCount))

  if (role) {
    usersQuery = query(collection(db, "users"), where("role", "==", role), limit(limitCount))
  }

  const usersSnapshot = await getDocs(usersQuery)
  return usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

// Course functions
export async function getCourse(courseId: string) {
  const courseDoc = await getDoc(doc(db, "courses", courseId))
  if (courseDoc.exists()) {
    return { id: courseDoc.id, ...courseDoc.data() }
  }
  return null
}

export async function getCourses(instructorId?: string, limitCount = 50) {
  let coursesQuery = query(collection(db, "courses"), limit(limitCount))

  if (instructorId) {
    coursesQuery = query(collection(db, "courses"), where("instructorId", "==", instructorId), limit(limitCount))
  }

  const coursesSnapshot = await getDocs(coursesQuery)
  return coursesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function createCourse(courseData: any) {
  const courseRef = await addDoc(collection(db, "courses"), {
    ...courseData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return courseRef.id
}

export async function updateCourse(courseId: string, courseData: any) {
  const courseRef = doc(db, "courses", courseId)
  await updateDoc(courseRef, {
    ...courseData,
    updatedAt: Timestamp.now(),
  })
  return courseId
}

export async function deleteCourse(courseId: string) {
  await deleteDoc(doc(db, "courses", courseId))
  return courseId
}

// Enrollment functions
export async function getEnrollment(enrollmentId: string) {
  const enrollmentDoc = await getDoc(doc(db, "enrollments", enrollmentId))
  if (enrollmentDoc.exists()) {
    return { id: enrollmentDoc.id, ...enrollmentDoc.data() }
  }
  return null
}

export async function getEnrollments(userId?: string, courseId?: string, limitCount = 50) {
  let enrollmentsQuery = query(collection(db, "enrollments"), limit(limitCount))

  if (userId && courseId) {
    enrollmentsQuery = query(
      collection(db, "enrollments"),
      where("userId", "==", userId),
      where("courseId", "==", courseId),
      limit(limitCount),
    )
  } else if (userId) {
    enrollmentsQuery = query(collection(db, "enrollments"), where("userId", "==", userId), limit(limitCount))
  } else if (courseId) {
    enrollmentsQuery = query(collection(db, "enrollments"), where("courseId", "==", courseId), limit(limitCount))
  }

  const enrollmentsSnapshot = await getDocs(enrollmentsQuery)
  return enrollmentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function createEnrollment(enrollmentData: any) {
  const enrollmentRef = await addDoc(collection(db, "enrollments"), {
    ...enrollmentData,
    status: "active",
    progress: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return enrollmentRef.id
}

export async function updateEnrollment(enrollmentId: string, enrollmentData: any) {
  const enrollmentRef = doc(db, "enrollments", enrollmentId)
  await updateDoc(enrollmentRef, {
    ...enrollmentData,
    updatedAt: Timestamp.now(),
  })
  return enrollmentId
}

// Content functions
export async function getContent(contentId: string) {
  const contentDoc = await getDoc(doc(db, "contents", contentId))
  if (contentDoc.exists()) {
    return { id: contentDoc.id, ...contentDoc.data() }
  }
  return null
}

export async function getCourseContents(courseId: string, limitCount = 100) {
  const contentsQuery = query(
    collection(db, "contents"),
    where("courseId", "==", courseId),
    orderBy("order", "asc"),
    limit(limitCount),
  )

  const contentsSnapshot = await getDocs(contentsQuery)
  return contentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function createContent(contentData: any) {
  const contentRef = await addDoc(collection(db, "contents"), {
    ...contentData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return contentRef.id
}

export async function updateContent(contentId: string, contentData: any) {
  const contentRef = doc(db, "contents", contentId)
  await updateDoc(contentRef, {
    ...contentData,
    updatedAt: Timestamp.now(),
  })
  return contentId
}

export async function deleteContent(contentId: string) {
  await deleteDoc(doc(db, "contents", contentId))
  return contentId
}

// Assessment functions
export async function getAssessment(assessmentId: string) {
  const assessmentDoc = await getDoc(doc(db, "assessments", assessmentId))
  if (assessmentDoc.exists()) {
    return { id: assessmentDoc.id, ...assessmentDoc.data() }
  }
  return null
}

export async function getCourseAssessments(courseId: string, limitCount = 50) {
  const assessmentsQuery = query(
    collection(db, "assessments"),
    where("courseId", "==", courseId),
    orderBy("dueDate", "asc"),
    limit(limitCount),
  )

  const assessmentsSnapshot = await getDocs(assessmentsQuery)
  return assessmentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function createAssessment(assessmentData: any) {
  const assessmentRef = await addDoc(collection(db, "assessments"), {
    ...assessmentData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return assessmentRef.id
}

export async function updateAssessment(assessmentId: string, assessmentData: any) {
  const assessmentRef = doc(db, "assessments", assessmentId)
  await updateDoc(assessmentRef, {
    ...assessmentData,
    updatedAt: Timestamp.now(),
  })
  return assessmentId
}

export async function deleteAssessment(assessmentId: string) {
  await deleteDoc(doc(db, "assessments", assessmentId))
  return assessmentId
}

// Submission functions
export async function getSubmission(submissionId: string) {
  const submissionDoc = await getDoc(doc(db, "submissions", submissionId))
  if (submissionDoc.exists()) {
    return { id: submissionDoc.id, ...submissionDoc.data() }
  }
  return null
}

export async function getUserSubmissions(userId: string, assessmentId?: string, limitCount = 50) {
  let submissionsQuery = query(
    collection(db, "submissions"),
    where("userId", "==", userId),
    orderBy("submittedAt", "desc"),
    limit(limitCount),
  )

  if (assessmentId) {
    submissionsQuery = query(
      collection(db, "submissions"),
      where("userId", "==", userId),
      where("assessmentId", "==", assessmentId),
      limit(limitCount),
    )
  }

  const submissionsSnapshot = await getDocs(submissionsQuery)
  return submissionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function getAssessmentSubmissions(assessmentId: string, limitCount = 50) {
  const submissionsQuery = query(
    collection(db, "submissions"),
    where("assessmentId", "==", assessmentId),
    orderBy("submittedAt", "desc"),
    limit(limitCount),
  )

  const submissionsSnapshot = await getDocs(submissionsQuery)
  return submissionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function createSubmission(submissionData: any) {
  const submissionRef = await addDoc(collection(db, "submissions"), {
    ...submissionData,
    status: "submitted",
    submittedAt: Timestamp.now(),
  })
  return submissionRef.id
}

export async function gradeSubmission(submissionId: string, grade: number, feedback?: string) {
  const submissionRef = doc(db, "submissions", submissionId)
  await updateDoc(submissionRef, {
    grade,
    feedback,
    status: "graded",
    gradedAt: Timestamp.now(),
  })
  return submissionId
}

// Announcement functions
export async function getAnnouncement(announcementId: string) {
  const announcementDoc = await getDoc(doc(db, "announcements", announcementId))
  if (announcementDoc.exists()) {
    return { id: announcementDoc.id, ...announcementDoc.data() }
  }
  return null
}

export async function getCourseAnnouncements(courseId: string, limitCount = 20) {
  const announcementsQuery = query(
    collection(db, "announcements"),
    where("courseId", "==", courseId),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  )

  const announcementsSnapshot = await getDocs(announcementsQuery)
  return announcementsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function createAnnouncement(announcementData: any) {
  const announcementRef = await addDoc(collection(db, "announcements"), {
    ...announcementData,
    createdAt: Timestamp.now(),
  })
  return announcementRef.id
}

export async function updateAnnouncement(announcementId: string, announcementData: any) {
  const announcementRef = doc(db, "announcements", announcementId)
  await updateDoc(announcementRef, {
    ...announcementData,
    updatedAt: Timestamp.now(),
  })
  return announcementId
}

export async function deleteAnnouncement(announcementId: string) {
  await deleteDoc(doc(db, "announcements", announcementId))
  return announcementId
}

// Message functions
export async function getMessage(messageId: string) {
  const messageDoc = await getDoc(doc(db, "messages", messageId))
  if (messageDoc.exists()) {
    return { id: messageDoc.id, ...messageDoc.data() }
  }
  return null
}

export async function getUserMessages(userId: string, limitCount = 50) {
  const messagesQuery = query(
    collection(db, "messages"),
    where("participants", "array-contains", userId),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  )

  const messagesSnapshot = await getDocs(messagesQuery)
  return messagesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function sendMessage(messageData: any) {
  const messageRef = await addDoc(collection(db, "messages"), {
    ...messageData,
    createdAt: Timestamp.now(),
    read: false,
  })
  return messageRef.id
}

export async function markMessageAsRead(messageId: string) {
  const messageRef = doc(db, "messages", messageId)
  await updateDoc(messageRef, {
    read: true,
    readAt: Timestamp.now(),
  })
  return messageId
}

