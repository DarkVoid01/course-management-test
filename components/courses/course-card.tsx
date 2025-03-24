import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Users } from "lucide-react"
import Link from "next/link"
import type { UserRole } from "@/lib/auth-provider"

interface Course {
  id: string
  title: string
  description: string
  instructor: {
    id: string
    name: string
  }
  category: string
  enrollments: number
  image?: string
  progress?: number
}

interface CourseCardProps {
  course: Course
  userRole?: UserRole
}

export function CourseCard({ course, userRole = "student" }: CourseCardProps) {
  const isInstructor = userRole === "instructor"
  const isAdmin = userRole === "admin"
  const isStudent = userRole === "student"

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={course.image || "/placeholder.svg?height=200&width=300"}
          alt={course.title}
          className="h-full w-full object-cover transition-all hover:scale-105"
        />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline">{course.category}</Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="mr-1 h-4 w-4" />
            {course.enrollments}
          </div>
        </div>
        <CardTitle className="line-clamp-1">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">Instructor: {course.instructor.name}</div>
        {isStudent && course.progress !== undefined && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="mt-1" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href={`/dashboard/courses/${course.id}`} className="w-full">
          <Button className="w-full">
            {isInstructor || isAdmin
              ? "Manage Course"
              : isStudent && course.progress
                ? "Continue Learning"
                : "View Course"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

