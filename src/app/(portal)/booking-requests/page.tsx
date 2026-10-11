import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { BookingRequestQueue } from "@/modules/booking/components/BookingRequestQueue";

export const dynamic = "force-dynamic";

export default async function BookingRequestsPage() {
  const clinicId = await getClinicId();
  const [requests, dentists, chairs] = await Promise.all([
    db.publicBookingRequest.findMany({ where: { clinicId, status: "PENDING" }, orderBy: { requestedAt: "asc" }, take: 100 }),
    db.user.findMany({ where: { clinicId, role: "DENTIST" }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.dentalChair.findMany({ where: { clinicId, isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  return <BookingRequestQueue requests={requests.map((request) => ({ id: request.id, patientName: request.patientName, mobileNumber: request.mobileNumber, email: request.email, requestedAt: request.requestedAt.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" }), reason: request.reason, createdAt: request.createdAt.toLocaleDateString("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" }) }))} dentists={dentists} chairs={chairs} />;
}
