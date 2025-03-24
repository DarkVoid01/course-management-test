"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  FileText,
  Home,
  MessageSquare,
  Settings,
  Users,
  GraduationCap,
  BarChart,
  ClipboardList,
  Bell,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-provider"

interface DashboardSidebarProps {
  className?: string
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { userData, signOut } = useAuth()
  const role = userData?.role || "student"

  // Define navigation items based on user role
  const navItems = getNavItems(role)

  return (
    <div
      className={cn(
        "group flex h-screen w-[70px] flex-col justify-between border-r bg-background p-2 transition-all duration-300 hover:w-[240px] md:w-[240px]",
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex h-[60px] items-center justify-center rounded-md bg-primary px-2">
          <BookOpen className="h-6 w-6 text-primary-foreground" />
          <span className="ml-2 hidden text-lg font-bold text-primary-foreground group-hover:inline-block md:inline-block">
            CourseHub
          </span>
        </div>
        <ScrollArea className="flex-1">
          <nav className="grid gap-1 px-2">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href && "bg-accent text-accent-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="hidden group-hover:inline-block md:inline-block">{item.title}</span>
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </div>
      <div className="mt-auto flex flex-col gap-4 px-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 px-3">
              <Avatar className="h-5 w-5">
                <AvatarImage
                  src={userData?.photoURL || "/placeholder.svg?height=32&width=32"}
                  alt={userData?.displayName || "User"}
                />
                <AvatarFallback>{userData?.displayName?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <span className="hidden group-hover:inline-block md:inline-block">
                {userData?.displayName || "User Profile"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/dashboard/profile" className="flex w-full">
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/dashboard/settings" className="flex w-full">
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function getNavItems(role: string) {
  const baseItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
  ]

  const adminItems = [
    ...baseItems,
    {
      title: "Users",
      href: "/dashboard/users",
      icon: Users,
    },
    {
      title: "Courses",
      href: "/dashboard/courses",
      icon: BookOpen,
    },
    {
      title: "Enrollments",
      href: "/dashboard/enrollments",
      icon: GraduationCap,
    },
    {
      title: "Content",
      href: "/dashboard/content",
      icon: FileText,
    },
    {
      title: "Assessments",
      href: "/dashboard/assessments",
      icon: ClipboardList,
    },
    {
      title: "Communications",
      href: "/dashboard/communications",
      icon: MessageSquare,
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: BarChart,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  const instructorItems = [
    ...baseItems,
    {
      title: "My Courses",
      href: "/dashboard/courses",
      icon: BookOpen,
    },
    {
      title: "Students",
      href: "/dashboard/students",
      icon: Users,
    },
    {
      title: "Course Content",
      href: "/dashboard/content",
      icon: FileText,
    },
    {
      title: "Assessments",
      href: "/dashboard/assessments",
      icon: ClipboardList,
    },
    {
      title: "Announcements",
      href: "/dashboard/announcements",
      icon: Bell,
    },
    {
      title: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: BarChart,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  const studentItems = [
    ...baseItems,
    {
      title: "My Courses",
      href: "/dashboard/courses",
      icon: BookOpen,
    },
    {
      title: "Course Catalog",
      href: "/dashboard/catalog",
      icon: GraduationCap,
    },
    {
      title: "Assignments",
      href: "/dashboard/assignments",
      icon: ClipboardList,
    },
    {
      title: "Grades",
      href: "/dashboard/grades",
      icon: BarChart,
    },
    {
      title: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  switch (role) {
    case "admin":
      return adminItems
    case "instructor":
      return instructorItems
    case "student":
      return studentItems
    default:
      return baseItems
  }
}

