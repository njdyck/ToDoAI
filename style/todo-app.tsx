"use client"

import { useState } from "react"
import { Plus, Send, Trash2, Calendar, CheckCircle2, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Todo {
  id: number
  text: string
  completed: boolean
  priority: "hoch" | "mittel" | "niedrig"
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "ai",
      text: "Hallo! Beschreibe die Aufgabe und ich erstelle eine ToDo-Liste für dich.",
    },
  ])

  const addTodo = (text: string, priority: "hoch" | "mittel" | "niedrig" = "mittel") => {
    if (text.trim()) {
      setTodos([...todos, { id: Date.now(), text, completed: false, priority }])
      setNewTodo("")
    }
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const deleteCompletedTodos = () => {
    setTodos(todos.filter((todo) => !todo.completed))
  }

  const sendChatMessage = () => {
    if (chatInput.trim()) {
      // Add user message
      setChatMessages([...chatMessages, { sender: "user", text: chatInput }])

      // Simulate AI response
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: `Ich habe folgende Aufgaben für dich erstellt: ${chatInput}`,
          },
        ])

        // Add as todo
        addTodo(chatInput)
      }, 500)

      setChatInput("")
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "hoch":
        return "text-red-400"
      case "mittel":
        return "text-amber-400"
      case "niedrig":
        return "text-green-400"
      default:
        return ""
    }
  }

  return (
    <div
      className="flex flex-col md:flex-row gap-6 p-4 md:p-6 max-w-7xl mx-auto h-[calc(100vh-40px)]"
      style={{ background: "#202124" }}
    >
      <Card className="flex-1 flex flex-col border-[#2e2f33] bg-[#2e2f33]">
        <CardHeader className="border-b border-[#2e2f33]">
          <CardTitle className="text-xl font-medium text-[#e8eaed]">Chat mit KI Agent</CardTitle>
          <CardDescription className="text-[#9aa0a6]">
            Beschreibe deine Aufgaben und der KI Agent hilft dir
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto space-y-4 mb-4 py-4">
          {chatMessages.map((message, index) => (
            <div key={index} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === "user" ? "bg-[#4285f4] text-white" : "bg-[#2e2f33] text-[#e8eaed]"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="pt-2 border-t border-[#2e2f33]">
          <div className="flex w-full gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Beschreibe deine Aufgabe..."
              onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
              className="flex-1 bg-[#2e2f33] border-[#3c3c42] text-[#e8eaed] placeholder:text-[#80868b]"
            />
            <Button onClick={sendChatMessage} size="icon" className="bg-[#4285f4] hover:bg-[#3b78e7]">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Card className="flex-1 flex flex-col border-[#2e2f33] bg-[#2e2f33]">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[#2e2f33]">
          <div>
            <CardTitle className="text-xl font-medium text-[#e8eaed]">Deine ToDo Liste</CardTitle>
            <CardDescription className="text-[#9aa0a6]">Organisiere deine Aufgaben</CardDescription>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={deleteCompletedTodos}
            disabled={!todos.some((t) => t.completed)}
            className="bg-[#ea4335] hover:bg-[#d93025] text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Erledigte löschen
          </Button>
        </CardHeader>
        <div className="px-6 pb-2 pt-4 flex gap-2">
          <Select defaultValue="alle">
            <SelectTrigger className="w-[180px] bg-[#2e2f33] border-[#3c3c42] text-[#e8eaed]">
              <SelectValue placeholder="Priorität" />
            </SelectTrigger>
            <SelectContent className="bg-[#2e2f33] border-[#3c3c42] text-[#e8eaed]">
              <SelectItem value="alle">Alle Prioritäten</SelectItem>
              <SelectItem value="hoch">Hohe Priorität</SelectItem>
              <SelectItem value="mittel">Mittlere Priorität</SelectItem>
              <SelectItem value="niedrig">Niedrige Priorität</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="neueste">
            <SelectTrigger className="w-[180px] bg-[#2e2f33] border-[#3c3c42] text-[#e8eaed]">
              <SelectValue placeholder="Sortieren" />
            </SelectTrigger>
            <SelectContent className="bg-[#2e2f33] border-[#3c3c42] text-[#e8eaed]">
              <SelectItem value="neueste">Sortieren nach: Neueste</SelectItem>
              <SelectItem value="aelteste">Sortieren nach: Älteste</SelectItem>
              <SelectItem value="prioritaet">Sortieren nach: Priorität</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <CardContent className="flex-1 overflow-auto pt-4">
          {todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#80868b]">
              <Calendar className="h-12 w-12 mb-2 opacity-30" />
              <p>Keine Aufgaben vorhanden</p>
              <p className="text-sm">Füge eine neue Aufgabe hinzu, um zu beginnen</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[#2e2f33] bg-[#2e2f33] hover:bg-[#3c3c42] transition-colors"
                >
                  <button onClick={() => toggleTodo(todo.id)} className="flex-shrink-0">
                    {todo.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-[#34a853]" />
                    ) : (
                      <Circle className="h-5 w-5 text-[#80868b]" />
                    )}
                  </button>
                  <span className={`flex-1 ${todo.completed ? "line-through text-[#80868b]" : "text-[#e8eaed]"}`}>
                    {todo.text}
                  </span>
                  <Badge variant="outline" className={`border-[#3c3c42] ${getPriorityColor(todo.priority)}`}>
                    {todo.priority}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        <CardFooter className="pt-2 border-t border-[#2e2f33]">
          <div className="flex w-full gap-2">
            <Input
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Neue Aufgabe hinzufügen..."
              onKeyDown={(e) => e.key === "Enter" && addTodo(newTodo)}
              className="flex-1 bg-[#2e2f33] border-[#3c3c42] text-[#e8eaed] placeholder:text-[#80868b]"
            />
            <Select defaultValue="mittel">
              <SelectTrigger className="w-[120px] bg-[#2e2f33] border-[#3c3c42] text-[#e8eaed]">
                <SelectValue placeholder="Priorität" />
              </SelectTrigger>
              <SelectContent className="bg-[#2e2f33] border-[#3c3c42] text-[#e8eaed]">
                <SelectItem value="hoch">Hoch</SelectItem>
                <SelectItem value="mittel">Mittel</SelectItem>
                <SelectItem value="niedrig">Niedrig</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => addTodo(newTodo)} size="icon" className="bg-[#4285f4] hover:bg-[#3b78e7]">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

