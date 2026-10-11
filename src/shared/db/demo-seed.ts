import "server-only";
import { db } from "@/shared/db";
import { demoBranches, demoClinicId, demoEntityId } from "@/shared/lib/demo-branches";

export { demoClinicId } from "@/shared/lib/demo-branches";

type DemoGlobal = typeof globalThis & { demoWorkspaceSetups?: Map<string, Promise<void>> };

export async function ensureDemoWorkspace(clinicId: string = demoClinicId): Promise<void> {
  const root = globalThis as DemoGlobal;
  const setups = root.demoWorkspaceSetups ?? new Map<string, Promise<void>>();
  root.demoWorkspaceSetups = setups;
  const existingSetup = setups.get(clinicId);
  if (existingSetup) return existingSetup;
  const setup = seedDemoWorkspace(clinicId);
  setups.set(clinicId, setup);
  try {
    await setup;
  } catch (error: unknown) {
    setups.delete(clinicId);
    throw error;
  }
}

async function seedDemoWorkspace(clinicId: string): Promise<void> {
  const branchIndex = Math.max(0, demoBranches.findIndex((branch) => branch.id === clinicId));
  const id = (sequence: number) => demoEntityId(branchIndex, sequence);
  const patientIds = [101, 102, 103, 104, 105, 106].map(id);
  const treatmentIds = [31, 32, 33, 34].map(id);
  const ownerId = id(2);
  const dentistId = id(3);
  const branch = demoBranches.find((entry) => entry.id === clinicId) ?? demoBranches[0];
  if (await db.workspaceRecord.findUnique({ where: { id: id(699) }, select: { id: true } })) return;
  await db.clinic.upsert({
    where: { id: clinicId },
    update: {},
    create: { id: clinicId, name: branch.name, address: `Dentalpin ${branch.location}`, contactNumber: "+63 2 8555 0123", isVatRegistered: false },
  });

  await Promise.all([
    db.user.upsert({ where: { id: ownerId }, update: {}, create: { id: ownerId, clinicId, name: "Dr. Maria Cruz", email: `maria.cruz.${branchIndex}@demo.dental`, role: "OWNER", prcLicenseNumber: "0123456" } }),
    db.user.upsert({ where: { id: dentistId }, update: {}, create: { id: dentistId, clinicId, name: "Dr. Adrian Lim", email: `adrian.lim.${branchIndex}@demo.dental`, role: "DENTIST", prcLicenseNumber: "0654321" } }),
  ]);
  const chairs = await Promise.all(
    ["Operatory 1", "Operatory 2", "Surgical suite"].map((name) =>
      db.dentalChair.upsert({
        where: { clinicId_name: { clinicId, name } },
        update: { isActive: true },
        create: { clinicId, name },
      }),
    ),
  );

  const patients = [
    { id: patientIds[0]!, firstName: "Sofia", lastName: "Reyes", mobileNumber: "09171234567", email: "sofia.reyes@email.com", alerts: [], seniorPwdId: null },
    { id: patientIds[1]!, firstName: "Miguel", lastName: "Santos", mobileNumber: "09182345678", email: "miguel.santos@email.com", alerts: ["Latex allergy"], seniorPwdId: null },
    { id: patientIds[2]!, firstName: "Isabella", lastName: "Lim", mobileNumber: "09193456789", email: "isabella.lim@email.com", alerts: [], seniorPwdId: null },
    { id: patientIds[3]!, firstName: "Gabriel", lastName: "Tan", mobileNumber: "09204567891", email: "gabriel.tan@email.com", alerts: ["Hypertension"], seniorPwdId: null },
    { id: patientIds[4]!, firstName: "Amelia", lastName: "Dizon", mobileNumber: "09215678912", email: "amelia.dizon@email.com", alerts: [], seniorPwdId: "SC-DEMO-0001" },
    { id: patientIds[5]!, firstName: "Noah", lastName: "Garcia", mobileNumber: "09226789123", email: "noah.garcia@email.com", alerts: [], seniorPwdId: null },
  ];
  await Promise.all(patients.map((patient) => db.patient.upsert({
    where: { id: patient.id },
    update: {},
    create: { id: patient.id, clinicId, firstName: patient.firstName, lastName: patient.lastName, mobileNumber: patient.mobileNumber, email: patient.email, medicalAlerts: patient.alerts, seniorPwdId: patient.seniorPwdId },
  })));

  const treatments = [
    { id: treatmentIds[0]!, category: "Preventive", name: "Cleaning & polishing", defaultPrice: "1500.00" },
    { id: treatmentIds[1]!, category: "Restorative", name: "Composite restoration", defaultPrice: "2500.00" },
    { id: treatmentIds[2]!, category: "Endodontics", name: "Root canal treatment", defaultPrice: "12000.00" },
    { id: treatmentIds[3]!, category: "Diagnostics", name: "Comprehensive consultation", defaultPrice: "800.00" },
  ];
  const treatmentRows = await Promise.all(treatments.map((treatment) => db.treatment.upsert({
    where: { clinicId_name: { clinicId, name: treatment.name } },
    update: {},
    create: { ...treatment, clinicId },
  })));

  const now = new Date();
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  const appointmentSlots = [
    { id: id(201), patientId: patientIds[0]!, dentistId: ownerId, chairId: chairs[0]!.id, start: "09:00", duration: 60, reason: "Cleaning & polishing" },
    { id: id(202), patientId: patientIds[1]!, dentistId, chairId: chairs[1]!.id, start: "10:30", duration: 45, reason: "Consultation" },
    { id: id(203), patientId: patientIds[2]!, dentistId: ownerId, chairId: chairs[0]!.id, start: "11:15", duration: 60, reason: "Tooth restoration · #26" },
    { id: id(204), patientId: patientIds[3]!, dentistId, chairId: chairs[2]!.id, start: "13:00", duration: 90, reason: "Root canal treatment" },
    { id: id(205), patientId: patientIds[4]!, dentistId: ownerId, chairId: chairs[1]!.id, start: "14:15", duration: 45, reason: "Follow-up" },
  ];
  await Promise.all(appointmentSlots.map((slot) => {
    const startTime = new Date(`${day}T${slot.start}:00+08:00`);
    return db.appointment.upsert({
      where: { id: slot.id },
      update: {},
      create: { id: slot.id, clinicId, patientId: slot.patientId, dentistId: slot.dentistId, chairId: slot.chairId, startTime, endTime: new Date(startTime.getTime() + slot.duration * 60_000), reason: slot.reason, status: "CONFIRMED" },
    });
  }));

  await seedBranchRecords({ clinicId, branchIndex, branchLocation: branch.location, id, patientIds, treatmentIds: treatmentRows.map((treatment) => treatment.id), dentistId, appointmentSlots, now });
}

