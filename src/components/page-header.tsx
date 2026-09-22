import { requireUser } from "@/lib/session";
import { canWrite } from "@/lib/domain/permissions";

export function PageHeader({
  title,
  hint,
  actions,
}: {
  title: string;
  hint?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl text-white">{title}</h1>
        {hint ? <p className="mt-1 text-sm text-[#FFDDBB]">{hint}</p> : null}
      </div>
      <div className="flex flex-wrap gap-2">{actions}</div>
    </div>
  );
}

export function WriteGate({ role, children }: { role: "ADMIN" | "MEMBER" | "VIEWER"; children: React.ReactNode }) {
  if (!canWrite(role)) return null;
  return <>{children}</>;
}

export function requireUserSafe() {
  return requireUser();
}
