"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import {
  Plus,
  Zap,
  PhoneMissed,
  UserPlus,
  GitBranch,
  Bell,
  FileText,
  ToggleLeft,
  ToggleRight,
  Bot,
  Mail,
  MessageSquare,
} from "lucide-react";

interface Automation {
  id: string;
  name: string;
  trigger: string;
  actions: string;
  isActive: boolean;
  lastRun: string | null;
  runCount: number;
  createdAt: string;
}

const triggerIcons: Record<string, React.ReactNode> = {
  missed_call: <PhoneMissed className="w-5 h-5" />,
  new_lead: <UserPlus className="w-5 h-5" />,
  deal_stage_change: <GitBranch className="w-5 h-5" />,
  appointment_reminder: <Bell className="w-5 h-5" />,
  form_submission: <FileText className="w-5 h-5" />,
};

const triggerLabels: Record<string, string> = {
  missed_call: "Missed Call",
  new_lead: "New Lead Created",
  deal_stage_change: "Deal Stage Changed",
  appointment_reminder: "Appointment Reminder",
  form_submission: "Form Submitted",
};

const actionIcons: Record<string, React.ReactNode> = {
  send_sms: <MessageSquare className="w-4 h-4 text-green-600" />,
  send_email: <Mail className="w-4 h-4 text-blue-600" />,
  ai_reply: <Bot className="w-4 h-4 text-purple-600" />,
  create_task: <FileText className="w-4 h-4 text-orange-600" />,
  notify: <Bell className="w-4 h-4 text-yellow-600" />,
};

export function AutomationList({ initialAutomations }: { initialAutomations: Automation[] }) {
  const [automations, setAutomations] = useState(initialAutomations);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    trigger: "missed_call",
    actions: ["ai_reply", "send_sms"],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        trigger: formData.trigger,
        actions: formData.actions,
      }),
    });
    if (res.ok) {
      const automation = await res.json();
      setAutomations([...automations, automation]);
      setShowModal(false);
      setFormData({ name: "", trigger: "missed_call", actions: ["ai_reply", "send_sms"] });
    }
  }

  async function toggleAutomation(id: string, isActive: boolean) {
    const res = await fetch("/api/automations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    if (res.ok) {
      setAutomations(automations.map((a) => (a.id === id ? { ...a, isActive: !isActive } : a)));
    }
  }

  function toggleAction(action: string) {
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.includes(action)
        ? prev.actions.filter((a) => a !== action)
        : [...prev.actions, action],
    }));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automations</h1>
          <p className="text-gray-500 mt-1">
            Set up automated workflows triggered by events
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Automation
        </Button>
      </div>

      {automations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Zap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 mb-4">No automations yet. Create one to automate your workflows.</p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Automation
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {automations.map((automation) => {
            const actions: string[] = JSON.parse(automation.actions);
            return (
              <Card key={automation.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${automation.isActive ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"}`}>
                      {triggerIcons[automation.trigger] || <Zap className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{automation.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={automation.isActive ? "success" : "default"}>
                          {automation.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Trigger: {triggerLabels[automation.trigger]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {actions.map((action) => (
                          <span
                            key={action}
                            className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded-md"
                          >
                            {actionIcons[action]}
                            {action.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-xs text-gray-500">
                      <p>Runs: {automation.runCount}</p>
                      {automation.lastRun && <p>Last: {formatDateTime(automation.lastRun)}</p>}
                    </div>
                    <button onClick={() => toggleAutomation(automation.id, automation.isActive)}>
                      {automation.isActive ? (
                        <ToggleRight className="w-8 h-8 text-blue-600" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-400" />
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Automation">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Missed Call Auto-Reply"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trigger</label>
            <Select
              value={formData.trigger}
              onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
            >
              <option value="missed_call">Missed Call</option>
              <option value="new_lead">New Lead Created</option>
              <option value="deal_stage_change">Deal Stage Changed</option>
              <option value="appointment_reminder">Appointment Reminder</option>
              <option value="form_submission">Form Submitted</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(actionIcons).map(([key, icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleAction(key)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-sm ${
                    formData.actions.includes(key)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {icon}
                  {key.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Automation</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
