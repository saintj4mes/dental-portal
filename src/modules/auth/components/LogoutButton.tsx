"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "../actions/login";
export function LogoutButton() { const router = useRouter(); return <button onClick={async () => { await logout(); router.replace("/login"); router.refresh(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800"><LogOut size={18} /> Sign out</button>; }
