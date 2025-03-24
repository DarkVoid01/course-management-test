"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { getEnrollments } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plus, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Enrollment {
  id: string
  userId: string
  courseId: string
  userName: string
  userEmail: string
  courseTitle: string
  status: "active" | "completed" | "dropped"
  progress: number
  createdAt: string
  updatedAt: string
}

export default function EnrollmentsPage() {
  const { userData } = useAuth()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [isEditingEnrollment, setIsEditingEnrollment] = useState(false)

  useEffect(() => {
    async function fetchEnrollments() {
      try {
        setLoading(true)
        const fetchedEnrollments = await getEnrollments()
        setEnrollments(fetchedEnrollments)
        setFilteredEnrollments(fetchedEnrollments)
      } catch (error) {
        console.error("Error fetching enrollments:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userData?.role === "admin") {
      fetchEnrollments()
    }
  }, [userData])

  useEffect(() => {
    // Filter and sort enrollments
    let filtered = [...enrollments]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (enrollment) =>
          enrollment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          enrollment.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          enrollment.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((enrollment) => enrollment.status === statusFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else if (sortOrder === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      return 0
    })

    setFilteredEnrollments(filtered)
  }, [enrollments, searchQuery, statusFilter, sortOrder])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleEditEnrollment = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment)
    setIsEditingEnrollment(true)
  }

  const handleUpdateEnrollmentStatus = async (enrollmentId: string, newStatus: "active" | "completed" | "dropped") => {
    try {
      // Update enrollment status in Firestore
      await updateDoc(doc(db, "enrollments", enrollmentId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      })

      // Update local state
      setEnrollments(
        enrollments.map((enrollment) =>
          enrollment.id === enrollmentId ? { ...enrollment, status: newStatus } : enrollment,
        ),
      )

      setIsEditingEnrollment(false)
      setSelectedEnrollment(null)
    } catch (error) {
      console.error("Error updating enrollment status:", error)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  if (userData?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">You don't have permission to view this page.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Enrollments</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Enrollment
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="Search enrollments..."
            className="w-full"
            value={searchQuery}
            onChange={handleSearch}
          />
          <Button type="submit" size="icon" variant="ghost">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="dropped">Dropped</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Enrollment Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEnrollments.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell>
                  <div className="font-medium">{enrollment.userName}</div>
                  <div className="text-sm text-muted-foreground">{enrollment.userEmail}</div>
                </TableCell>
                <TableCell>{enrollment.courseTitle}</TableCell>
                <TableCell>{formatDate(enrollment.createdAt)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      enrollment.status === "active"
                        ? "default"
                        : enrollment.status === "completed"
                          ? "secondary"
                          : "destructive"
                    }
                    className={
                      enrollment.status === "active"
                        ? "bg-green-500 hover:bg-green-600"
                        : enrollment.status === "completed"
                          ? "bg-blue-500 hover:bg-blue-600"
                          : ""
                    }
                  >
                    {enrollment.status}
                  </Badge>
                </TableCell>
                <TableCell>{enrollment.progress}%</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEditEnrollment(enrollment)}>
                        Edit Enrollment
                      </DropdownMenuItem>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Delete Enrollment</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditingEnrollment} onOpenChange={setIsEditingEnrollment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Enrollment</DialogTitle>
            <DialogDescription>Update enrollment status and progress.</DialogDescription>
          </DialogHeader>
          {selectedEnrollment && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-medium">{selectedEnrollment.userName}</h3>
                <p className="text-sm text-muted-foreground">{selectedEnrollment.userEmail}</p>
                <p className="mt-2 text-sm">
                  Enrolled in: <span className="font-medium">{selectedEnrollment.courseTitle}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={selectedEnrollment.status}
                  onValueChange={(value: "active" | "completed" | "dropped") =>
                    setSelectedEnrollment({ ...selectedEnrollment, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="dropped">Dropped</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-progress">Progress (%)</Label>
                <Input
                  id="edit-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={selectedEnrollment.progress.toString()}
                  onChange={(e) =>
                    setSelectedEnrollment({
                      ...selectedEnrollment,
                      progress: Number.parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingEnrollment(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedEnrollment && handleUpdateEnrollmentStatus(selectedEnrollment.id, selectedEnrollment.status)
              }
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

