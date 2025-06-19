'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Course = {
  course: string
  day: string
  time: string
  unit: number | string  // Changed to handle both string input and number
}

export default function ProfilePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [user, setUser] = useState<any>(null)
  const [courses, setCourses] = useState<Course[]>([
    { course: '', day: '', time: '', unit: '' }
  ])

  useEffect(() => {
    const storedEmail = localStorage.getItem('studentEmail')
    if (storedEmail) {
      setEmail(storedEmail)
      fetch(`http://localhost:5001/student?email=${storedEmail}`)
        .then(res => res.json())
        .then(data => {
          setUser(data)
          if (data.events) {
            setCourses(data.events.map((event: any) => ({
              ...event,
              unit: event.unit || ''  // Handle missing unit field
            })))
          }
        })
    }
  }, [])

  const handleGenerate = async () => {
    // Validate courses first
    const hasEmptyFields = courses.some(c => !c.course || !c.day || !c.time)
    if (hasEmptyFields) {
      alert('Please fill in all course details')
      return
    }

    // Format days and convert unit to number
    const formattedCourses = courses.map(course => ({
      ...course,
      day: course.day.charAt(0).toUpperCase() + course.day.slice(1).toLowerCase(),
      unit: Number(course.unit) || 0  // Convert to number, default to 0 if empty
    }))

    const res = await fetch('http://localhost:5001/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email, 
        events: formattedCourses 
      }),
    })

    if (res.ok) {
      localStorage.setItem('timetableData', JSON.stringify(formattedCourses))
      router.push('/overview')
    } else {
      alert('Failed to save timetable.')
    }
  }

  return (
    <div className="min-h-screen bg-white p-6 pt-24">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-4 text-center">🎓 Your Profile</h1>

        {/* User Info */}
        {user && (
          <div className="mb-6 text-lg text-gray-700 space-y-1">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Level:</strong> {user.level}</p>
            <p><strong>Target CGPA:</strong> {user.target_cgpa}</p>
            {user.current_cgpa && <p><strong>Current CGPA:</strong> {user.current_cgpa}</p>}
          </div>
        )}

        {/* Add Course Section */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Add courses to build your schedule 🚀</span>
          <button
            onClick={() =>
              setCourses([...courses, { course: '', day: '', time: '', unit: '' }])
            }
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add Course
          </button>
        </div>

        {/* Courses Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-300 rounded-md">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="px-4 py-2">Course</th>
                <th className="px-4 py-2">Day</th>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Units</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={c.course}
                      onChange={(e) => {
                        const updated = [...courses]
                        updated[index].course = e.target.value
                        setCourses(updated)
                      }}
                      className="w-full border px-2 py-1 rounded"
                      placeholder="Course Name"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={c.day}
                      onChange={(e) => {
                        const updated = [...courses]
                        updated[index].day = e.target.value
                        setCourses(updated)
                      }}
                      className="w-full border px-2 py-1 rounded"
                      placeholder="e.g. Monday"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={c.time}
                      onChange={(e) => {
                        const updated = [...courses]
                        updated[index].time = e.target.value
                        setCourses(updated)
                      }}
                      className="w-full border px-2 py-1 rounded"
                      placeholder="e.g. 9:00 AM"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={c.unit}
                      onChange={(e) => {
                        const updated = [...courses]
                        updated[index].unit = e.target.value
                        setCourses(updated)
                      }}
                      className="w-full border px-2 py-1 rounded"
                      placeholder="e.g. 3"
                      min="0"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Generate Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleGenerate}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            Generate Timetable
          </button>
        </div>
      </div>
    </div>
  )
}