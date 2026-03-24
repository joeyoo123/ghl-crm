"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import { Plus, GripVertical, DollarSign } from "lucide-react";

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  status: string;
  contact: { id: string; firstName: string; lastName: string; company: string | null };
}

interface Pipeline {
  id: string;
  name: string;
  stages: string;
  deals: Deal[];
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
}

const stageColors: Record<string, string> = {
  "New Lead": "border-t-blue-500",
  "Contacted": "border-t-yellow-500",
  "Qualified": "border-t-purple-500",
  "Proposal Sent": "border-t-orange-500",
  "Negotiation": "border-t-cyan-500",
  "Closed Won": "border-t-green-500",
  "Closed Lost": "border-t-red-500",
};

export function PipelineBoard({
  initialPipelines,
  contacts,
}: {
  initialPipelines: Pipeline[];
  contacts: Contact[];
}) {
  const [pipelines, setPipelines] = useState(initialPipelines);
  const [selectedPipeline, setSelectedPipeline] = useState(pipelines[0]?.id || "");
  const [showDealModal, setShowDealModal] = useState(false);
  const [showPipelineModal, setShowPipelineModal] = useState(false);
  const [dealForm, setDealForm] = useState({
    title: "",
    value: "",
    stage: "",
    contactId: "",
  });
  const [pipelineForm, setPipelineForm] = useState({ name: "" });

  const pipeline = pipelines.find((p) => p.id === selectedPipeline);
  const stages: { id: string; name: string; order: number; color: string }[] = pipeline
    ? JSON.parse(pipeline.stages)
    : [];

  function getDealsForStage(stageName: string) {
    return pipeline?.deals.filter((d) => d.stage === stageName) || [];
  }

  function getStageValue(stageName: string) {
    return getDealsForStage(stageName).reduce((sum, d) => sum + d.value, 0);
  }

  async function handleCreateDeal(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...dealForm,
        value: parseFloat(dealForm.value) || 0,
        pipelineId: selectedPipeline,
      }),
    });
    if (res.ok) {
      const newDeal = await res.json();
      setPipelines(
        pipelines.map((p) =>
          p.id === selectedPipeline ? { ...p, deals: [...p.deals, newDeal] } : p
        )
      );
      setShowDealModal(false);
      setDealForm({ title: "", value: "", stage: "", contactId: "" });
    }
  }

  async function handleCreatePipeline(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/pipelines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pipelineForm),
    });
    if (res.ok) {
      const newPipeline = await res.json();
      setPipelines([...pipelines, { ...newPipeline, deals: [] }]);
      setSelectedPipeline(newPipeline.id);
      setShowPipelineModal(false);
      setPipelineForm({ name: "" });
    }
  }

  async function handleMoveDeal(dealId: string, newStage: string) {
    const res = await fetch("/api/deals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: dealId, stage: newStage }),
    });
    if (res.ok) {
      setPipelines(
        pipelines.map((p) =>
          p.id === selectedPipeline
            ? {
                ...p,
                deals: p.deals.map((d) =>
                  d.id === dealId ? { ...d, stage: newStage } : d
                ),
              }
            : p
        )
      );
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipelines</h1>
          <p className="text-gray-500 mt-1">Manage your sales pipeline and deals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPipelineModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Pipeline
          </Button>
          <Button
            onClick={() => {
              if (stages.length > 0) {
                setDealForm({ ...dealForm, stage: stages[0].name });
              }
              setShowDealModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Deal
          </Button>
        </div>
      </div>

      {pipelines.length > 1 && (
        <div className="flex gap-2 mb-6">
          {pipelines.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPipeline(p.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPipeline === p.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {!pipeline ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">No pipelines yet. Create one to get started.</p>
          <Button onClick={() => setShowPipelineModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Pipeline
          </Button>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const deals = getDealsForStage(stage.name);
            const total = getStageValue(stage.name);
            return (
              <div
                key={stage.id}
                className={`flex-shrink-0 w-72 bg-gray-50 rounded-xl border-t-4 ${
                  stageColors[stage.name] || "border-t-gray-400"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-900">{stage.name}</h3>
                    <Badge variant="default">{deals.length}</Badge>
                  </div>
                  <p className="text-xs text-gray-500">{formatCurrency(total)}</p>
                </div>
                <div className="px-3 pb-3 space-y-2 min-h-[200px]">
                  {deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-move"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                        <GripVertical className="w-4 h-4 text-gray-300" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar
                          name={`${deal.contact.firstName} ${deal.contact.lastName}`}
                          size="sm"
                        />
                        <p className="text-xs text-gray-600">
                          {deal.contact.firstName} {deal.contact.lastName}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                          <DollarSign className="w-3.5 h-3.5" />
                          {formatCurrency(deal.value)}
                        </div>
                        <Select
                          className="h-7 text-xs w-28"
                          value={deal.stage}
                          onChange={(e) => handleMoveDeal(deal.id, e.target.value)}
                        >
                          {stages.map((s) => (
                            <option key={s.id} value={s.name}>
                              {s.name}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showDealModal} onClose={() => setShowDealModal(false)} title="Add New Deal">
        <form onSubmit={handleCreateDeal} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deal Title</label>
            <Input
              required
              value={dealForm.title}
              onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
              placeholder="e.g., Website Redesign"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
            <Input
              type="number"
              value={dealForm.value}
              onChange={(e) => setDealForm({ ...dealForm, value: e.target.value })}
              placeholder="5000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
            <Select
              value={dealForm.stage}
              onChange={(e) => setDealForm({ ...dealForm, stage: e.target.value })}
            >
              {stages.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
            <Select
              required
              value={dealForm.contactId}
              onChange={(e) => setDealForm({ ...dealForm, contactId: e.target.value })}
            >
              <option value="">Select a contact</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowDealModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Deal</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showPipelineModal}
        onClose={() => setShowPipelineModal(false)}
        title="Create New Pipeline"
      >
        <form onSubmit={handleCreatePipeline} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline Name</label>
            <Input
              required
              value={pipelineForm.name}
              onChange={(e) => setPipelineForm({ name: e.target.value })}
              placeholder="e.g., Sales Pipeline"
            />
          </div>
          <p className="text-sm text-gray-500">
            Default stages will be created: New Lead, Contacted, Qualified, Proposal Sent, Negotiation, Closed Won, Closed Lost
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowPipelineModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Pipeline</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
