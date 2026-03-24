export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getDefaultUser } from "@/lib/auth";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  DollarSign,
  MessageSquare,
  Calendar,
  PhoneMissed,
  TrendingUp,
  GitBranch,
  Bot,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getDefaultUser();

  const [
    totalContacts,
    totalDeals,
    openDeals,
    activeConversations,
    appointmentsToday,
    missedCalls,
    recentActivities,
  ] = await Promise.all([
    prisma.contact.count({ where: { userId: user.id } }),
    prisma.deal.count({ where: { userId: user.id } }),
    prisma.deal.count({ where: { userId: user.id, status: "open" } }),
    prisma.conversation.count({ where: { userId: user.id, status: "open" } }),
    prisma.appointment.count({
      where: {
        userId: user.id,
        startTime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.missedCall.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.activity.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { contact: true },
    }),
  ]);

  const wonDeals = await prisma.deal.aggregate({
    where: { userId: user.id, status: "won" },
    _sum: { value: true },
  });

  const pipelineValue = await prisma.deal.aggregate({
    where: { userId: user.id, status: "open" },
    _sum: { value: true },
  });

  const stats = [
    { label: "Total Contacts", value: totalContacts, icon: Users, color: "blue" },
    { label: "Revenue", value: formatCurrency(wonDeals._sum.value || 0), icon: DollarSign, color: "green" },
    { label: "Pipeline Value", value: formatCurrency(pipelineValue._sum.value || 0), icon: TrendingUp, color: "purple" },
    { label: "Open Deals", value: openDeals, icon: GitBranch, color: "orange" },
    { label: "Active Conversations", value: activeConversations, icon: MessageSquare, color: "cyan" },
    { label: "Today's Appointments", value: appointmentsToday, icon: Calendar, color: "indigo" },
    { label: "Missed Calls (24h)", value: missedCalls, icon: PhoneMissed, color: "red" },
    { label: "AI Responses", value: "Active", icon: Bot, color: "violet" },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    cyan: "bg-cyan-50 text-cyan-600",
    indigo: "bg-indigo-50 text-indigo-600",
    red: "bg-red-50 text-red-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user.name}. Here is your business overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className={`p-3 rounded-lg ${colorMap[stat.color]}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No recent activity. Start by adding contacts and creating deals.</p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 py-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div>
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">AI Conversation Summary</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">AI Auto-Reply</span>
                </div>
                <span className="text-sm text-green-600 font-semibold">Enabled</span>
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <p>The AI assistant automatically responds to:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-500">
                  <li>Missed phone calls via SMS and email</li>
                  <li>New customer inquiries on all channels</li>
                  <li>Follow-up messages for inactive leads</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
