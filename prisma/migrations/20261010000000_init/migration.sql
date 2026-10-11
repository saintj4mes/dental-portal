-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'DENTIST', 'RECEPTIONIST', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_CHAIR', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ToothStatus" AS ENUM ('HEALTHY', 'MISSING', 'IMPACTED', 'CROWN', 'BRIDGE', 'IMPLANT', 'EXTRACTION_INDICATED', 'ENDO_TREATED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('NONE', 'SENIOR_CITIZEN', 'PWD', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'GCASH', 'MAYA', 'BANK_TRANSFER', 'CARD');

-- CreateEnum
CREATE TYPE "HmoClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'REIMBURSED');

-- CreateEnum
CREATE TYPE "TreatmentPlanStatus" AS ENUM ('DRAFT', 'PRESENTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'DECLINED');

-- CreateEnum
CREATE TYPE "TreatmentItemStatus" AS ENUM ('PLANNED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "clinics" (
    "id" UUID NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "tax_id" VARCHAR(20),
    "address" TEXT,
    "contact_number" VARCHAR(20),
    "official_receipt_prefix" VARCHAR(12) NOT NULL DEFAULT 'OR',
    "current_receipt_number" INTEGER NOT NULL DEFAULT 0,
    "current_invoice_number" INTEGER NOT NULL DEFAULT 0,
    "current_purchase_order_number" INTEGER NOT NULL DEFAULT 0,
    "current_lab_order_number" INTEGER NOT NULL DEFAULT 0,
    "current_prescription_number" INTEGER NOT NULL DEFAULT 0,
    "is_vat_registered" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'DENTIST',
    "prc_license_number" VARCHAR(40),
    "ptr_number" VARCHAR(40),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "birth_date" DATE,
    "gender" VARCHAR(24),
    "mobile_number" VARCHAR(13) NOT NULL,
    "email" VARCHAR(255),
    "medical_alerts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "senior_pwd_id" VARCHAR(80),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dental_chairs" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "dental_chairs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "dentist_id" UUID NOT NULL,
    "chair_id" UUID NOT NULL,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tooth_records" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "tooth_number" INTEGER NOT NULL,
    "overall_status" "ToothStatus" NOT NULL DEFAULT 'HEALTHY',
    "surfaces" JSONB NOT NULL DEFAULT '{"mesial":"SOUND","distal":"SOUND","occlusal":"SOUND","buccal":"SOUND","lingual":"SOUND"}',
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tooth_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatments" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "category" VARCHAR(80) NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "default_price" DECIMAL(12,2) NOT NULL,
    "description" TEXT,

    CONSTRAINT "treatments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_notes" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "dentist_id" UUID NOT NULL,
    "appointment_id" UUID,
    "subjective" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "assessment" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "tooth_numbers" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinical_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "dentist_id" UUID NOT NULL,
    "prescription_number" VARCHAR(40) NOT NULL,
    "issued_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" DATE,
    "diagnosis" VARCHAR(500),
    "notes" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ISSUED',

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_items" (
    "id" UUID NOT NULL,
    "prescription_id" UUID NOT NULL,
    "medication" VARCHAR(180) NOT NULL,
    "strength" VARCHAR(80) NOT NULL,
    "dosage" VARCHAR(120) NOT NULL,
    "frequency" VARCHAR(120) NOT NULL,
    "duration" VARCHAR(80) NOT NULL,
    "quantity" VARCHAR(40) NOT NULL,
    "instructions" TEXT,

    CONSTRAINT "prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatment_plans" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "dentist_id" UUID NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "status" "TreatmentPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "treatment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatment_plan_items" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "treatment_id" UUID,
    "name" VARCHAR(180) NOT NULL,
    "tooth_numbers" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "status" "TreatmentItemStatus" NOT NULL DEFAULT 'PLANNED',

    CONSTRAINT "treatment_plan_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "appointment_id" UUID,
    "invoice_number" VARCHAR(40) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "is_vat_inclusive" BOOLEAN NOT NULL DEFAULT false,
    "vat_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_type" "DiscountType" NOT NULL DEFAULT 'NONE',
    "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "senior_pwd_id_snapshot" VARCHAR(80),
    "hmo_provider" VARCHAR(100),
    "hmo_approval_code" VARCHAR(100),
    "hmo_covered_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "hmo_claim_status" "HmoClaimStatus",
    "hmo_submitted_at" TIMESTAMPTZ(6),
    "patient_due_amount" DECIMAL(12,2) NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_line_items" (
    "id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "description" VARCHAR(180) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "reference_number" VARCHAR(100),
    "or_number" VARCHAR(40) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_records" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "module" VARCHAR(40) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "details" TEXT,
    "status" VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    "reference" VARCHAR(100),
    "amount" DECIMAL(12,2),
    "due_at" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "workspace_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_attachments" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "uploaded_by_id" UUID,
    "category" VARCHAR(30) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "byte_size" INTEGER NOT NULL,
    "object_key" VARCHAR(512) NOT NULL,
    "caption" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_relationships" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "relationship" VARCHAR(40) NOT NULL,
    "mobile_number" VARCHAR(20),
    "email" VARCHAR(255),
    "is_emergency_contact" BOOLEAN NOT NULL DEFAULT false,
    "is_guardian" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_events" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "event_type" VARCHAR(40) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "detail" TEXT,
    "source_id" UUID,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_communications" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "channel" VARCHAR(20) NOT NULL,
    "direction" VARCHAR(12) NOT NULL DEFAULT 'OUTBOUND',
    "subject" VARCHAR(180) NOT NULL,
    "summary" TEXT,
    "outcome" VARCHAR(40),
    "follow_up_at" TIMESTAMPTZ(6),
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_communications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "sku" VARCHAR(60),
    "name" VARCHAR(200) NOT NULL,
    "category" VARCHAR(60) NOT NULL,
    "unit" VARCHAR(30) NOT NULL DEFAULT 'unit',
    "quantity_on_hand" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "reorder_level" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "unit_cost" DECIMAL(12,2),
    "expires_at" DATE,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "kind" VARCHAR(20) NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "unit_cost" DECIMAL(12,2),
    "reference" VARCHAR(100),
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "contact_name" VARCHAR(180),
    "mobile_number" VARCHAR(20),
    "email" VARCHAR(255),
    "address" TEXT,
    "tin" VARCHAR(30),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "order_number" VARCHAR(40) NOT NULL,
    "status" VARCHAR(24) NOT NULL DEFAULT 'DRAFT',
    "expected_at" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received_at" TIMESTAMPTZ(6),

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_lines" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "quantity_ordered" DECIMAL(12,2) NOT NULL,
    "quantity_received" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "unit_cost" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "purchase_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_orders" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "order_number" VARCHAR(40) NOT NULL,
    "laboratory" VARCHAR(180) NOT NULL,
    "appliance" VARCHAR(120) NOT NULL,
    "tooth_numbers" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "shade" VARCHAR(40),
    "status" VARCHAR(24) NOT NULL DEFAULT 'DRAFT',
    "due_at" DATE,
    "cost" DECIMAL(12,2),
    "instructions" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received_at" TIMESTAMPTZ(6),

    CONSTRAINT "lab_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orthodontic_cases" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "appliance" VARCHAR(100) NOT NULL,
    "status" VARCHAR(24) NOT NULL DEFAULT 'ASSESSMENT',
    "started_at" DATE,
    "target_end_at" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orthodontic_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orthodontic_visits" (
    "id" UUID NOT NULL,
    "case_id" UUID NOT NULL,
    "visited_at" DATE NOT NULL,
    "procedure" VARCHAR(180) NOT NULL,
    "notes" TEXT,
    "next_visit_at" DATE,

    CONSTRAINT "orthodontic_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periodontal_exams" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "examined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "periodontal_exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periodontal_measurements" (
    "id" UUID NOT NULL,
    "exam_id" UUID NOT NULL,
    "tooth_number" INTEGER NOT NULL,
    "site" VARCHAR(4) NOT NULL,
    "pocket_depth" INTEGER NOT NULL,
    "recession" INTEGER NOT NULL DEFAULT 0,
    "bleeding" BOOLEAN NOT NULL DEFAULT false,
    "suppuration" BOOLEAN NOT NULL DEFAULT false,
    "mobility" INTEGER NOT NULL DEFAULT 0,
    "furcation" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "periodontal_measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatment_budgets" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "budget_number" VARCHAR(40) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "status" VARCHAR(24) NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "valid_until" DATE,
    "public_token" UUID NOT NULL,
    "patient_notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMPTZ(6),
    "accepted_by" VARCHAR(180),

    CONSTRAINT "treatment_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatment_budget_items" (
    "id" UUID NOT NULL,
    "budget_id" UUID NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "tooth_numbers" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "line_total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "treatment_budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_periods" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "pay_date" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_entries" (
    "id" UUID NOT NULL,
    "period_id" UUID NOT NULL,
    "staff_name" VARCHAR(180) NOT NULL,
    "days_worked" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "daily_rate" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "overtime_hours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "overtime_rate" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "commission" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "allowances" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "sss_contribution" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "philhealth_contribution" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pagibig_contribution" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "withholding_tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "deductions" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "gross_pay" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "net_pay" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "payroll_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_booking_requests" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "patient_id" UUID,
    "patient_name" VARCHAR(180) NOT NULL,
    "mobile_number" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255),
    "requested_at" TIMESTAMPTZ(6) NOT NULL,
    "reason" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "public_booking_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "users_clinic_id_idx" ON "users"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_clinic_id_email_key" ON "users"("clinic_id", "email");

-- CreateIndex
CREATE INDEX "patients_clinic_id_last_name_first_name_idx" ON "patients"("clinic_id", "last_name", "first_name");

-- CreateIndex
CREATE UNIQUE INDEX "dental_chairs_clinic_id_name_key" ON "dental_chairs"("clinic_id", "name");

-- CreateIndex
CREATE INDEX "appointments_clinic_id_start_time_idx" ON "appointments"("clinic_id", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "tooth_records_patient_id_tooth_number_key" ON "tooth_records"("patient_id", "tooth_number");

-- CreateIndex
CREATE INDEX "treatments_clinic_id_category_idx" ON "treatments"("clinic_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "treatments_clinic_id_name_key" ON "treatments"("clinic_id", "name");

-- CreateIndex
CREATE INDEX "clinical_notes_patient_id_created_at_idx" ON "clinical_notes"("patient_id", "created_at");

-- CreateIndex
CREATE INDEX "prescriptions_clinic_id_patient_id_issued_at_idx" ON "prescriptions"("clinic_id", "patient_id", "issued_at");

-- CreateIndex
CREATE UNIQUE INDEX "prescriptions_clinic_id_prescription_number_key" ON "prescriptions"("clinic_id", "prescription_number");

-- CreateIndex
CREATE INDEX "treatment_plans_clinic_id_patient_id_created_at_idx" ON "treatment_plans"("clinic_id", "patient_id", "created_at");

-- CreateIndex
CREATE INDEX "invoices_clinic_id_created_at_idx" ON "invoices"("clinic_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_clinic_id_invoice_number_key" ON "invoices"("clinic_id", "invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "payments_clinic_id_or_number_key" ON "payments"("clinic_id", "or_number");

-- CreateIndex
CREATE INDEX "workspace_records_clinic_id_module_status_idx" ON "workspace_records"("clinic_id", "module", "status");

-- CreateIndex
CREATE INDEX "workspace_records_clinic_id_module_created_at_idx" ON "workspace_records"("clinic_id", "module", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "patient_attachments_object_key_key" ON "patient_attachments"("object_key");

-- CreateIndex
CREATE INDEX "patient_attachments_clinic_id_patient_id_category_created_a_idx" ON "patient_attachments"("clinic_id", "patient_id", "category", "created_at");

-- CreateIndex
CREATE INDEX "patient_relationships_clinic_id_patient_id_idx" ON "patient_relationships"("clinic_id", "patient_id");

-- CreateIndex
CREATE INDEX "patient_events_clinic_id_patient_id_occurred_at_idx" ON "patient_events"("clinic_id", "patient_id", "occurred_at");

-- CreateIndex
CREATE INDEX "patient_communications_clinic_id_patient_id_occurred_at_idx" ON "patient_communications"("clinic_id", "patient_id", "occurred_at");

-- CreateIndex
CREATE INDEX "inventory_items_clinic_id_category_active_idx" ON "inventory_items"("clinic_id", "category", "active");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_clinic_id_sku_key" ON "inventory_items"("clinic_id", "sku");

-- CreateIndex
CREATE INDEX "stock_movements_clinic_id_item_id_created_at_idx" ON "stock_movements"("clinic_id", "item_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_clinic_id_name_key" ON "suppliers"("clinic_id", "name");

-- CreateIndex
CREATE INDEX "purchase_orders_clinic_id_status_created_at_idx" ON "purchase_orders"("clinic_id", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_clinic_id_order_number_key" ON "purchase_orders"("clinic_id", "order_number");

-- CreateIndex
CREATE INDEX "lab_orders_clinic_id_status_due_at_idx" ON "lab_orders"("clinic_id", "status", "due_at");

-- CreateIndex
CREATE UNIQUE INDEX "lab_orders_clinic_id_order_number_key" ON "lab_orders"("clinic_id", "order_number");

-- CreateIndex
CREATE INDEX "orthodontic_cases_clinic_id_patient_id_status_idx" ON "orthodontic_cases"("clinic_id", "patient_id", "status");

-- CreateIndex
CREATE INDEX "orthodontic_visits_case_id_visited_at_idx" ON "orthodontic_visits"("case_id", "visited_at");

-- CreateIndex
CREATE INDEX "periodontal_exams_clinic_id_patient_id_examined_at_idx" ON "periodontal_exams"("clinic_id", "patient_id", "examined_at");

-- CreateIndex
CREATE UNIQUE INDEX "periodontal_measurements_exam_id_tooth_number_site_key" ON "periodontal_measurements"("exam_id", "tooth_number", "site");

-- CreateIndex
CREATE UNIQUE INDEX "treatment_budgets_public_token_key" ON "treatment_budgets"("public_token");

-- CreateIndex
CREATE INDEX "treatment_budgets_clinic_id_status_created_at_idx" ON "treatment_budgets"("clinic_id", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "treatment_budgets_clinic_id_budget_number_key" ON "treatment_budgets"("clinic_id", "budget_number");

-- CreateIndex
CREATE INDEX "payroll_periods_clinic_id_period_start_idx" ON "payroll_periods"("clinic_id", "period_start");

-- CreateIndex
CREATE INDEX "public_booking_requests_clinic_id_status_requested_at_idx" ON "public_booking_requests"("clinic_id", "status", "requested_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dental_chairs" ADD CONSTRAINT "dental_chairs_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_dentist_id_fkey" FOREIGN KEY ("dentist_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_chair_id_fkey" FOREIGN KEY ("chair_id") REFERENCES "dental_chairs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tooth_records" ADD CONSTRAINT "tooth_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_dentist_id_fkey" FOREIGN KEY ("dentist_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_dentist_id_fkey" FOREIGN KEY ("dentist_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_dentist_id_fkey" FOREIGN KEY ("dentist_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_plan_items" ADD CONSTRAINT "treatment_plan_items_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "treatment_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_plan_items" ADD CONSTRAINT "treatment_plan_items_treatment_id_fkey" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_records" ADD CONSTRAINT "workspace_records_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_attachments" ADD CONSTRAINT "patient_attachments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_attachments" ADD CONSTRAINT "patient_attachments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_relationships" ADD CONSTRAINT "patient_relationships_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_relationships" ADD CONSTRAINT "patient_relationships_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_events" ADD CONSTRAINT "patient_events_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_events" ADD CONSTRAINT "patient_events_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_communications" ADD CONSTRAINT "patient_communications_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_communications" ADD CONSTRAINT "patient_communications_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orthodontic_cases" ADD CONSTRAINT "orthodontic_cases_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orthodontic_cases" ADD CONSTRAINT "orthodontic_cases_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orthodontic_visits" ADD CONSTRAINT "orthodontic_visits_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "orthodontic_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodontal_exams" ADD CONSTRAINT "periodontal_exams_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodontal_exams" ADD CONSTRAINT "periodontal_exams_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodontal_measurements" ADD CONSTRAINT "periodontal_measurements_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "periodontal_exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_budgets" ADD CONSTRAINT "treatment_budgets_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_budgets" ADD CONSTRAINT "treatment_budgets_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_budget_items" ADD CONSTRAINT "treatment_budget_items_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "treatment_budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_periods" ADD CONSTRAINT "payroll_periods_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_entries" ADD CONSTRAINT "payroll_entries_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "payroll_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_booking_requests" ADD CONSTRAINT "public_booking_requests_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