async function seedBranchRecords(input: {
  clinicId: string;
  branchIndex: number;
  branchLocation: string;
  id: (sequence: number) => string;
  patientIds: string[];
  treatmentIds: string[];
  dentistId: string;
  appointmentSlots: { id: string; patientId: string; dentistId: string; chairId: string; start: string; duration: number; reason: string }[];
  now: Date;
}): Promise<void> {
  const { clinicId, branchIndex, branchLocation, id, patientIds, treatmentIds, dentistId, appointmentSlots, now } = input;
  const patientId = patientIds[0]!;
  const secondPatientId = patientIds[1]!;
  const date = (offsetDays: number) => new Date(now.getTime() + offsetDays * 86_400_000);
  const dayStart = (offsetDays: number) => {
    const value = date(offsetDays);
    value.setUTCHours(0, 0, 0, 0);
    return value;
  };

  await Promise.all([
    db.toothRecord.upsert({ where: { patientId_toothNumber: { patientId, toothNumber: 11 } }, update: {}, create: { patientId, toothNumber: 11, overallStatus: "HEALTHY" } }),
    db.toothRecord.upsert({ where: { patientId_toothNumber: { patientId, toothNumber: 26 } }, update: {}, create: { patientId, toothNumber: 26, overallStatus: "CROWN" } }),
    db.toothRecord.upsert({ where: { patientId_toothNumber: { patientId, toothNumber: 36 } }, update: {}, create: { patientId, toothNumber: 36, overallStatus: "ENDO_TREATED" } }),
    db.clinicalNote.upsert({ where: { id: id(301) }, update: {}, create: { id: id(301), patientId, dentistId, appointmentId: appointmentSlots[0]!.id, subjective: "Sensitivity when drinking cold water for one week.", objective: "No swelling. Existing restoration intact; tooth 26 responds to cold.", assessment: "Reversible pulpitis, tooth 26.", plan: "Monitor symptoms and review in two weeks.", toothNumbers: [26] } }),
    db.treatmentPlan.upsert({ where: { id: id(302) }, update: {}, create: { id: id(302), clinicId, patientId, dentistId, title: "Restorative care plan", status: "PRESENTED", items: { create: [{ treatmentId: treatmentIds[1], name: "Composite restoration", toothNumbers: [26], quantity: 1, unitPrice: "2500.00" }, { treatmentId: treatmentIds[0], name: "Cleaning & polishing", toothNumbers: [], quantity: 1, unitPrice: "1500.00" }] } } }),
  ]);

  const prescriptionNumber = `RX-${branchIndex + 1}-0001`;
  await db.prescription.upsert({
    where: { clinicId_prescriptionNumber: { clinicId, prescriptionNumber } },
    update: {},
    create: { id: id(303), clinicId, patientId, dentistId, prescriptionNumber, issuedAt: now, validUntil: dayStart(14), diagnosis: "Post-operative dental pain", notes: "Take with food. Do not exceed the prescribed dose.", status: "ISSUED", items: { create: [{ medication: "Ibuprofen", strength: "200 mg", dosage: "1 tablet", frequency: "Every 6 hours as needed", duration: "3 days", quantity: "12 tablets", instructions: "Avoid if allergic to NSAIDs." }] } },
  });

  const invoiceNumber = `INV-DEMO-${branchIndex + 1}-001`;
  const invoice = await db.invoice.upsert({
    where: { clinicId_invoiceNumber: { clinicId, invoiceNumber } },
    update: {},
    create: { id: id(304), clinicId, patientId, appointmentId: appointmentSlots[0]!.id, invoiceNumber, subtotal: "2500.00", patientDueAmount: "2000.00", paymentStatus: "PARTIAL", hmoProvider: "Maxicare", hmoClaimStatus: "PENDING", hmoCoveredAmount: "500.00", lineItems: { create: [{ description: "Composite restoration, tooth 26", quantity: 1, unitPrice: "2500.00", total: "2500.00" }] } },
  });
  const paymentNumber = `OR-${String(branchIndex + 1).padStart(2, "0")}-0001`;
  await db.payment.upsert({ where: { clinicId_orNumber: { clinicId, orNumber: paymentNumber } }, update: {}, create: { id: id(305), clinicId, invoiceId: invoice.id, amount: "1000.00", paymentMethod: "GCASH", referenceNumber: `DEMO-${branchIndex + 1}-GCASH`, orNumber: paymentNumber } });
  const clinicCounters = await db.clinic.findUnique({ where: { id: clinicId }, select: { currentReceiptNumber: true } });
  if (clinicCounters && clinicCounters.currentReceiptNumber < 2) await db.clinic.update({ where: { id: clinicId }, data: { currentReceiptNumber: 2 } });

  const workspaceExamples = [
    { seq: 601, module: "contacts", title: "BrightSmile Dental Supply", details: "Preferred referral and supply contact. Call before placing the next order.", status: "ACTIVE", reference: "09175550123", amount: null, due: 3 },
    { seq: 602, module: "leads", title: "Paolo Mendoza", details: "Asked about an initial consultation and whitening options.", status: "CONTACTED", reference: "Website enquiry", amount: null, due: 1 },
    { seq: 603, module: "documents", title: "Post-operative care instructions", details: "Patient handout template reviewed by the clinical team.", status: "READY", reference: "DOC-POST-OP", amount: null, due: null },
    { seq: 604, module: "imaging", title: "Bitewing radiographs", details: "Bilateral bitewing study for routine caries review.", status: "REVIEWED", reference: "Patient: Sofia Reyes", amount: null, due: null },
    { seq: 605, module: "treatment-consumables", title: "Composite resin shade A2", details: "Restorative material used during the sample treatment.", status: "LOGGED", reference: "SKU: RES-A2", amount: 850, due: 0 },
    { seq: 606, module: "accounting-export", title: "Monthly collections export", details: "Sample CSV prepared for bookkeeping review.", status: "PREPARED", reference: `2026-${String(now.getMonth() + 1).padStart(2, "0")}`, amount: 3500, due: 2 },
    { seq: 607, module: "treasury", title: "Gcash settlement", details: "Daily digital collections ready for bank reconciliation.", status: "RECORDED", reference: `DEP-${branchIndex + 1}-018`, amount: 1000, due: 0 },
    { seq: 608, module: "attendance", title: "Dr. Adrian Lim", details: "Morning shift, 8:30 AM to 5:30 PM.", status: "PRESENT", reference: "DENTIST", amount: null, due: 0 },
    { seq: 609, module: "tasks", title: "Confirm tomorrow's lab delivery", details: "Check the crown shade and delivery schedule with the laboratory.", status: "OPEN", reference: "Front desk", amount: null, due: 1 },
    { seq: 610, module: "journal", title: "Demo workspace opened", details: "Sample activity record for checking the clinic journal.", status: "RECORDED", reference: "SYSTEM", amount: null, due: 0 },
    { seq: 611, module: "expenses", title: "Dental supplies restock", details: "Sample supplier invoice for everyday consumables.", status: "RECORDED", reference: "EXP-DEMO-001", amount: 2850, due: -2 },
    { seq: 612, module: "recalls", title: "Sofia Reyes · six-month cleaning", details: "Follow up to arrange the patient's next preventive visit.", status: "DUE", reference: "Patient recall", amount: null, due: 5 },
    { seq: 613, module: "periodontogram", title: "Baseline periodontal screening", details: "Six-site pocket depth sample recorded for tooth 26.", status: "REVIEWED", reference: "Patient: Sofia Reyes", amount: null, due: 0 },
  ] as const;
  await Promise.all(workspaceExamples.map((record) => db.workspaceRecord.upsert({
    where: { id: id(record.seq) },
    update: {},
    create: { id: id(record.seq), clinicId, module: record.module, title: record.title, details: record.details, status: record.status, reference: record.reference, amount: record.amount, dueAt: record.due === null ? null : dayStart(record.due) },
  })));

  const inventoryRows = await Promise.all([
    { seq: 401, sku: "PPE-001", name: "Nitrile examination gloves", category: "PPE", unit: "box", quantityOnHand: "18.00", reorderLevel: "10.00", unitCost: "420.00" },
    { seq: 402, sku: "REST-026", name: "Composite resin, shade A2", category: "Restorative", unit: "syringe", quantityOnHand: "4.00", reorderLevel: "5.00", unitCost: "850.00" },
    { seq: 403, sku: "PREV-010", name: "Fluoride varnish", category: "Preventive", unit: "box", quantityOnHand: "12.00", reorderLevel: "4.00", unitCost: "1200.00" },
  ].map(({ seq, ...item }) => db.inventoryItem.upsert({ where: { id: id(seq) }, update: {}, create: { ...item, id: id(seq), clinicId, expiresAt: dayStart(180) } })));
  await Promise.all(inventoryRows.map((item, index) => db.stockMovement.upsert({ where: { id: id(410 + index) }, update: {}, create: { id: id(410 + index), clinicId, itemId: item.id, kind: index === 1 ? "USE" : "RECEIVE", quantity: index === 1 ? "2.00" : "20.00", unitCost: item.unitCost, reference: `DEMO-STOCK-${branchIndex + 1}`, note: index === 1 ? "Used for sample patient treatment." : "Opening demo stock." } })));

  const supplier = await db.supplier.upsert({ where: { clinicId_name: { clinicId, name: "BrightSmile Dental Supply" } }, update: {}, create: { id: id(420), clinicId, name: "BrightSmile Dental Supply", contactName: "Rina Santos", mobileNumber: "09175550123", email: `orders.${branchIndex + 1}@brightsmile.example`, address: branchLocation } });
  await db.purchaseOrder.upsert({ where: { clinicId_orderNumber: { clinicId, orderNumber: `PO-DEMO-${branchIndex + 1}-001` } }, update: {}, create: { id: id(421), clinicId, supplierId: supplier.id, orderNumber: `PO-DEMO-${branchIndex + 1}-001`, status: "PART_RECEIVED", expectedAt: dayStart(2), notes: "Sample order for testing partial receiving.", lines: { create: [{ id: id(422), itemId: inventoryRows[1]!.id, quantityOrdered: "8.00", quantityReceived: "3.00", unitCost: "850.00" }, { id: id(423), itemId: inventoryRows[2]!.id, quantityOrdered: "4.00", quantityReceived: "0.00", unitCost: "1200.00" }] } } });

  await db.labOrder.upsert({ where: { clinicId_orderNumber: { clinicId, orderNumber: `LAB-DEMO-${branchIndex + 1}-001` } }, update: {}, create: { id: id(430), clinicId, patientId: secondPatientId, orderNumber: `LAB-DEMO-${branchIndex + 1}-001`, laboratory: "Pacific Dental Laboratory", appliance: "Porcelain crown", toothNumbers: [36], shade: "A2", status: "IN_PROGRESS", dueAt: dayStart(4), cost: "4800.00", instructions: "Confirm margin fit before glazing." } });
  const orthoCase = await db.orthodonticCase.upsert({ where: { id: id(431) }, update: {}, create: { id: id(431), clinicId, patientId: patientIds[2]!, title: "Comprehensive alignment", appliance: "Ceramic braces", status: "ACTIVE", startedAt: dayStart(-70), targetEndAt: dayStart(290), notes: "Monthly adjustment visits.", visits: { create: [{ id: id(432), visitedAt: dayStart(-30), procedure: "Archwire adjustment", notes: "Good alignment progress.", nextVisitAt: dayStart(1) }] } } });
  void orthoCase;

  await db.periodontalExam.upsert({ where: { id: id(440) }, update: {}, create: { id: id(440), clinicId, patientId, examinedAt: now, notes: "Baseline periodontal screening.", sites: { create: ["MB", "B", "DB", "ML", "L", "DL"].map((site, index) => ({ toothNumber: 26, site, pocketDepth: index === 2 ? 4 : 2, recession: 0, bleeding: index === 2, mobility: 0, furcation: 0 })) } } });

  const budgetNumber = `EST-DEMO-${branchIndex + 1}-001`;
  await db.treatmentBudget.upsert({ where: { clinicId_budgetNumber: { clinicId, budgetNumber } }, update: {}, create: { id: id(450), clinicId, patientId, budgetNumber, publicToken: id(451), title: "Recommended restorative care", status: "PRESENTED", subtotal: "4000.00", total: "4000.00", validUntil: dayStart(30), patientNotes: "Estimate for the recommended cleaning and restoration.", items: { create: [{ id: id(452), name: "Composite restoration", toothNumbers: [26], quantity: 1, unitPrice: "2500.00", lineTotal: "2500.00" }, { id: id(453), name: "Cleaning & polishing", toothNumbers: [], quantity: 1, unitPrice: "1500.00", lineTotal: "1500.00" }] } } });

  await db.payrollPeriod.upsert({ where: { id: id(460) }, update: {}, create: { id: id(460), clinicId, name: "Semi-monthly demo payroll", periodStart: dayStart(-14), periodEnd: dayStart(-1), payDate: dayStart(5), status: "REVIEW", entries: { create: [{ id: id(461), staffName: "Dr. Adrian Lim", daysWorked: "12.00", dailyRate: "3500.00", overtimeHours: "2.00", overtimeRate: "650.00", commission: "4500.00", allowances: "1500.00", sssContribution: "1350.00", philhealthContribution: "525.00", pagibigContribution: "200.00", withholdingTax: "1200.00", deductions: "0.00", grossPay: "49200.00", netPay: "45925.00" }, { id: id(462), staffName: "Ana Dela Cruz", daysWorked: "12.00", dailyRate: "900.00", overtimeHours: "1.50", overtimeRate: "170.00", commission: "0.00", allowances: "500.00", sssContribution: "405.00", philhealthContribution: "135.00", pagibigContribution: "100.00", withholdingTax: "0.00", deductions: "0.00", grossPay: "11655.00", netPay: "11015.00" }] } } });

  await db.publicBookingRequest.upsert({ where: { id: id(470) }, update: {}, create: { id: id(470), clinicId, patientName: "Lara Villanueva", mobileNumber: "09187654321", email: "lara.villanueva@example.com", requestedAt: date(1), reason: "New patient consultation", status: "PENDING" } });
  await db.publicBookingRequest.upsert({ where: { id: id(471) }, update: {}, create: { id: id(471), clinicId, patientId: patientIds[5]!, patientName: "Noah Garcia", mobileNumber: "09226789123", requestedAt: date(2), reason: "Routine cleaning", status: "PENDING" } });

  await Promise.all([
    db.patientRelationship.upsert({ where: { id: id(480) }, update: {}, create: { id: id(480), clinicId, patientId, name: "Elena Reyes", relationship: "Mother", mobileNumber: "09176661234", isEmergencyContact: true, isGuardian: false } }),
    db.patientEvent.upsert({ where: { id: id(481) }, update: {}, create: { id: id(481), clinicId, patientId, eventType: "VISIT", title: "Initial examination", detail: "Comprehensive oral health assessment completed.", occurredAt: date(-14) } }),
    db.patientCommunication.upsert({ where: { id: id(482) }, update: {}, create: { id: id(482), clinicId, patientId, channel: "PHONE", direction: "OUTBOUND", subject: "Recall reminder", summary: "Patient confirmed a follow-up visit.", outcome: "CONFIRMED", followUpAt: date(1), occurredAt: date(-2) } }),
  ]);

  await db.workspaceRecord.upsert({ where: { id: id(699) }, update: {}, create: { id: id(699), clinicId, module: "demo-seed", title: "Demo data version 1", details: "Idempotency marker for the sample clinic dataset.", status: "READY" } });
}
