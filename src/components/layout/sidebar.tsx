"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  MessageSquare,
  Calendar,
  Zap,
  Settings,
  Phone,
  Bot,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/contacts", icon: Users, label: "Contacts" },
  { href: "/pipelines", icon: GitBranch, label: "Pipelines" },
  { href: "/conversations", icon: MessageSquare, label: "Conversations" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
  { href: "/automations", icon: Zap, label: "Automations" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Phone className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900">GHL CRM</span>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-3">
          <Bot className="h-5 w-5 text-purple-600" />
          <div>
            <p className="text-xs font-semibold text-purple-900">AI Assistant</p>
            <p className="text-xs text-purple-600">Active & Responding</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
