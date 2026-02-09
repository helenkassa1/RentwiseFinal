import { TenantShell } from "@/components/tenant/TenantShell";

export default function TenantPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TenantShell>{children}</TenantShell>;
}
