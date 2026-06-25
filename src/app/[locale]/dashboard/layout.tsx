// app/[locale]/dashboard/layout.tsx

import { DashboardGuard } from '@/features/dashboard/components/dashboard-guard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardGuard>{children}</DashboardGuard>;
}
