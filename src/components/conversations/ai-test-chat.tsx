"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import {
  Send,
  Bot,
  User,
  Phone,
  Mail,
  MessageSquare,
  Loader2,
  Plus,
  Sparkles,
  FlaskConical,
} from "lucide-react";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
}

interface Message {
  id: string;
  body: string;
  direction: string;
  channel: string;
  isAiGenerated: boolean;
  createdAt: string;
}

const channelConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  sms: { icon: <Phone className="w-4 h-4" />, label: "SMS", color: "text-green-600 bg-green-50" },
  email: { icon: <Mail className="w-4 h-4" />, label: "Email", color: "text-blue-600 bg-blue-50" },
  chat: { icon: <MessageSquare className="w-4 h-4" />, label: "Live Chat", color: "text-purple-600 bg-purple-50" },
};

export function AITestChat({ contacts }: { contacts: Contact[] }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(contacts[0]?.id || "");
  const [channel, setChannel] = useState("chat");
  const [isStarted, setIsStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contact = contacts.find((c) => c.id === selectedContact);
  const contactName = contact ? `${contact.firstName} ${contact.lastName}` : "Test Customer";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startConversation() {
    const res = await fetch("/api/conversations/reply", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactId: selectedContact,
        channel,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setConversationId(data.conversationId);
      setIsStarted(true);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!messageText.trim() || !conversationId || isLoading) return;

    const userMsg = messageText;
    setMessageText("");
    setIsLoading(true);

    const optimisticInbound: Message = {
      id: `temp-${Date.now()}`,
      body: userMsg,
      direction: "inbound",
      channel,
      isAiGenerated: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticInbound]);

    try {
      const res = await fetch("/api/conversations/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message: userMsg,
          contactName,
          channel,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== optimisticInbound.id),
          data.inbound,
          data.aiReply,
        ]);
      }
    } catch {
      setMessages((prev) =>
        prev.filter((m) => m.id !== optimisticInbound.id)
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (!isStarted) {
    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Agent Test Lab</h1>
              <p className="text-gray-500">Test the AI agent by chatting as a customer</p>
            </div>
          </div>
        </div>

        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Start a Test Conversation</h2>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Bot className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="text-sm text-purple-900">
                    <p className="font-medium mb-1">How this works:</p>
                    <ul className="space-y-1 text-purple-700">
                      <li>1. Pick a contact persona and channel below</li>
                      <li>2. Type messages as if you are the customer</li>
                      <li>3. The AI agent will respond automatically in real time</li>
                      <li>4. All messages are persisted to the CRM database</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chat as Contact
                </label>
                <Select
                  value={selectedContact}
                  onChange={(e) => setSelectedContact(e.target.value)}
                >
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                      {c.phone ? ` - ${c.phone}` : ""}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel
                </label>
                <div className="flex gap-2">
                  {Object.entries(channelConfig).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setChannel(key)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        channel === key
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={startConversation} className="w-full" size="lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Start AI Conversation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Agent Test Lab</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="success">Live</Badge>
              <span className="text-xs text-gray-500">
                Chatting as {contactName} via {channelConfig[channel]?.label}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsStarted(false);
            setConversationId(null);
            setMessages([]);
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          New Test
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 h-[calc(100vh-220px)] flex flex-col">
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">You (Customer)</span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-700">AI Agent</span>
            </div>
          </div>
          <div className={`ml-auto flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${channelConfig[channel]?.color}`}>
            {channelConfig[channel]?.icon}
            {channelConfig[channel]?.label}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Bot className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">AI Agent is ready</p>
              <p className="text-sm mt-1">Send a message to start the conversation</p>
              <div className="flex flex-wrap gap-2 mt-4 max-w-md justify-center">
                {[
                  "Hi, I'm interested in your services",
                  "I missed a call from you guys",
                  "What are your prices?",
                  "Can I schedule an appointment?",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setMessageText(prompt)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.direction === "inbound" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-end gap-2 max-w-[75%]">
                {msg.direction === "outbound" && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 ${
                    msg.direction === "inbound"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900 border border-gray-200"
                  }`}
                >
                  {msg.isAiGenerated && msg.direction === "outbound" && (
                    <div className="flex items-center gap-1 text-[10px] text-purple-500 mb-1">
                      <Sparkles className="w-3 h-3" />
                      AI Agent
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      msg.direction === "inbound" ? "text-blue-200" : "text-gray-400"
                    }`}
                  >
                    {formatDateTime(msg.createdAt)}
                  </p>
                </div>
                {msg.direction === "inbound" && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>
                <div className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI is thinking...
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-100 p-4">
          <form onSubmit={handleSend} className="flex gap-2">
            <Textarea
              placeholder={`Type a message as ${contactName}...`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="min-h-[44px] max-h-32 flex-1"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <Button type="submit" disabled={!messageText.trim() || isLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
