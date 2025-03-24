"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Jan",
    courses: 12,
    enrollments: 45,
  },
  {
    name: "Feb",
    courses: 14,
    enrollments: 52,
  },
  {
    name: "Mar",
    courses: 16,
    enrollments: 68,
  },
  {
    name: "Apr",
    courses: 18,
    enrollments: 82,
  },
  {
    name: "May",
    courses: 20,
    enrollments: 95,
  },
  {
    name: "Jun",
    courses: 22,
    enrollments: 110,
  },
  {
    name: "Jul",
    courses: 24,
    enrollments: 125,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Bar dataKey="courses" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
        <Bar dataKey="enrollments" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary/50" />
      </BarChart>
    </ResponsiveContainer>
  )
}

