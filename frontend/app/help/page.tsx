'use client'

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full p-8 rounded shadow-md bg-gray-50">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">Need Help?</h1>
        <p className="text-gray-700 mb-4">
          Welcome to the <strong>Academic Success Assistant</strong> Help Center! 🎓
        </p>

        <ul className="space-y-4 text-gray-600">
          <li>
            📅 <strong>Calendar:</strong> Add your weekly schedule to stay organized and never miss a class.
          </li>
          <li>
            📈 <strong>CGPA Planner:</strong> Set your academic goals and get grade recommendations.
          </li>
          <li>
            💬 <strong>AI Assistant:</strong> Ask questions about study tips, scheduling, or concepts — powered by Gemini.
          </li>
          <li>
            ✍️ <strong>Profile:</strong> Update your personal info and track your CGPA progress over time.
          </li>
          <li>
            🧠 <strong>To-Do List:</strong> Keep track of assignments and daily academic tasks.
          </li>
        </ul>

        <p className="mt-6 text-sm text-gray-500 text-center">
          For more questions or feedback, reach out to <a href="mailto:support@academicsuccess.ai" className="text-blue-600 hover:underline">support@academicsuccess.ai</a>
        </p>
      </div>
    </div>
  )
}
