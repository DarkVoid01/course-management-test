"use client"

import type React from "react"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, FileText, Lock, PlayCircle, Plus, Video } from "lucide-react"
import { createContent } from "@/lib/db"
import { uploadCourseMaterial } from "@/lib/storage"

interface ContentItem {
  id: string
  title: string
  type: string
  duration: string
  description?: string
  url?: string
  order: number
  moduleId: string
  completed?: boolean
  locked?: boolean
}

interface Module {
  id: string
  title: string
  order: number
  contents: ContentItem[]
}

interface CourseContentProps {
  contents: ContentItem[]
  isEnrolled: boolean
  canManage: boolean
  courseId?: string
}

export function CourseContent({ contents = [], isEnrolled, canManage, courseId }: CourseContentProps) {
  const [modules, setModules] = useState<Module[]>(organizeContentIntoModules(contents))
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [isAddingContent, setIsAddingContent] = useState(false)
  const [isAddingModule, setIsAddingModule] = useState(false)
  const [newContent, setNewContent] = useState({
    title: "",
    type: "video",
    duration: "",
    description: "",
    file: null as File | null,
  })
  const [newModule, setNewModule] = useState({
    title: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Organize flat content list into modules
  function organizeContentIntoModules(contentList: ContentItem[]): Module[] {
    if (!contentList || contentList.length === 0) return []

    const moduleMap = new Map<string, Module>()

    // First pass: create modules
    contentList.forEach((content) => {
      if (!moduleMap.has(content.moduleId)) {
        moduleMap.set(content.moduleId, {
          id: content.moduleId,
          title: content.moduleId, // This would be replaced with actual module title
          order: 0, // This would be replaced with actual module order
          contents: [],
        })
      }
    })

    // Second pass: add contents to modules
    contentList.forEach((content) => {
      const module = moduleMap.get(content.moduleId)
      if (module) {
        module.contents.push(content)
      }
    })

    // Sort contents within each module
    moduleMap.forEach((module) => {
      module.contents.sort((a, b) => a.order - b.order)
    })

    // Convert map to array and sort modules
    return Array.from(moduleMap.values()).sort((a, b) => a.order - b.order)
  }

  const handleAddModule = async () => {
    if (!courseId || !newModule.title) return

    setIsSubmitting(true)

    try {
      // Create a new module in the database
      const moduleId = await createContent({
        courseId,
        title: newModule.title,
        type: "module",
        order: modules.length,
        createdAt: new Date().toISOString(),
      })

      // Update local state
      setModules([
        ...modules,
        {
          id: moduleId,
          title: newModule.title,
          order: modules.length,
          contents: [],
        },
      ])

      // Reset form
      setNewModule({ title: "" })
      setIsAddingModule(false)
    } catch (error) {
      console.error("Error adding module:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddContent = async () => {
    if (!courseId || !selectedModule || !newContent.title || !newContent.type) return

    setIsSubmitting(true)

    try {
      // Upload file if exists
      let contentUrl = ""
      if (newContent.file) {
        contentUrl = await uploadCourseMaterial(courseId, newContent.file)
      }

      // Get the module to add content to
      const module = modules.find((m) => m.id === selectedModule)
      if (!module) throw new Error("Module not found")

      // Create content in the database
      const contentId = await createContent({
        courseId,
        moduleId: selectedModule,
        title: newContent.title,
        type: newContent.type,
        duration: newContent.duration,
        description: newContent.description,
        url: contentUrl,
        order: module.contents.length,
        locked: false,
      })

      // Update local state
      const updatedModules = modules.map((m) => {
        if (m.id === selectedModule) {
          return {
            ...m,
            contents: [
              ...m.contents,
              {
                id: contentId,
                title: newContent.title,
                type: newContent.type,
                duration: newContent.duration,
                description: newContent.description,
                url: contentUrl,
                order: m.contents.length,
                moduleId: selectedModule,
                locked: false,
              },
            ],
          }
        }
        return m
      })

      setModules(updatedModules)

      // Reset form
      setNewContent({
        title: "",
        type: "video",
        duration: "",
        description: "",
        file: null,
      })
      setIsAddingContent(false)
    } catch (error) {
      console.error("Error adding content:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewContent((prev) => ({
        ...prev,
        file: e.target.files![0],
      }))
    }
  }

  // If there's no content yet
  if (modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        {canManage ? (
          <>
            <p className="mb-4 text-lg font-medium">No content has been added to this course yet</p>
            <Dialog open={isAddingModule} onOpenChange={setIsAddingModule}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Module
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Module</DialogTitle>
                  <DialogDescription>Create a new module to organize your course content.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="module-title">Module Title</Label>
                    <Input
                      id="module-title"
                      placeholder="e.g., Introduction to the Course"
                      value={newModule.title}
                      onChange={(e) => setNewModule({ title: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingModule(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddModule} disabled={isSubmitting || !newModule.title}>
                    {isSubmitting ? "Adding..." : "Add Module"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <p className="text-lg font-medium">No content available for this course yet</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="mb-4 flex justify-end space-x-2">
          <Dialog open={isAddingModule} onOpenChange={setIsAddingModule}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Module
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Module</DialogTitle>
                <DialogDescription>Create a new module to organize your course content.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="module-title">Module Title</Label>
                  <Input
                    id="module-title"
                    placeholder="e.g., Introduction to the Course"
                    value={newModule.title}
                    onChange={(e) => setNewModule({ title: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingModule(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddModule} disabled={isSubmitting || !newModule.title}>
                  {isSubmitting ? "Adding..." : "Add Module"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddingContent} onOpenChange={setIsAddingContent}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Content
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New Content</DialogTitle>
                <DialogDescription>Add a new lesson, reading, or quiz to your course.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="module">Module</Label>
                  <Select value={selectedModule || ""} onValueChange={setSelectedModule}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content-title">Content Title</Label>
                  <Input
                    id="content-title"
                    placeholder="e.g., Introduction to HTML"
                    value={newContent.title}
                    onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content-type">Content Type</Label>
                  <Select
                    value={newContent.type}
                    onValueChange={(value) => setNewContent({ ...newContent, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 15 min"
                    value={newContent.duration}
                    onChange={(e) => setNewContent({ ...newContent, duration: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of this content"
                    value={newContent.description}
                    onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Upload File (Optional)</Label>
                  <Input id="file" type="file" onChange={handleFileChange} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingContent(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddContent} disabled={isSubmitting || !newContent.title || !selectedModule}>
                  {isSubmitting ? "Adding..." : "Add Content"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        {modules.map((module, index) => (
          <AccordionItem key={module.id} value={module.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center">
                <span className="font-medium">
                  Module {index + 1}: {module.title}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({module.contents.length} {module.contents.length === 1 ? "lesson" : "lessons"})
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pl-6">
                {module.contents.map((content, contentIndex) => (
                  <div
                    key={content.id}
                    className="flex items-center justify-between rounded-md border p-3 hover:bg-accent"
                  >
                    <div className="flex items-center gap-3">
                      {getLessonIcon(content.type)}
                      <div>
                        <div className="font-medium">{content.title}</div>
                        <div className="text-xs text-muted-foreground">{content.duration}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {content.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : content.locked ? (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Button variant="ghost" size="sm">
                          {isEnrolled ? "Start" : canManage ? "Preview" : ""}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {canManage && module.contents.length === 0 && (
                  <div className="flex items-center justify-center py-4 text-center text-sm text-muted-foreground">
                    No content in this module yet. Click "Add Content" to add your first lesson.
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

function getLessonIcon(type: string) {
  switch (type) {
    case "video":
      return <Video className="h-5 w-5 text-primary" />
    case "reading":
      return <FileText className="h-5 w-5 text-primary" />
    case "quiz":
      return <PlayCircle className="h-5 w-5 text-primary" />
    case "assignment":
      return <FileText className="h-5 w-5 text-primary" />
    default:
      return <FileText className="h-5 w-5 text-primary" />
  }
}

