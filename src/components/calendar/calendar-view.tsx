"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, User } from "lucide-react";

interface Appointment {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  status: string;
  location: string | null;
  contact: { id: string; firstName: string; lastName: string } | null;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
}

const statusColors: Record<string, "success" | "info" | "warning" | "danger"> = {
  scheduled: "info",
  completed: "success",
  cancelled: "danger",
  no_show: "warning",
};

export function CalendarView({
  initialAppointments,
  contacts,
}: {
  initialAppointments: Appointment[];
  contacts: Contact[];
}) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [showModal, setShowModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "list">("list");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    contactId: "",
  });

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  function getAppointmentsForDay(day: number) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return appointments.filter((a) => {
      const aDate = new Date(a.startTime);
      return (
        aDate.getDate() === date.getDate() &&
        aDate.getMonth() === date.getMonth() &&
        aDate.getFullYear() === date.getFullYear()
      );
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      const apt = await res.json();
      setAppointments([...appointments, apt]);
      setShowModal(false);
      setFormData({ title: "", description: "", startTime: "", endTime: "", location: "", contactId: "" });
    }
  }

  async function handleStatusChange(id: string, status: string) {
    const res = await fetch("/api/calendar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setAppointments(appointments.map((a) => (a.id === id ? { ...a, status } : a)));
    }
  }

  const upcomingAppointments = [...appointments]
    .filter((a) => new Date(a.startTime) >= new Date() && a.status === "scheduled")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 mt-1">Manage appointments and schedule</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-sm rounded-md ${view === "list" ? "bg-white shadow-sm" : ""}`}
            >
              List
            </button>
            <button
              onClick={() => setView("month")}
              className={`px-3 py-1.5 text-sm rounded-md ${view === "month" ? "bg-white shadow-sm" : ""}`}
            >
              Month
            </button>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {view === "month" ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() =>
                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
              }
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">{monthName}</h2>
            <button
              onClick={() =>
                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
              }
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="bg-gray-50 py-2 text-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white min-h-[80px]" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayAppointments = getAppointmentsForDay(day);
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();
              return (
                <div key={day} className={`bg-white min-h-[80px] p-1 ${isToday ? "ring-2 ring-blue-500 ring-inset" : ""}`}>
                  <span className={`text-xs font-medium ${isToday ? "text-blue-600" : "text-gray-500"}`}>
                    {day}
                  </span>
                  {dayAppointments.map((a) => (
                    <div
                      key={a.id}
                      className="mt-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded truncate"
                    >
                      {a.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingAppointments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No upcoming appointments. Schedule one to get started.</p>
            </div>
          ) : (
            upcomingAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {new Date(apt.startTime).getDate()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(apt.startTime).toLocaleString("default", { month: "short" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{apt.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDateTime(apt.startTime)}
                      </span>
                      {apt.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {apt.location}
                        </span>
                      )}
                      {apt.contact && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {apt.contact.firstName} {apt.contact.lastName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusColors[apt.status]}>{apt.status}</Badge>
                  <Select
                    className="h-8 text-xs w-32"
                    value={apt.status}
                    onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </Select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Appointment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <Input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Sales Call"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
              <Input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
              <Input
                type="datetime-local"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Zoom, Office"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
            <Select
              value={formData.contactId}
              onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
            >
              <option value="">No contact</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Appointment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
