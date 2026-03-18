import Link from "next/link";
import { Shield, Bell } from "lucide-react";
import { AppFooterDisclaimer } from "@/components/ai-disclaimer-bar";
import { DashboardNav } from "@/components/portal/DashboardNav";
import { DashboardHeaderAuth } from "@/components/portal/DashboardHeaderAuth";
import { MainNav } from "@/components/navigation/main-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <div className="flex flex-1">
      {/* Sidebar */}
      <aside className="hidden w-[220px] shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col sticky top-0 h-screen">
        <Link
          href="/"
          className="flex h-16 items-center gap-2 border-b border-slate-100 px-5 hover:opacity-90"
        >
          <Shield className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-bold text-slate-900">RentWise</span>
        </Link>
        <DashboardNav />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col bg-slate-50">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2 lg:hidden hover:opacity-90">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-slate-900">RentWise</span>
          </Link>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <Link href="/dashboard/notifications">
              <Bell className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
            </Link>
            <DashboardHeaderAuth />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>

        {/* AI Disclaimer Footer */}
        <AppFooterDisclaimer />
      </div>
      </div>
    </div>
  );
}
