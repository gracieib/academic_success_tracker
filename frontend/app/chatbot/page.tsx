'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

type Message = {
  role: 'user' | 'bot'
  content: string
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const newMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, newMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:5001/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })

      const data = await res.json()

      const botReply: Message = { role: 'bot', content: data.response }
      setMessages(prev => [...prev, botReply])
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: 'Something went wrong. Try again.' 
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-5xl mx-auto bg-white shadow-md rounded-lg">
      <div className="px-6 py-4 border-b bg-blue-600 text-white text-xl font-bold">
        AI Study Assistant 🤖
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`max-w-lg px-4 py-2 rounded-lg whitespace-pre-wrap ${
            msg.role === 'user'
              ? 'bg-blue-500 text-white self-end ml-auto'
              : 'bg-white text-gray-800 self-start mr-auto border'
          }`}
        >
          {msg.role === 'bot' ? (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ) : (
          msg.content
        )}
        </div>
      ))}

        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t bg-white flex items-center">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          rows={1}
          className="flex-1 resize-none p-2 border border-gray-300 rounded mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-blue-300 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:bg-blue-300"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
          ) : 'Send'}
        </button>
      </div>
    </div>
  )
}