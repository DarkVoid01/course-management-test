"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, Clock, FileText, Plus, Upload } from "lucide-react"
import { getCourseAssessments, createAssessment, getSubmission, createSubmission } from "@/lib/db"
import { uploadSubmission } from "@/lib/storage"
import { useAuth } from "@/lib/auth-provider"

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  estimatedTime: string
  points: number
  status: "completed" | "pending" | "overdue"
  submission?: {
    id: string
    status: string
    grade?: number
    feedback?: string
  }
}

interface CourseAssignmentsProps {
  courseId: string
  isEnrolled: boolean
  canManage: boolean
}

export function CourseAssignments({ courseId, isEnrolled, canManage }: CourseAssignmentsProps) {
  const { userData } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingAssignment, setIsAddingAssignment] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null)
  const [submissionFile, setSubmissionFile] = useState<File | null>(null)
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    dueDate: "",
    estimatedTime: "",
    points: 100,
  })

  useEffect(() => {
    async function fetchAssignments() {
      try {
        setLoading(true)
        const assessments = await getCourseAssessments(courseId)

        // If user is enrolled, fetch their submissions
        if (userData && isEnrolled) {
          const assignmentsWithStatus = await Promise.all(
            assessments.map(async (assessment) => {
              // Check if user has submitted this assignment
              const submission = await getSubmission(assessment.id)

              // Determine status based on submission and due date
              let status: "completed" | "pending" | "overdue" = "pending"
              if (submission) {
                status = "completed"
              } else if (new Date(assessment.dueDate) < new Date()) {
                status = "overdue"
              }

              return {
                ...assessment,
                status,
                submission,
              }
            }),
          )

          setAssignments(assignmentsWithStatus)
        } else {
          // For instructors or non-enrolled users, just show the assignments
          setAssignments(
            assessments.map((assessment) => ({
              ...assessment,
              status: "pending",
            })),
          )
        }
      } catch (error) {
        console.error("Error fetching assignments:", error)
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchAssignments()
    }
  }, [courseId, userData, isEnrolled])

  const handleAddAssignment = async () => {
    if (!courseId) return

    setIsSubmitting(true)

    try {
      // Create assessment in the database
      const assessmentId = await createAssessment({
        courseId,
        title: newAssignment.title,
        description: newAssignment.description,
        dueDate: new Date(newAssignment.dueDate).toISOString(),
        estimatedTime: newAssignment.estimatedTime,
        points: Number(newAssignment.points),
        type: "assignment",
      })

      // Update local state
      setAssignments([
        ...assignments,
        {
          id: assessmentId,
          ...newAssignment,
          status: "pending",
        },
      ])

      // Reset form
      setNewAssignment({
        title: "",
        description: "",
        dueDate: "",
        estimatedTime: "",
        points: 100,
      })
      setIsAddingAssignment(false)
    } catch (error) {
      console.error("Error adding assignment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitAssignment = async () => {
    if (!courseId || !selectedAssignment || !submissionFile || !userData) return

    setIsSubmitting(true)

    try {
      // Upload submission file
      const fileUrl = await uploadSubmission(courseId, selectedAssignment, userData.uid, submissionFile)

      // Create submission record
      const submissionId = await createSubmission({
        userId: userData.uid,
        courseId,
        assessmentId: selectedAssignment,
        fileUrl,
        fileName: submissionFile.name,
      })

      // Update local state
      setAssignments(
        assignments.map((assignment) => {
          if (assignment.id === selectedAssignment) {
            return {
              ...assignment,
              status: "completed",
              submission: {
                id: submissionId,
                status: "submitted",
              },
            }
          }
          return assignment
        }),
      )

      // Reset form
      setSelectedAssignment(null)
      setSubmissionFile(null)
    } catch (error) {
      console.error("Error submitting assignment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionFile(e.target.files[0])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        {canManage ? (
          <>
            <p className="mb-4 text-lg font-medium">No assignments have been added to this course yet</p>
            <Dialog open={isAddingAssignment} onOpenChange={setIsAddingAssignment}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Add New Assignment</DialogTitle>
                  <DialogDescription>Create a new assignment for students to complete.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignment-title">Assignment Title</Label>
                    <Input
                      id="assignment-title"
                      placeholder="e.g., HTML Portfolio Page"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignment-description">Description</Label>
                    <Textarea
                      id="assignment-description"
                      placeholder="Describe what students need to do"
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="due-date">Due Date</Label>
                      <Input
                        id="due-date"
                        type="date"
                        value={newAssignment.dueDate}
                        onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estimated-time">Estimated Time</Label>
                      <Input
                        id="estimated-time"
                        placeholder="e.g., 2 hours"
                        value={newAssignment.estimatedTime}
                        onChange={(e) => setNewAssignment({ ...newAssignment, estimatedTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      min="0"
                      value={newAssignment.points.toString()}
                      onChange={(e) =>
                        setNewAssignment({ ...newAssignment, points: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingAssignment(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddAssignment}
                    disabled={isSubmitting || !newAssignment.title || !newAssignment.dueDate}
                  >
                    {isSubmitting ? "Adding..." : "Add Assignment"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <p className="text-lg font-medium">No assignments available for this course yet</p>
        )}
      </div>
    )
  }

  return (
    <div>
      {canManage && (
        <div className="mb-6 flex justify-end">
          <Dialog open={isAddingAssignment} onOpenChange={setIsAddingAssignment}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New Assignment</DialogTitle>
                <DialogDescription>Create a new assignment for students to complete.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="assignment-title">Assignment Title</Label>
                  <Input
                    id="assignment-title"
                    placeholder="e.g., HTML Portfolio Page"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignment-description">Description</Label>
                  <Textarea
                    id="assignment-description"
                    placeholder="Describe what students need to do"
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimated-time">Estimated Time</Label>
                    <Input
                      id="estimated-time"
                      placeholder="e.g., 2 hours"
                      value={newAssignment.estimatedTime}
                      onChange={(e) => setNewAssignment({ ...newAssignment, estimatedTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="0"
                    value={newAssignment.points.toString()}
                    onChange={(e) =>
                      setNewAssignment({ ...newAssignment, points: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingAssignment(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddAssignment}
                  disabled={isSubmitting || !newAssignment.title || !newAssignment.dueDate}
                >
                  {isSubmitting ? "Adding..." : "Add Assignment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>{assignment.title}</CardTitle>
                <CardDescription>Due {assignment.dueDate}</CardDescription>
              </div>
              <Badge
                variant={
                  assignment.status === "completed"
                    ? "default"
                    : assignment.status === "pending"
                      ? "secondary"
                      : "destructive"
                }
              >
                {assignment.status === "completed"
                  ? "Completed"
                  : assignment.status === "pending"
                    ? "Pending"
                    : "Overdue"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm">{assignment.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {assignment.estimatedTime}
                  </div>
                  <div className="flex items-center">
                    <CalendarDays className="mr-1 h-4 w-4" />
                    {assignment.points} points
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                View Details
              </Button>

              {isEnrolled && assignment.status !== "completed" ? (
                <Dialog
                  open={selectedAssignment === assignment.id}
                  onOpenChange={(open) => setSelectedAssignment(open ? assignment.id : null)}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="mr-2 h-4 w-4" />
                      Submit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Assignment</DialogTitle>
                      <DialogDescription>Upload your completed assignment for {assignment.title}.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="submission-file">Upload File</Label>
                        <Input id="submission-file" type="file" onChange={handleFileChange} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmitAssignment} disabled={isSubmitting || !submissionFile}>
                        {isSubmitting ? "Submitting..." : "Submit Assignment"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button disabled={assignment.status === "completed"}>
                  {assignment.status === "completed" ? "Submitted" : "View Submission"}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

