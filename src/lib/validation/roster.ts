import { z } from "zod";

export const StaffingModeSchema = z.enum(["DEDICATED_SINGLE", "SHARED_MULTI"]);
export type StaffingMode = z.infer<typeof StaffingModeSchema>;

export const TimeOffKindSchema = z.enum(["WEEKLY_OFF", "LEAVE", "COMP_OFF"]);
export type TimeOffKind = z.infer<typeof TimeOffKindSchema>;

export const TimeOffStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export type TimeOffStatus = z.infer<typeof TimeOffStatusSchema>;

export const RosterSourceSchema = z.enum(["GENERATED", "MANUAL_EDIT"]);
export type RosterSource = z.infer<typeof RosterSourceSchema>;

export const RosterMonthStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export type RosterMonthStatus = z.infer<typeof RosterMonthStatusSchema>;

export const ConflictSeveritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export type ConflictSeverity = z.infer<typeof ConflictSeveritySchema>;

export const IsoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected date in YYYY-MM-DD format");

export const PodSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
});

export const ProcessSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
});

export const EmployeeSchema = z.object({
  id: z.string().min(1),
  employeeCode: z.string().min(1),
  fullName: z.string().min(1),
  podId: z.string().min(1),
  primaryProcessId: z.string().min(1),
  isActive: z.boolean().default(true),
});

export const BrandSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  staffingMode: StaffingModeSchema,
  podId: z.string().min(1),
  processId: z.string().min(1),
  isActive: z.boolean().default(true),
});

export const BrandAssignmentSchema = z.object({
  brandId: z.string().min(1),
  employeeId: z.string().min(1),
  isPrimary: z.boolean().default(false),
});

export const OperatingCalendarSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  operatingDays: z.array(z.number().int().min(0).max(6)).min(1),
  isDefault: z.boolean().default(false),
});

export const EmployeeTimeOffSchema = z.object({
  employeeId: z.string().min(1),
  timeOffDate: IsoDateSchema,
  kind: TimeOffKindSchema,
  status: TimeOffStatusSchema.default("APPROVED"),
  notes: z.string().optional(),
});

export const MinimumStaffingRuleSchema = z.object({
  id: z.string().min(1),
  brandId: z.string().nullable().optional(),
  podId: z.string().nullable().optional(),
  processId: z.string().nullable().optional(),
  minHeadcount: z.number().int().min(0),
  effectiveFrom: IsoDateSchema.nullable().optional(),
  effectiveTo: IsoDateSchema.nullable().optional(),
});

export const RosterEntrySchema = z.object({
  id: z.string().min(1).optional(),
  workDate: IsoDateSchema,
  employeeId: z.string().min(1),
  brandId: z.string().min(1),
  podId: z.string().min(1),
  processId: z.string().min(1),
  source: RosterSourceSchema.default("GENERATED"),
});

export const RosterConflictSchema = z.object({
  workDate: IsoDateSchema,
  employeeId: z.string().nullable(),
  brandId: z.string().nullable(),
  conflictType: z.string().min(1),
  severity: ConflictSeveritySchema,
  description: z.string().min(1),
});

export type RosterEntry = z.infer<typeof RosterEntrySchema>;

export type RosterConflict = z.infer<typeof RosterConflictSchema>;

export const DatastrawOrgConfigSchema = z
  .object({
    employees: z.array(EmployeeSchema),
    brands: z.array(BrandSchema),
    pods: z.array(PodSchema),
    processes: z.array(ProcessSchema),
    assignments: z.array(BrandAssignmentSchema),
  })
  .superRefine((data, ctx) => {
    if (data.employees.length !== 30) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["employees"],
        message: `Expected exactly 30 employees, received ${data.employees.length}`,
      });
    }
    if (data.brands.length !== 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["brands"],
        message: `Expected exactly 20 brands, received ${data.brands.length}`,
      });
    }
    if (data.pods.length !== 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pods"],
        message: `Expected exactly 5 pods, received ${data.pods.length}`,
      });
    }
    if (data.processes.length !== 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["processes"],
        message: `Expected exactly 4 processes, received ${data.processes.length}`,
      });
    }

    const dedicatedCount = data.brands.filter(
      (b) => b.staffingMode === "DEDICATED_SINGLE"
    ).length;
    const sharedCount = data.brands.filter(
      (b) => b.staffingMode === "SHARED_MULTI"
    ).length;

    if (dedicatedCount !== 16 || sharedCount !== 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["brands"],
        message: `Expected 16 DEDICATED_SINGLE and 4 SHARED_MULTI brands (80/20), got ${dedicatedCount} and ${sharedCount}`,
      });
    }
  });