'use client'

import { useEffect, useState } from 'react'

type Todo = {
  id: number
  task: string
  completed: boolean
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTask, setNewTask] = useState('')

  // Load todos from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('todos')
    if (stored) setTodos(JSON.parse(stored))
  }, [])

  // Save todos to localStorage on update
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    if (!newTask.trim()) return
    setTodos(prev => [
      ...prev,
      { id: Date.now(), task: newTask.trim(), completed: false }
    ])
    setNewTask('')
  }

  const toggleComplete = (id: number) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  return (
    <div className="min-h-screen w-full max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-md p-8">
      <div className="max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">📋 Your To-Do List</h1>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-grow border px-3 py-2 rounded"
          />
          <button
            onClick={addTodo}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        <ul className="space-y-2">
          {todos.map(todo => (
            <li
              key={todo.id}
              className="flex justify-between items-center border p-3 rounded bg-white"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo.id)}
                />
                <span className={todo.completed ? 'line-through text-gray-400' : ''}>
                  {todo.task}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
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
