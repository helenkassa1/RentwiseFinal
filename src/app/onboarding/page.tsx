"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Home,
  Building2,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { MainNav } from "@/components/navigation/main-nav";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleContinue() {
    if (!selectedRole || !user) return;
    setIsSubmitting(true);

    try {
      // Save role to Clerk user metadata
      await fetch("/api/set-user-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      // Redirect based on role
      if (selectedRole === "tenant") {
        router.push("/tenant-rights");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to set role:", error);
      setIsSubmitting(false);
    }
  }

  const roles = [
    {
      id: "tenant",
      icon: Users,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      borderHover: "hover:border-emerald-300",
      title: "I\u2019m a Tenant",
      description:
        "Review my lease, understand my rights, get legal guidance",
      badge: "ALWAYS FREE",
      badgeStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    {
      id: "landlord",
      icon: Home,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      borderHover: "hover:border-blue-300",
      title: "I\u2019m a Landlord",
      description:
        "Manage properties, review leases, stay compliant with DC & MD law",
      badge: "FREE TO START",
      badgeStyle: "bg-slate-50 text-slate-500 border-slate-200",
    },
    {
      id: "pm",
      icon: Building2,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      borderHover: "hover:border-violet-300",
      title: "I\u2019m a Property Manager",
      description:
        "Portfolio management, team access, bulk compliance tools",
      badge: null as string | null,
      badgeStyle: "",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <MainNav />
      <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#1e3a5f] flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <h1
            className="text-2xl font-bold text-slate-900 mt-4"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Welcome to RentWise
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            How will you use RentWise? This helps us show you the right tools.
          </p>
        </div>

        {/* Role cards */}
        <div className="space-y-3">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full bg-white border-2 rounded-xl p-5 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-[#1e3a5f] shadow-md shadow-[#1e3a5f]/10"
                    : `border-slate-200 ${role.borderHover} hover:shadow-sm`
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl ${role.iconBg} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`w-5 h-5 ${role.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {role.title}
                      </span>
                      {role.badge && (
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${role.badgeStyle}`}
                        >
                          {role.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {role.description}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-[#1e3a5f] flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={!selectedRole || isSubmitting}
          className={`w-full flex items-center justify-center gap-2 mt-6 py-3.5 rounded-xl text-sm font-bold transition-all ${
            selectedRole
              ? "bg-[#1e3a5f] hover:bg-[#162d4a] text-white"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? "Setting up..." : "Continue"}
          {!isSubmitting && <ArrowRight className="w-4 h-4" />}
        </button>

        <p className="text-[10px] text-slate-400 text-center mt-4 leading-relaxed">
          You can change this later in your account settings.
        </p>
      </div>
      </div>
    </div>
  );
}
