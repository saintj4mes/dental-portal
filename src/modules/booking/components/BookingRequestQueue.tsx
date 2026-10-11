"use client";

import { useTransition } from "react";
import { CalendarCheck2, X } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { approvePublicBooking, declinePublicBooking } from "../actions/booking";

type Option = { id: string; name: string };
type Request = { id: string; patientName: string; mobileNumber: string; email: string | null; requestedAt: string; reason: string | null; createdAt: string };
const selectClass = "h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs";

export function BookingRequestQueue({ requests, dentists, chairs }: { requests: Request[]; dentists: Option[]; chairs: Option[] }) {
  const [pending, startTransition] = useTransition();
  function approve(formData: FormData) { const data = Object.fromEntries(formData.entries()); startTransition(async () => { const result = await approvePublicBooking(data); if (result.success) location.reload(); else window.alert(result.error); }); }
  function decline(requestId: string) { startTransition(async () => { const result = await declinePublicBooking({ requestId }); if (result.success) location.reload(); else window.alert(result.error); }); }
  return <div className="space-y-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700">Patient access</p><h1 className="mt-1 text-xl font-semibold">Online booking requests</h1><p className="mt-1 text-xs text-slate-500">Review patient requests, assign an operatory and dentist, then confirm the visit.</p></div>{requests.map((request) => <Card key={request.id} className="p-4"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-sm font-semibold">{request.patientName}</h2><p className="mt-1 text-xs text-slate-500">{request.mobileNumber}{request.email ? ` · ${request.email}` : ""}</p><p className="mt-2 text-xs font-medium text-slate-700">Preferred: {request.requestedAt}</p>{request.reason && <p className="mt-1 text-xs text-slate-500">Reason: {request.reason}</p>}<p className="mt-1 text-[10px] text-slate-400">Requested {request.createdAt}</p></div><Button size="sm" variant="ghost" disabled={pending} onClick={() => decline(request.id)}><X size={14} /> Decline</Button></div><form action={approve} className="mt-4 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-[1fr_1fr_auto]"><input type="hidden" name="requestId" value={request.id} /><select name="dentistId" required className={selectClass}><option value="">Assign dentist</option>{dentists.map((dentist) => <option key={dentist.id} value={dentist.id}>{dentist.name}</option>)}</select><select name="chairId" required className={selectClass}><option value="">Assign operatory</option>{chairs.map((chair) => <option key={chair.id} value={chair.id}>{chair.name}</option>)}</select><Button size="sm" disabled={pending || !dentists.length || !chairs.length}><CalendarCheck2 size={14} /> Confirm appointment</Button></form></Card>)}{!requests.length && <Card className="p-10 text-center text-xs text-slate-400">There are no pending online requests.</Card>}</div>;
}
