import type { PatientListItem } from "../types";

export const demoPatientId = "00000000-0000-4000-8000-000000000101";
export const demoPatients: PatientListItem[] = [
  { id: demoPatientId, name: "Sofia Reyes", mobileNumber: "09171234567", email: "sofia.reyes@email.com", lastVisit: "Oct 07, 2026", nextAppointment: "Today, 9:00 AM", alerts: [], seniorPwd: false },
  { id: "00000000-0000-4000-8000-000000000102", name: "Miguel Santos", mobileNumber: "09182345678", email: "miguel.santos@email.com", lastVisit: "Sep 28, 2026", nextAppointment: "Today, 10:30 AM", alerts: ["Latex allergy"], seniorPwd: false },
  { id: "00000000-0000-4000-8000-000000000103", name: "Isabella Lim", mobileNumber: "09193456789", email: "isabella.lim@email.com", lastVisit: "Oct 02, 2026", nextAppointment: "Today, 11:15 AM", alerts: [], seniorPwd: false },
  { id: "00000000-0000-4000-8000-000000000104", name: "Gabriel Tan", mobileNumber: "09204567891", email: "gabriel.tan@email.com", lastVisit: "Sep 11, 2026", nextAppointment: "Today, 1:00 PM", alerts: ["Hypertension"], seniorPwd: false },
  { id: "00000000-0000-4000-8000-000000000105", name: "Amelia Dizon", mobileNumber: "09215678912", email: "amelia.dizon@email.com", lastVisit: "Aug 30, 2026", nextAppointment: "Oct 14, 2:00 PM", alerts: [], seniorPwd: true },
  { id: "00000000-0000-4000-8000-000000000106", name: "Noah Garcia", mobileNumber: "09226789123", email: "noah.garcia@email.com", lastVisit: "Sep 19, 2026", nextAppointment: null, alerts: [], seniorPwd: false },
];
