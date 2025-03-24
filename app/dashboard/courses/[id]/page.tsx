"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { getCourse, getCourseContents, getEnrollments, createEnrollment } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BookOpen, Download, FileText, MessageSquare, Users } from "lucide-react"
import Link from "next/link"
import { CourseContent } from "@/components/courses/course-content"
import { CourseDiscussions } from "@/components/courses/course-discussions"
import { CourseAssignments } from "@/components/courses/course-assignments"

export default function CoursePage({ params }: { params: { id: string } }) {
  const { userData } = useAuth()
  const [course, setCourse] = useState<any>(null)
  const [contents, setContents] = useState<any[]>([])
  const [enrollment, setEnrollment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    async function fetchCourseData() {
      try {
        setLoading(true)

        // Fetch course details
        const courseData = await getCourse(params.id)
        if (!courseData) {
          throw new Error("Course not found")
        }
        setCourse(courseData)

        // Fetch course contents
        const contentsData = await getCourseContents(params.id)
        setContents(contentsData)

        // Check if user is enrolled
        if (userData) {
          const enrollments = await getEnrollments(userData.uid, params.id)
          if (enrollments.length > 0) {
            setEnrollment(enrollments[0])
          }
        }
      } catch (error) {
        console.error("Error fetching course data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCourseData()
    }
  }, [params.id, userData])

  const handleEnroll = async () => {
    if (!userData) return

    try {
      setEnrolling(true)

      // Create enrollment record
      await createEnrollment({
        userId: userData.uid,
        courseId: params.id,
        userName: userData.displayName,
        userEmail: userData.email,
        courseTitle: course.title,
      })

      // Refresh enrollment data
      const enrollments = await getEnrollments(userData.uid, params.id)
      if (enrollments.length > 0) {
        setEnrollment(enrollments[0])
      }
    } catch (error) {
      console.error("Error enrolling in course:", error)
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <h2 className="text-2xl font-bold">Course not found</h2>
        <p className="text-muted-foreground">The course you're looking for doesn't exist or has been removed.</p>
        <Link href="/dashboard/courses" className="mt-4">
          <Button>Back to Courses</Button>
        </Link>
      </div>
    )
  }

  const isInstructor = userData?.role === "instructor" && course.instructor.id === userData.uid
  const isAdmin = userData?.role === "admin"
  const isEnrolled = !!enrollment
  const canManageCourse = isInstructor || isAdmin

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/courses">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">{course.title}</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="aspect-video w-full overflow-hidden rounded-lg border">
            <img
              src={course.image || "/placeholder.svg?height=300&width=600"}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Instructor:</span>
                <span className="text-sm">{course.instructor.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Category:</span>
                <Badge variant="outline">{course.category}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Level:</span>
                <span className="text-sm">{course.level}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Enrollments:</span>
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  <span className="text-sm">{course.enrollments}</span>
                </div>
              </div>

              {isEnrolled && enrollment.progress !== undefined && (
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{enrollment.progress}%</span>
                  </div>
                  <Progress value={enrollment.progress} className="mt-1" />
                </div>
              )}

              {canManageCourse ? (
                <Link href={`/dashboard/courses/${params.id}/edit`} className="w-full">
                  <Button className="w-full">Manage Course</Button>
                </Link>
              ) : isEnrolled ? (
                <Button className="w-full">Continue Learning</Button>
              ) : (
                <Button className="w-full" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Enrolling...
                    </>
                  ) : (
                    "Enroll in Course"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {(isEnrolled || canManageCourse) && (
            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Course Syllabus
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Download Materials
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>About This Course</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{course.description}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="content" className="mt-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">
            <BookOpen className="mr-2 h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <FileText className="mr-2 h-4 w-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="discussions">
            <MessageSquare className="mr-2 h-4 w-4" />
            Discussions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <CourseContent contents={contents} isEnrolled={isEnrolled} canManage={canManageCourse} />
        </TabsContent>

        <TabsContent value="assignments">
          <CourseAssignments courseId={params.id} isEnrolled={isEnrolled} canManage={canManageCourse} />
        </TabsContent>

        <TabsContent value="discussions">
          <CourseDiscussions courseId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

