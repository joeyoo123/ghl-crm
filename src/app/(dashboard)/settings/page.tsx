"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Building, Bell, Mail } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    businessName: "My Business",
    businessPhone: "+1 (555) 123-4567",
    businessEmail: "contact@mybusiness.com",
    aiEnabled: true,
    aiTone: "professional",
    aiCustomPrompt: "",
    missedCallAutoReply: true,
    missedCallReplyChannel: "sms",
    emailNotifications: true,
    smsNotifications: true,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Configure your CRM and AI settings</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Business Information</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <Input
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <Input
                value={settings.businessPhone}
                onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                value={settings.businessEmail}
                onChange={(e) => setSettings({ ...settings, businessEmail: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold">AI Conversation Settings</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-purple-900">AI Auto-Reply</p>
                <p className="text-xs text-purple-600">Automatically respond to incoming messages</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, aiEnabled: !settings.aiEnabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.aiEnabled ? "bg-purple-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.aiEnabled ? "left-6" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AI Tone</label>
              <Select
                value={settings.aiTone}
                onChange={(e) => setSettings({ ...settings, aiTone: e.target.value })}
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom AI Instructions
              </label>
              <Textarea
                value={settings.aiCustomPrompt}
                onChange={(e) => setSettings({ ...settings, aiCustomPrompt: e.target.value })}
                placeholder="Add custom instructions for the AI assistant..."
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-orange-900">Missed Call Text-Back</p>
                <p className="text-xs text-orange-600">Auto-reply via SMS/email when a call is missed</p>
              </div>
              <button
                onClick={() =>
                  setSettings({ ...settings, missedCallAutoReply: !settings.missedCallAutoReply })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.missedCallAutoReply ? "bg-orange-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.missedCallAutoReply ? "left-6" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Missed Call Reply Channel
              </label>
              <Select
                value={settings.missedCallReplyChannel}
                onChange={(e) =>
                  setSettings({ ...settings, missedCallReplyChannel: e.target.value })
                }
              >
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="both">Both SMS & Email</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-600" />
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Email Notifications</span>
              </div>
              <button
                onClick={() =>
                  setSettings({ ...settings, emailNotifications: !settings.emailNotifications })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.emailNotifications ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.emailNotifications ? "left-6" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm">SMS Notifications</span>
              </div>
              <button
                onClick={() =>
                  setSettings({ ...settings, smsNotifications: !settings.smsNotifications })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.smsNotifications ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.smsNotifications ? "left-6" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button>Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
