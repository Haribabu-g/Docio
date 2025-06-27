"use client";
import { useUser } from "@clerk/nextjs";
import { Badge, CreditCard } from "lucide-react";

export default function ClientBadge() {
  const { user } = useUser();

  if (!user || user?.role === "ADMIN") return null;

  const credits = user?.unsafeMetadata?.credits || 0;

  return (
    <Badge
      variant="outline"
      className="h-9 bg-emerald-900/20 border-emerald-700/30 px-3 py-1 flex items-center gap-2"
    >
      <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
      <span className="text-emerald-400">
        {credits}{" "}
        <span className="hidden md:inline">
          {user.role === "PATIENT" ? "Credits" : "Earned Credits"}
        </span>
      </span>
    </Badge>
  );
}
