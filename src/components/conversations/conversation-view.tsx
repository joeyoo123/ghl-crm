"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";
import {
  MessageSquare,
  Mail,
  Phone,
  Send,
  Bot,
  Plus,
  Search,
  Sparkles,
  PhoneMissed,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface Message {
  id: string;
  body: string;
  direction: string;
  channel: string;
  isAiGenerated: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  channel: string;
  subject: string | null;
  status: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  aiEnabled: boolean;
  contact: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  };
  messages: Message[];
}

const channelIcons: Record<string, React.ReactNode> = {
  sms: <Phone className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  chat: <MessageSquare className="w-4 h-4" />,
  phone: <PhoneMissed className="w-4 h-4" />,
};

const channelColors: Record<string, string> = {
  sms: "text-green-600 bg-green-50",
  email: "text-blue-600 bg-blue-50",
  chat: "text-purple-600 bg-purple-50",
  phone: "text-orange-600 bg-orange-50",
};

export function ConversationView({
  initialConversations,
}: {
  initialConversations: Conversation[];
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selected, setSelected] = useState<string | null>(
    initialConversations[0]?.id || null
  );
  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === selected);

  const filtered = conversations.filter((c) => {
    const term = search.toLowerCase();
    const name = `${c.contact.firstName} ${c.contact.lastName}`.toLowerCase();
    return name.includes(term) || (c.lastMessage && c.lastMessage.toLowerCase().includes(term));
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;

    const res = await fetch("/api/conversations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: activeConversation.id,
        body: messageText,
        direction: "outbound",
      }),
    });

    if (res.ok) {
      const newMessage = await res.json();
      setConversations(
        conversations.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                messages: [...c.messages, newMessage],
                lastMessage: messageText,
                lastMessageAt: new Date().toISOString(),
              }
            : c
        )
      );
      setMessageText("");
    }
  }

  async function handleGenerateAIReply() {
    if (!activeConversation) return;
    setIsGeneratingAI(true);

    const res = await fetch("/api/conversations/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: activeConversation.id,
        contactName: `${activeConversation.contact.firstName} ${activeConversation.contact.lastName}`,
        channel: activeConversation.channel,
        messages: activeConversation.messages.map((m) => ({
          role: m.direction === "inbound" ? "user" : "assistant",
          content: m.body,
        })),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setMessageText(data.reply);
    }
    setIsGeneratingAI(false);
  }

  async function toggleAI(conversationId: string, currentState: boolean) {
    const res = await fetch("/api/conversations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, aiEnabled: !currentState }),
    });
    if (res.ok) {
      setConversations(
        conversations.map((c) =>
          c.id === conversationId ? { ...c, aiEnabled: !currentState } : c
        )
      );
    }
  }

  async function simulateInbound() {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "simulate_missed_call" }),
    });
    if (res.ok) {
      const data = await res.json();
      setConversations([data.conversation, ...conversations]);
      setSelected(data.conversation.id);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
          <p className="text-gray-500 mt-1">
            Manage all customer communications across channels
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={simulateInbound}>
            <PhoneMissed className="w-4 h-4 mr-2" />
            Simulate Missed Call
          </Button>
        </div>
      </div>

      <div className="flex bg-white rounded-xl border border-gray-200 h-[calc(100vh-220px)]">
        {/* Conversation List */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No conversations yet. Simulate a missed call to see AI in action.
              </div>
            ) : (
              filtered.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv.id)}
                  className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    selected === conv.id ? "bg-blue-50 border-l-2 border-l-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={`${conv.contact.firstName} ${conv.contact.lastName}`}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conv.contact.firstName} {conv.contact.lastName}
                        </p>
                        <div className={`p-1 rounded ${channelColors[conv.channel]}`}>
                          {channelIcons[conv.channel]}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {conv.lastMessage || "No messages"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {conv.aiEnabled && (
                          <Badge variant="info" className="text-[10px] px-1.5 py-0">
                            <Bot className="w-3 h-3 mr-0.5" />
                            AI
                          </Badge>
                        )}
                        <Badge
                          variant={conv.status === "open" ? "success" : "default"}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {conv.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col">
          {!activeConversation ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a conversation to view messages</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={`${activeConversation.contact.firstName} ${activeConversation.contact.lastName}`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {activeConversation.contact.firstName}{" "}
                      {activeConversation.contact.lastName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${channelColors[activeConversation.channel]}`}>
                        {channelIcons[activeConversation.channel]}
                        {activeConversation.channel.toUpperCase()}
                      </span>
                      {activeConversation.contact.phone && (
                        <span>{activeConversation.contact.phone}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    toggleAI(activeConversation.id, activeConversation.aiEnabled)
                  }
                  className="flex items-center gap-2 text-sm"
                >
                  {activeConversation.aiEnabled ? (
                    <ToggleRight className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                  <span
                    className={
                      activeConversation.aiEnabled ? "text-blue-600 font-medium" : "text-gray-400"
                    }
                  >
                    AI Auto-Reply
                  </span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                        msg.direction === "outbound"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {msg.isAiGenerated && (
                        <div
                          className={`flex items-center gap-1 text-[10px] mb-1 ${
                            msg.direction === "outbound" ? "text-blue-200" : "text-purple-500"
                          }`}
                        >
                          <Bot className="w-3 h-3" />
                          AI Generated
                        </div>
                      )}
                      <p className="text-sm">{msg.body}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          msg.direction === "outbound" ? "text-blue-200" : "text-gray-400"
                        }`}
                      >
                        {formatDateTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-100 p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="min-h-[44px] max-h-32 pr-12"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button type="submit" size="sm" disabled={!messageText.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleGenerateAIReply}
                      disabled={isGeneratingAI}
                      title="Generate AI reply"
                    >
                      <Sparkles className={`w-4 h-4 ${isGeneratingAI ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
