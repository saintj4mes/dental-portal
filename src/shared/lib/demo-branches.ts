export const demoBranches = [
  { id: "00000000-0000-4000-8000-000000000001", name: "Smile Dental Studio", location: "Pasig City" },
  { id: "00000000-0000-4000-8000-00000000000a", name: "Dentalpin North", location: "Quezon City" },
  { id: "00000000-0000-4000-8000-00000000000b", name: "Dentalpin South", location: "Makati City" },
] as const;

export const demoClinicId = demoBranches[0].id;
export const demoBranchCookie = "dental_demo_branch";

export function demoEntityId(branchIndex: number, sequence: number): string {
  return `00000000-0000-4000-8000-${String(branchIndex).padStart(4, "0")}${String(sequence).padStart(8, "0")}`;
}
