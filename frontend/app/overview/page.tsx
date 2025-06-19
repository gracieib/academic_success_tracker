'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Course = {
  course: string
  day: string
  time: string
}

export default function OverviewPage() {
  const [timetable, setTimetable] = useState<Record<string, Course[]>>({})
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  useEffect(() => {
    // Get data from localStorage
    const storedData = localStorage.getItem('timetableData')
    if (storedData) {
      const courses: Course[] = JSON.parse(storedData)
      
      // Organize by day
      const organized: Record<string, Course[]> = {}
      days.forEach(day => {
        organized[day] = courses
          .filter(c => c.day.toLowerCase() === day.toLowerCase())
          .sort((a, b) => a.time.localeCompare(b.time))
      })
      
      setTimetable(organized)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">📅 Your Weekly Timetable</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {days.map(day => (
            <div key={day} className="border rounded-lg p-3">
              <h2 className="font-semibold text-lg mb-3 text-center">{day}</h2>
              
              {timetable[day]?.length ? (
                <ul className="space-y-2">
                  {timetable[day].map((course, i) => (
                    <li key={i} className="bg-blue-50 p-2 rounded">
                      <p className="font-medium">{course.course}</p>
                      <p className="text-sm text-gray-600">{course.time}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4">No classes</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link 
            href="/profile" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
          >
            Edit Timetable
          </Link>
        </div>
      </div>
    </div>
  )
}