import { requireUser } from "@/lib/session";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { MobileNav } from "@/components/mobile-nav";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <Sidebar name={user.name} role={user.role} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <Topbar />
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
