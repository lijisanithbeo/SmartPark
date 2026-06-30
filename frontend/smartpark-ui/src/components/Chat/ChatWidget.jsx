import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import chatService from '@/services/chatService'

const GREETINGS = {
  Customer:     "Hi! I can help you find parking spots, check your bookings, or answer any questions.",
  ParkingOwner: "Hi! I can help you analyse revenue, check reservations, or give business insights.",
  Admin:        "Hi! I can help you monitor the platform, review analytics, or answer admin queries.",
}

export default function ChatWidget() {
  const { user } = useAuth()
  const role = user?.role || 'Customer'
  const greeting = GREETINGS[role] || GREETINGS.Customer

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: greeting }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Reset greeting if role changes (e.g. after login)
  useEffect(() => {
    setMessages([{ role: 'assistant', content: GREETINGS[role] || GREETINGS.Customer }])
  }, [role])

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      // Send last 6 messages (excluding the initial greeting) as history context
      const history = messages.slice(1).slice(-6).map(m => ({ role: m.role, content: m.content }))
      const { reply } = await chatService.sendMessage(text, [...history, { role: 'user', content: text }])
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="flex flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl"
          style={{ width: '340px', height: '480px' }}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center gap-2.5 bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/20">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight">SmartPark AI</p>
              <p className="text-xs opacity-70 leading-tight">Ask me anything</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl rounded-bl-none bg-muted px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 flex gap-2 border-t p-3">
            <Input
              placeholder="Type a message…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              disabled={loading}
              className="text-sm h-9"
            />
            <Button size="icon" className="h-9 w-9 shrink-0" onClick={send} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <Button
        size="icon"
        className="h-13 w-13 rounded-full shadow-lg"
        style={{ height: '52px', width: '52px' }}
        onClick={() => setOpen(prev => !prev)}
        aria-label="SmartPark AI Assistant"
      >
        {open ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </Button>
    </div>
  )
}
