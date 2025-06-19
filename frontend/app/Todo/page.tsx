'use client'

import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

type Task = {
  id: number
  date: string // e.g., "2025-06-20"
  text: string
  completed: boolean
}

export default function CalendarTodo() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [newTask, setNewTask] = useState('')

  // Load tasks from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('calendarTasks')
    if (stored) setTasks(JSON.parse(stored))
  }, [])

  // Save tasks on change
  useEffect(() => {
    localStorage.setItem('calendarTasks', JSON.stringify(tasks))
  }, [tasks])

  const handleAddTask = () => {
    if (!newTask.trim()) return
    const newEntry: Task = {
      id: Date.now(),
      date: selectedDate,
      text: newTask,
      completed: false
    }
    setTasks(prev => [...prev, newEntry])
    setNewTask('')
  }

  const toggleTask = (id: number) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const generateDays = () => {
    const today = dayjs()
    const start = today.startOf('month').startOf('week')
    const end = today.endOf('month').endOf('week')
    const days = []
    let day = start

    while (day.isBefore(end)) {
      days.push(day)
      day = day.add(1, 'day')
    }
    return days
  }

  return (
    <div className="min-h-screen w-full max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-10">

      <h1 className="text-2xl font-bold text-center mb-6">🗓️ To-Do Calendar</h1>

      <div className="max-w-3xl mx-auto grid grid-cols-7 gap-4 mb-8">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium text-gray-600">
            {day}
          </div>
        ))}
        {generateDays().map(date => {
          const dateStr = date.format('YYYY-MM-DD')
          const dayTasks = tasks.filter(t => t.date === dateStr)
          return (
            <div
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`p-2 rounded border cursor-pointer ${
                selectedDate === dateStr ? 'border-blue-500 bg-blue-50' : 'bg-white'
              }`}
            >
              <div className="text-sm font-semibold text-gray-800">{date.date()}</div>
              <ul className="text-xs text-gray-600 space-y-1 mt-1">
                {dayTasks.slice(0, 2).map(task => (
                  <li key={task.id} className={task.completed ? 'line-through' : ''}>
                    • {task.text}
                  </li>
                ))}
                {dayTasks.length > 2 && <li>+{dayTasks.length - 2} more</li>}
              </ul>
            </div>
          )
        })}
      </div>

      <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
        <h2 className="text-lg font-semibold mb-2">
          Tasks for {dayjs(selectedDate).format('dddd, MMM D')}
        </h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            placeholder="Add a task..."
            className="flex-grow border px-3 py-2 rounded"
          />
          <button
            onClick={handleAddTask}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <ul className="space-y-2">
          {tasks
            .filter(t => t.date === selectedDate)
            .map(t => (
              <li
                key={t.id}
                className="flex justify-between items-center border p-2 rounded"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleTask(t.id)}
                  />
                  <span className={t.completed ? 'line-through text-gray-400' : ''}>
                    {t.text}
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(t.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑️
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
