"use client"

import { useState } from "react"
import { mockMessages, mockTenants, type Message } from "@/lib/mock-data"
import { MessageSquare, Send, Bell, PartyPopper, Megaphone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const typeIcons: Record<string, typeof Bell> = {
  "rent-reminder": Bell,
  "holiday-notice": PartyPopper,
  "announcement": Megaphone,
}

const typeColors: Record<string, string> = {
  "rent-reminder": "bg-warning/10 text-warning-foreground",
  "holiday-notice": "bg-primary/10 text-primary",
  "announcement": "bg-chart-2/10 text-chart-2",
}

export function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [showCompose, setShowCompose] = useState(false)
  const [newMsg, setNewMsg] = useState({ type: "announcement" as Message["type"], title: "", content: "", recipients: "all" })

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    const msg: Message = {
      id: `msg-${Date.now()}`,
      type: newMsg.type,
      title: newMsg.title,
      content: newMsg.content,
      sentAt: new Date().toISOString(),
      sentBy: "Admin",
      recipients: newMsg.recipients === "all" ? "all" : [newMsg.recipients],
    }
    setMessages([msg, ...messages])
    setShowCompose(false)
    setNewMsg({ type: "announcement", title: "", content: "", recipients: "all" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{messages.length} messages sent</p>
        <Dialog open={showCompose} onOpenChange={setShowCompose}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Send className="h-4 w-4" />
              Compose Message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Compose Message</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newMsg.type} onValueChange={(v) => setNewMsg({ ...newMsg, type: v as Message["type"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent-reminder">Rent Reminder</SelectItem>
                      <SelectItem value="holiday-notice">Holiday Notice</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Recipients</Label>
                  <Select value={newMsg.recipients} onValueChange={(v) => setNewMsg({ ...newMsg, recipients: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tenants</SelectItem>
                      {mockTenants.filter((t) => t.status === "active").map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={newMsg.title} onChange={(e) => setNewMsg({ ...newMsg, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea rows={4} value={newMsg.content} onChange={(e) => setNewMsg({ ...newMsg, content: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setShowCompose(false)}>Cancel</Button>
                <Button type="submit" className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Message List */}
      <div className="space-y-3">
        {messages.map((msg) => {
          const Icon = typeIcons[msg.type] || Megaphone
          return (
            <Card key={msg.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeColors[msg.type]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{msg.title}</h3>
                      <Badge variant="outline" className="capitalize text-xs">
                        {msg.type.replace("-", " ")}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{msg.content}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{new Date(msg.sentAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span>To: {msg.recipients === "all" ? "All Tenants" : `${(msg.recipients as string[]).length} tenant(s)`}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
