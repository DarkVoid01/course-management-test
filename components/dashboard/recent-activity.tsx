import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.avatar} alt="Avatar" />
            <AvatarFallback>{activity.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.name}</p>
            <p className="text-sm text-muted-foreground">{activity.action}</p>
          </div>
          <div className="ml-auto text-xs text-muted-foreground">{activity.time}</div>
        </div>
      ))}
    </div>
  )
}

const activities = [
  {
    name: "John Doe",
    action: "Enrolled in 'Introduction to Web Development'",
    time: "2 hours ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "JD",
  },
  {
    name: "Sarah Johnson",
    action: "Completed 'Advanced JavaScript' course",
    time: "5 hours ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "SJ",
  },
  {
    name: "Michael Brown",
    action: "Submitted assignment for 'Database Design'",
    time: "1 day ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "MB",
  },
  {
    name: "Emily Wilson",
    action: "Created a new course 'UI/UX Fundamentals'",
    time: "2 days ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "EW",
  },
  {
    name: "David Lee",
    action: "Posted an announcement in 'Mobile App Development'",
    time: "3 days ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "DL",
  },
]

