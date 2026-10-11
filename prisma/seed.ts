import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const clinicId = process.env.AUTH_CLINIC_ID ?? process.env.DEMO_CLINIC_ID ?? "00000000-0000-4000-8000-000000000001";
const dentistId = process.env.DEMO_DENTIST_ID ?? "00000000-0000-4000-8000-000000000002";
const ownerEmail = process.env.AUTH_EMAIL ?? "owner@example.ph";

async function main() {
  await prisma.clinic.upsert({ where: { id: clinicId }, update: {}, create: {
    id: clinicId, name: process.env.CLINIC_NAME ?? "Smile Dental Studio", taxId: process.env.CLINIC_TIN ?? null,
    address: process.env.CLINIC_ADDRESS ?? null, contactNumber: process.env.CLINIC_CONTACT_NUMBER ?? null,
    isVatRegistered: process.env.CLINIC_VAT_REGISTERED === "true",
  } });
  await prisma.user.upsert({ where: { id: dentistId }, update: { clinicId, name: process.env.CLINIC_OWNER_NAME ?? "Clinic Owner", email: ownerEmail, role: "OWNER" }, create: {
    id: dentistId, clinicId, name: process.env.CLINIC_OWNER_NAME ?? "Clinic Owner", email: ownerEmail, role: "OWNER",
  } });
  for (const name of ["Operatory 1", "Operatory 2", "Surgical suite"]) {
    await prisma.dentalChair.upsert({ where: { clinicId_name: { clinicId, name } }, update: { isActive: true }, create: { clinicId, name } });
  }
  const treatments = [
    { category: "Preventive", name: "Cleaning & polishing", defaultPrice: "1500.00" },
    { category: "Restorative", name: "Composite restoration", defaultPrice: "2500.00" },
    { category: "Endodontics", name: "Root canal treatment", defaultPrice: "12000.00" },
    { category: "Diagnostics", name: "Comprehensive consultation", defaultPrice: "800.00" },
  ];
  for (const treatment of treatments) {
    await prisma.treatment.upsert({ where: { clinicId_name: { clinicId, name: treatment.name } }, update: { defaultPrice: treatment.defaultPrice }, create: { ...treatment, clinicId } });
  }
  console.info(`Clinic workspace ${clinicId} is ready. Add patient records before booking visits.`);
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
