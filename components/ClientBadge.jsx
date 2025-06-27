{/**"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Badge, CreditCard } from "lucide-react";

export default function ClientBadge() {
  const { user } =  useUser();

const role = user?.publicMetadata?.role || user?.unsafeMetadata?.role;

  const credits = user?.unsafeMetadata?.credits || 0;
console.log("Client user role:", user?.publicMetadata?.role);
console.log("Client user data:", user);
console.log("Role from metadata:", user?.publicMetadata?.role);


  if (!user || role === "ADMIN") return null;

  return (
    <Link href={role === "PATIENT" ? "/pricing" : "/doctor"}>
      <Badge
        variant="outline"
        className="h-9 bg-emerald-900/20 border-emerald-700/30 px-3 py-1 flex items-center gap-2"
      >
        <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
        <span className="text-emerald-400">
          {credits}{" "}
          <span className="hidden md:inline">
            {role === "PATIENT" ? "Credits" : "Earned Credits"}
          </span>
        </span>
      </Badge>
    </Link>
  );
}
**/}


"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Badge, CreditCard } from "lucide-react";

export default function ClientBadge() {
  const { user } = useUser();

  const role = user?.publicMetadata?.role || user?.unsafeMetadata?.role;
  const credits = user?.unsafeMetadata?.credits || 0;

  if (!user || typeof role !== "string" || role === "ADMIN") return null;

  return (
    <Link href={role === "DOCTOR" ? "/doctor" : "/pricing"}>
      <Badge
        variant="outline"
        className="h-9 bg-emerald-900/20 border-emerald-700/30 px-3 py-1 flex items-center gap-2"
      >
        <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
        <span className="text-emerald-400">
          {credits}{" "}
          <span className="hidden md:inline">
            {role === "PATIENT" ? "Credits" : "Earned Credits"}
          </span>
        </span>
      </Badge>
    </Link>
  );
}
