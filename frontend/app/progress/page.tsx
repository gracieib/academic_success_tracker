'use client'

import { useEffect, useState } from 'react'

type CoursePlan = {
  course: string
  unit: number
  targetGrade: string
}

const gradePointMap: Record<string, number> = {
  'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0
}

export default function CGPAPlanner() {
  const [email, setEmail] = useState('')
  const [courses, setCourses] = useState<CoursePlan[]>([])
  const [currentCGPA, setCurrentCGPA] = useState<number | ''>('')
  const [completedUnits, setCompletedUnits] = useState<number | ''>('')
  const [targetCGPA, setTargetCGPA] = useState<number | ''>('')
  const [requiredInfo, setRequiredInfo] = useState({ averageGrade: '', pointsNeeded: 0 })

  useEffect(() => {
    const storedEmail = localStorage.getItem('studentEmail')
    setEmail(storedEmail || '')
    if (!storedEmail) return

    fetch(`http://localhost:5001/student?email=${storedEmail}`)
      .then(res => res.json())
      .then(data => {
        if (data.events) {
          const formatted = data.events.map((e: any) => ({
            course: e.course,
            unit: e.unit || 0,
            targetGrade: 'A'
          }))
          setCourses(formatted)
        }
        if (data.current_cgpa) setCurrentCGPA(Number(data.current_cgpa))
        if (data.target_cgpa) setTargetCGPA(Number(data.target_cgpa))
      })
  }, [])

  const calculateInsights = () => {
    if (
      !currentCGPA || !completedUnits || !targetCGPA ||
      !courses.length || courses.some(c => !c.unit || !gradePointMap[c.targetGrade])
    ) {
      alert('Please fill all fields properly.')
      return
    }

    const totalCompletedPoints = currentCGPA * completedUnits
    const targetTotalPoints = targetCGPA * (completedUnits + courses.reduce((acc, c) => acc + c.unit, 0))
    const requiredSemesterPoints = targetTotalPoints - totalCompletedPoints
    const totalNewUnits = courses.reduce((acc, c) => acc + c.unit, 0)
    const requiredAvgPoint = requiredSemesterPoints / totalNewUnits

    let avgGrade = 'F'
    if (requiredAvgPoint >= 4.5) avgGrade = 'A'
    else if (requiredAvgPoint >= 3.5) avgGrade = 'B'
    else if (requiredAvgPoint >= 2.5) avgGrade = 'C'
    else if (requiredAvgPoint >= 1.5) avgGrade = 'D'
    else if (requiredAvgPoint >= 1) avgGrade = 'E'

    setRequiredInfo({
      averageGrade: avgGrade,
      pointsNeeded: Math.ceil(requiredSemesterPoints)
    })
  }

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto pt-24">
      <h1 className="text-2xl font-bold mb-6">🎯 CGPA Planner</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Current CGPA */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">📍 Current CGPA</label>
          <input
            type="number"
            value={currentCGPA}
            onChange={e => setCurrentCGPA(Number(e.target.value))}
            className="border rounded px-3 py-2"
            placeholder="e.g. 3.2"
          />
        </div>

        {/* Completed Units */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">📦 Completed Units</label>
          <input
            type="number"
            value={completedUnits}
            onChange={e => setCompletedUnits(Number(e.target.value))}
            className="border rounded px-3 py-2"
            placeholder="e.g. 56"
          />
        </div>

        {/* Target CGPA */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">🎯 Target CGPA</label>
          <input
            type="number"
            value={targetCGPA}
            onChange={e => setTargetCGPA(Number(e.target.value))}
            className="border rounded px-3 py-2"
            placeholder="e.g. 4.5"
          />
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-2">📚 Your Current Semester Courses</h2>
      <div className="overflow-x-auto mb-4">
        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Course Name</th>
              <th className="p-2">Units</th>
              <th className="p-2">Target Grade</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, i) => (
              <tr key={i} className="text-center border-t">
                <td className="p-2">{course.course}</td>
                <td className="p-2">
                  <input
                    type="number"
                    value={course.unit}
                    onChange={(e) => {
                      const updated = [...courses]
                      updated[i].unit = Number(e.target.value)
                      setCourses(updated)
                    }}
                    className="w-16 border rounded px-2 py-1"
                  />
                </td>
                <td className="p-2">
                  <select
                    value={course.targetGrade}
                    onChange={(e) => {
                      const updated = [...courses]
                      updated[i].targetGrade = e.target.value
                      setCourses(updated)
                    }}
                    className="border rounded px-2 py-1"
                  >
                    {['A', 'B', 'C', 'D', 'E', 'F'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4">
        <button
          onClick={calculateInsights}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ⚙️ Recalculate
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          💾 Save Plan
        </button>
      </div>

      <div className="mt-6 bg-gray-100 p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">🧮 Insights</h3>
        <ul className="list-disc pl-5">
          <li>Required Avg Grade This Semester: <strong>{requiredInfo.averageGrade}</strong></li>
          <li>You need <strong>{requiredInfo.pointsNeeded}</strong> more grade points to reach your CGPA goal.</li>
        </ul>
      </div>
    </div>
  )
}
