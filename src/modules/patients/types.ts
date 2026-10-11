export interface PatientListItem {
  id: string; name: string; mobileNumber: string; email: string | null; lastVisit: string | null;
  nextAppointment: string | null; alerts: string[]; seniorPwd: boolean;
}
