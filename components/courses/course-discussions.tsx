"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Send, ThumbsUp } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, addDoc, getDocs, Timestamp, onSnapshot } from "firebase/firestore"

interface Discussion {
  id: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  message: string
  date: string
  likes: number
  replies?: Reply[]
}

interface Reply {
  id: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  message: string
  date: string
  likes: number
}

interface CourseDiscussionsProps {
  courseId: string
}

export function CourseDiscussions({ courseId }: CourseDiscussionsProps) {
  const { userData } = useAuth()
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [replyMessage, setReplyMessage] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!courseId) return

    setLoading(true)

    // Set up real-time listener for discussions
    const discussionsQuery = query(
      collection(db, "discussions"),
      where("courseId", "==", courseId),
      orderBy("createdAt", "desc"),
    )

    const unsubscribe = onSnapshot(discussionsQuery, async (snapshot) => {
      const discussionsData: Discussion[] = []

      for (const doc of snapshot.docs) {
        const discussion = doc.data()

        // Fetch replies for each discussion
        const repliesQuery = query(collection(db, "discussions", doc.id, "replies"), orderBy("createdAt", "asc"))

        const repliesSnapshot = await getDocs(repliesQuery)
        const replies = repliesSnapshot.docs.map((replyDoc) => ({
          id: replyDoc.id,
          ...replyDoc.data(),
          date: formatDate(replyDoc.data().createdAt.toDate()),
        })) as Reply[]

        discussionsData.push({
          id: doc.id,
          ...discussion,
          date: formatDate(discussion.createdAt.toDate()),
          replies,
        })
      }

      setDiscussions(discussionsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [courseId])

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return "Today"
    } else if (diffInDays === 1) {
      return "Yesterday"
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const handleSubmit = async () => {
    if (!userData || !message.trim()) return

    setSubmitting(true)

    try {
      await addDoc(collection(db, "discussions"), {
        courseId,
        author: {
          id: userData.uid,
          name: userData.displayName,
          avatar: userData.photoURL,
        },
        message: message.trim(),
        createdAt: Timestamp.now(),
        likes: 0,
      })

      setMessage("")
    } catch (error) {
      console.error("Error posting discussion:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async () => {
    if (!userData || !replyMessage.trim() || !replyingTo) return

    setSubmitting(true)

    try {
      await addDoc(collection(db, "discussions", replyingTo, "replies"), {
        author: {
          id: userData.uid,
          name: userData.displayName,
          avatar: userData.photoURL,
        },
        message: replyMessage.trim(),
        createdAt: Timestamp.now(),
        likes: 0,
      })

      setReplyMessage("")
      setReplyingTo(null)
    } catch (error) {
      console.error("Error posting reply:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Discussion Forum</CardTitle>
        </CardHeader>
        <CardContent>
          {discussions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-lg font-medium">No discussions yet</p>
              <p className="text-muted-foreground">Be the first to start a discussion!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <div key={discussion.id} className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage
                        src={discussion.author.avatar || "/placeholder.svg?height=32&width=32"}
                        alt={discussion.author.name}
                      />
                      <AvatarFallback>{discussion.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{discussion.author.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">{discussion.date}</span>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm">{discussion.message}</p>

                      {replyingTo !== discussion.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-auto py-1 text-xs"
                          onClick={() => setReplyingTo(discussion.id)}
                        >
                          Reply
                        </Button>
                      )}

                      {replyingTo === discussion.id && (
                        <div className="mt-2 space-y-2">
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            className="min-h-[80px]"
                          />
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleReply} disabled={submitting || !replyMessage.trim()}>
                              {submitting ? "Posting..." : "Post Reply"}
                            </Button>
                          </div>
                        </div>
                      )}

                      {discussion.replies && discussion.replies.length > 0 && (
                        <div className="mt-4 space-y-4 pl-8">
                          {discussion.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-4">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={reply.author.avatar || "/placeholder.svg?height=32&width=32"}
                                  alt={reply.author.name}
                                />
                                <AvatarFallback>{reply.author.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-medium">{reply.author.name}</span>
                                    <span className="ml-2 text-xs text-muted-foreground">{reply.date}</span>
                                  </div>
                                  <Button variant="ghost" size="icon">
                                    <ThumbsUp className="h-4 w-4" />
                                  </Button>
                                </div>
                                <p className="text-sm">{reply.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {discussion !== discussions[discussions.length - 1] && <div className="my-4 border-t" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-center gap-2">
            <Textarea
              placeholder="Write a message..."
              className="min-h-[80px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!userData}
            />
            <Button
              size="icon"
              className="h-[80px]"
              onClick={handleSubmit}
              disabled={submitting || !message.trim() || !userData}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

