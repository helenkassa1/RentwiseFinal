import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Shield, Bell } from "lucide-react";
import { AIDisclaimerBar } from "@/components/ai-disclaimer-bar";
import { DashboardNav } from "@/components/portal/DashboardNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-slate-50 lg:block">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">RentWise</span>
        </div>
        <DashboardNav />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b px-4 lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold">RentWise</span>
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <Link href="/dashboard/notifications">
              <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>

        {/* AI Disclaimer Footer */}
        <AIDisclaimerBar />
      </div>
    </div>
  );
}
