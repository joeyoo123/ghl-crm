export type ContactStatus = "lead" | "prospect" | "customer" | "inactive";
export type ConversationChannel = "sms" | "email" | "chat" | "phone";
export type MessageDirection = "inbound" | "outbound";
export type DealStatus = "open" | "won" | "lost";
export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no_show";
export type AutomationTrigger = "missed_call" | "new_lead" | "deal_stage_change" | "appointment_reminder" | "form_submission";

export interface DashboardStats {
  totalContacts: number;
  totalDeals: number;
  openDeals: number;
  totalRevenue: number;
  pipelineValue: number;
  appointmentsToday: number;
  activeConversations: number;
  missedCalls: number;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
}
