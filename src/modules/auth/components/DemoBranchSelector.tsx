"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LoaderCircle, MapPin } from "lucide-react";
import { switchDemoBranch } from "../actions/demo-branch";
import { demoBranches } from "@/shared/lib/demo-branches";

export function DemoBranchSelector({ activeBranchId }: { activeBranchId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const activeBranch = demoBranches.find((branch) => branch.id === activeBranchId) ?? demoBranches[0];

  function changeBranch(branchId: string) {
    startTransition(async () => {
      await switchDemoBranch(branchId);
      router.refresh();
    });
  }

  return <div className="flex min-w-0 flex-1 items-center gap-2">
    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-sky-50 text-xs font-semibold text-sky-700">{activeBranch.name.slice(0, 2).toUpperCase()}</div>
    <div className="min-w-0 flex-1"><label htmlFor="demo-branch" className="sr-only">Select demo branch</label><select id="demo-branch" value={activeBranch.id} disabled={pending} onChange={(event) => changeBranch(event.target.value)} className="w-full cursor-pointer appearance-none truncate bg-transparent pr-4 text-xs font-semibold text-slate-800 outline-none"><optgroup label="Demo branches">{demoBranches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</optgroup></select><p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-slate-400"><MapPin size={10} />{activeBranch.location}</p></div>
    {pending ? <LoaderCircle size={14} className="shrink-0 animate-spin text-sky-700" /> : <ChevronDown size={14} className="shrink-0 text-slate-400" />}
  </div>;
}
