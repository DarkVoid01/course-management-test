"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, GraduationCap, BarChart } from "lucide-react"

export default function DashboardPage() {
  const { userData } = useAuth()
  const role = userData?.role || "student"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Welcome, {userData?.displayName || "User"}</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title="Total Courses"
              value={role === "student" ? "5" : "12"}
              description={role === "student" ? "Enrolled courses" : "Created courses"}
              icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
            />
            <DashboardCard
              title={role === "admin" ? "Total Users" : role === "instructor" ? "Total Students" : "Completed Courses"}
              value={role === "admin" ? "245" : role === "instructor" ? "87" : "2"}
              description={role === "student" ? "40% completion rate" : "+12 from last month"}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <DashboardCard
              title={role === "student" ? "Assignments" : "Enrollments"}
              value={role === "student" ? "8" : "156"}
              description={role === "student" ? "3 pending" : "+8% from last month"}
              icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
            />
            <DashboardCard
              title={role === "student" ? "Average Grade" : "Completion Rate"}
              value={role === "student" ? "85%" : "72%"}
              description={role === "student" ? "Across all courses" : "+5% from last month"}
              icon={<BarChart className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your activity from the past 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Activity chart will be displayed here
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>
                  {role === "student"
                    ? "Upcoming Assignments"
                    : role === "instructor"
                      ? "Recent Submissions"
                      : "Recent Users"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {role === "student"
                            ? `Assignment ${i}: Web Development Basics`
                            : role === "instructor"
                              ? `John Doe submitted Assignment ${i}`
                              : `New user registered: User ${i}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {role === "student"
                            ? `Due in ${i} day${i > 1 ? "s" : ""}`
                            : `${i} hour${i > 1 ? "s" : ""} ago`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface DashboardCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
}

function DashboardCard({ title, value, description, icon }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

