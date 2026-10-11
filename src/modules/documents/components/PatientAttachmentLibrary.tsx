"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FileImage, FileText, LoaderCircle, Plus, ScanLine, Upload } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { getPatientAttachmentUrl, uploadPatientAttachment } from "../actions/attachments";

export interface PatientAttachmentView {
  id: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  category: string;
  caption: string | null;
  createdAt: string;
}

export function PatientAttachmentLibrary({ patientId, attachments }: { patientId: string; attachments: PatientAttachmentView[] }) {
  const [category, setCategory] = useState("CLINICAL_PHOTO");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeUrl, setActiveUrl] = useState("");
  const [activeFile, setActiveFile] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    const formElement = event.currentTarget;
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) { setError("Choose a file to upload."); return; }
    const caption = form.get("caption");
    startTransition(async () => {
      const result = await uploadPatientAttachment({ patientId, category, caption: typeof caption === "string" ? caption : "", file });
      if (!result.success) { setError(result.error); return; }
      setNotice(`${result.data.fileName} uploaded.`);
      formElement.reset();
      router.refresh();
    });
  }

  function view(id: string, fileName: string) {
    setError("");
    startTransition(async () => {
      const result = await getPatientAttachmentUrl({ id });
      if (!result.success) { setError(result.error); return; }
      setActiveFile(fileName);
      setActiveUrl(result.data.url);
    });
  }

  return <Card className="overflow-hidden">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border-subtle)] px-5 py-4"><div><h2 className="text-sm font-semibold text-slate-900">Files and imaging</h2><p className="mt-1 text-xs text-[#94908a]">Clinical photos, radiographs, and patient documents</p></div><Badge tone="neutral">{attachments.length} files</Badge></div>
    <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        {attachments.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{attachments.map((item) => <button type="button" onClick={() => view(item.id, item.fileName)} key={item.id} className="group overflow-hidden rounded-lg border border-[var(--color-border)] text-left transition hover:border-sky-300 hover:bg-sky-50/20" disabled={pending}>
          <div className="grid aspect-[4/3] place-items-center bg-[#f4f2ef] text-[#615d59]">{item.mimeType.startsWith("image/") ? <FileImage size={26} /> : item.mimeType === "application/dicom" ? <ScanLine size={26} /> : <FileText size={26} />}</div>
          <div className="p-3"><p className="truncate text-xs font-medium text-slate-900">{item.fileName}</p><div className="mt-2 flex items-center justify-between gap-2"><Badge tone={item.category === "RADIOGRAPH" ? "blue" : item.category === "DOCUMENT" ? "neutral" : "green"}>{item.category.replaceAll("_", " ").toLowerCase()}</Badge><span className="text-[10px] text-[#94908a]">{formatBytes(item.byteSize)}</span></div>{item.caption && <p className="mt-2 truncate text-[11px] text-[#615d59]">{item.caption}</p>}<p className="mt-1 text-[10px] text-[#94908a]">{new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" }).format(new Date(item.createdAt))}</p></div>
        </button>)}</div> : <div className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-10 text-center"><FileImage size={22} className="mx-auto text-[#94908a]" /><p className="mt-3 text-xs font-medium text-slate-900">No patient files yet</p><p className="mt-1 text-[11px] text-[#94908a]">Add clinical photos, radiographs, or care documents.</p></div>}
        {pending && <p className="mt-3 flex items-center gap-2 text-xs text-[#615d59]"><LoaderCircle size={14} className="animate-spin" /> Opening secure file…</p>}
        {activeUrl && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md bg-sky-50 px-3 py-2.5"><p className="truncate text-xs font-medium text-sky-900">{activeFile}</p><div className="flex items-center gap-3"><a href={activeUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-sky-800 underline">Open file</a><button type="button" onClick={() => { setActiveUrl(""); setActiveFile(""); }} className="text-xs text-sky-800">Close</button></div></div>}
      </div>
      <form onSubmit={upload} className="h-fit rounded-lg border border-[var(--color-border)] bg-[#fbfaf8] p-4">
        <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-md bg-sky-50 text-sky-700"><Upload size={15} /></span><div><h3 className="text-xs font-semibold text-slate-900">Upload a file</h3><p className="text-[10px] text-[#94908a]">Private to this clinic</p></div></div>
        <label className="mt-4 block text-[11px] font-medium text-[#615d59]">File type<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-[var(--color-border)] bg-white px-2.5 text-xs"><option value="CLINICAL_PHOTO">Clinical photo</option><option value="RADIOGRAPH">Radiograph / scan</option><option value="DOCUMENT">Patient document</option></select></label>
        <label className="mt-3 block text-[11px] font-medium text-[#615d59]">Choose file<input name="file" type="file" required accept="image/jpeg,image/png,image/webp,application/pdf,application/dicom" className="mt-1 block w-full rounded-md border border-[var(--color-border)] bg-white p-2 text-[11px] file:mr-2 file:rounded file:border-0 file:bg-sky-50 file:px-2 file:py-1 file:text-[10px] file:font-semibold file:text-sky-800" /><span className="mt-1 block text-[10px] font-normal text-[#94908a]">JPEG, PNG, WebP, PDF, or DICOM · up to 18 MB</span></label>
        <label className="mt-3 block text-[11px] font-medium text-[#615d59]">Caption (optional)<input name="caption" maxLength={500} className="mt-1 h-9 w-full rounded-md border border-[var(--color-border)] bg-white px-2.5 text-xs" placeholder="e.g. Pre-treatment periapical, tooth 36" /></label>
        {error && <p role="alert" className="mt-3 text-[11px] text-red-700">{error}</p>}{notice && <p role="status" className="mt-3 text-[11px] text-emerald-700">{notice}</p>}
        <Button type="submit" size="sm" disabled={pending} className="mt-4 w-full"><Plus size={14} /> {pending ? "Working…" : "Upload to patient record"}</Button>
        <p className="mt-3 text-[10px] leading-4 text-[#94908a]">Files are stored in the private clinic bucket and opened through short-lived signed links.</p>
      </form>
    </div>
  </Card>;
}

function formatBytes(value: number): string {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}
