import { z } from "zod";
import {
  BrandAssignmentSchema,
  BrandSchema,
  EmployeeSchema,
  EmployeeTimeOffSchema,
  IsoDateSchema,
  MinimumStaffingRuleSchema,
  OperatingCalendarSchema,
  RosterConflictSchema,
  RosterEntrySchema,
  type RosterConflict,
  type RosterEntry,
} from "@/lib/validation/roster";

export const CalendarOverrideSchema = z.object({
  overrideDate: IsoDateSchema,
  isOperating: z.boolean(),
  reason: z.string().optional(),
});

export type CalendarOverride = z.infer<typeof CalendarOverrideSchema>;

export const RosterEngineInputSchema = z.object({
  year: z.number().int().min(2024).max(2100),
  month: z.number().int().min(1).max(12),
  employees: z.array(EmployeeSchema),
  brands: z.array(BrandSchema),
  assignments: z.array(BrandAssignmentSchema),
  calendar: OperatingCalendarSchema,
  calendarOverrides: z.array(CalendarOverrideSchema).default([]),
  timeOffs: z.array(EmployeeTimeOffSchema).default([]),
  staffingRules: z.array(MinimumStaffingRuleSchema).default([]),
});

export type RosterEngineInput = z.infer<typeof RosterEngineInputSchema>;

export const RevalidateRosterInputSchema = RosterEngineInputSchema.extend({
  entries: z.array(RosterEntrySchema),
});

export type RevalidateRosterInput = z.infer<typeof RevalidateRosterInputSchema>;

export function getMonthDates(year: number, month: number): string[] {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const dates: string[] = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dd = String(day).padStart(2, "0");
    const mm = String(month).padStart(2, "0");
    dates.push(`${year}-${mm}-${dd}`);
  }
  return dates;
}

export function isOperatingDay(
  isoDate: string,
  calendar: z.infer<typeof OperatingCalendarSchema>,
  overrides: CalendarOverride[] = []
): boolean {
  const override = overrides.find((item) => item.overrideDate === isoDate);
  if (override) {
    return override.isOperating;
  }
  const [y, m, d] = isoDate.split("-").map(Number);
  const dayOfWeek = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return calendar.operatingDays.includes(dayOfWeek);
}

function isEmployeeUnavailable(
  employeeId: string,
  isoDate: string,
  timeOffs: z.infer<typeof EmployeeTimeOffSchema>[]
): boolean {
  return timeOffs.some(
    (t) =>
      t.employeeId === employeeId &&
      t.timeOffDate === isoDate &&
      t.status === "APPROVED"
  );
}

function getBrandMinHeadcount(
  brandId: string,
  isoDate: string,
  staffingRules: z.infer<typeof MinimumStaffingRuleSchema>[]
): number {
  const matching = staffingRules.filter((rule) => {
    if (rule.brandId && rule.brandId !== brandId) return false;
    if (rule.effectiveFrom && isoDate < rule.effectiveFrom) return false;
    if (rule.effectiveTo && isoDate > rule.effectiveTo) return false;
    return true;
  });

  const brandSpecific = matching.find((r) => r.brandId === brandId);
  if (brandSpecific) return brandSpecific.minHeadcount;

  const globalRule = matching.find((r) => !r.brandId && !r.podId && !r.processId);
  return globalRule ? globalRule.minHeadcount : 1;
}

export function validateRosterEntries(rawInput: RevalidateRosterInput): {
  valid: boolean;
  conflicts: RosterConflict[];
} {
  const input = RevalidateRosterInputSchema.parse(rawInput);
  const conflicts: RosterConflict[] = [];

  const employeeMap = new Map(input.employees.map((e) => [e.id, e]));
  const brandMap = new Map(input.brands.map((b) => [b.id, b]));
  const dates = getMonthDates(input.year, input.month);

  // 1. Check employee availability, inactive status, and dedicated-brand isolation
  const dedicatedEmployeeToBrand = new Map<string, string>();
  for (const assignment of input.assignments) {
    const brand = brandMap.get(assignment.brandId);
    if (brand && brand.staffingMode === "DEDICATED_SINGLE" && assignment.isPrimary) {
      dedicatedEmployeeToBrand.set(assignment.employeeId, brand.id);
    }
  }

  const seenEmployeeDate = new Map<string, string[]>();

  for (const entry of input.entries) {
    const emp = employeeMap.get(entry.employeeId);
    const brand = brandMap.get(entry.brandId);

    if (!emp || !emp.isActive) {
      conflicts.push(
        RosterConflictSchema.parse({
          workDate: entry.workDate,
          employeeId: entry.employeeId,
          brandId: entry.brandId,
          conflictType: "INACTIVE_OR_MISSING_EMPLOYEE",
          severity: "HIGH",
          description: `Employee ${entry.employeeId} is inactive or missing on ${entry.workDate}.`,
        })
      );
    }

    if (!brand || !brand.isActive) {
      conflicts.push(
        RosterConflictSchema.parse({
          workDate: entry.workDate,
          employeeId: entry.employeeId,
          brandId: entry.brandId,
          conflictType: "INACTIVE_OR_MISSING_BRAND",
          severity: "HIGH",
          description: `Brand ${entry.brandId} is inactive or missing on ${entry.workDate}.`,
        })
      );
    }

    if (!isOperatingDay(entry.workDate, input.calendar, input.calendarOverrides)) {
      conflicts.push(
        RosterConflictSchema.parse({
          workDate: entry.workDate,
          employeeId: entry.employeeId,
          brandId: entry.brandId,
          conflictType: "NON_OPERATING_DAY",
          severity: "MEDIUM",
          description: `Assignment scheduled on non-operating date ${entry.workDate}.`,
        })
      );
    }

    if (isEmployeeUnavailable(entry.employeeId, entry.workDate, input.timeOffs)) {
      conflicts.push(
        RosterConflictSchema.parse({
          workDate: entry.workDate,
          employeeId: entry.employeeId,
          brandId: entry.brandId,
          conflictType: "EMPLOYEE_TIME_OFF",
          severity: "HIGH",
          description: `Employee ${entry.employeeId} has approved time-off on ${entry.workDate}.`,
        })
      );
    }

    const lockedBrandId = dedicatedEmployeeToBrand.get(entry.employeeId);
    if (lockedBrandId && lockedBrandId !== entry.brandId) {
      conflicts.push(
        RosterConflictSchema.parse({
          workDate: entry.workDate,
          employeeId: entry.employeeId,
          brandId: entry.brandId,
          conflictType: "DEDICATED_BRAND_VIOLATION",
          severity: "HIGH",
          description: `Dedicated employee ${entry.employeeId} assigned to brand ${entry.brandId} outside dedicated brand ${lockedBrandId}.`,
        })
      );
    }

    const empDateKey = `${entry.employeeId}::${entry.workDate}`;
    const existingBrands = seenEmployeeDate.get(empDateKey) ?? [];
    existingBrands.push(entry.brandId);
    seenEmployeeDate.set(empDateKey, existingBrands);
  }

  for (const [key, brandIds] of seenEmployeeDate.entries()) {
    if (brandIds.length > 1) {
      const [employeeId, workDate] = key.split("::");
      conflicts.push(
        RosterConflictSchema.parse({
          workDate,
          employeeId,
          brandId: null,
          conflictType: "DOUBLE_BOOKED_EMPLOYEE",
          severity: "HIGH",
          description: `Employee ${employeeId} has ${brandIds.length} overlapping assignments on ${workDate}.`,
        })
      );
    }
  }

  // 2. Check minimum staffing per active brand on operating days
  for (const workDate of dates) {
    if (!isOperatingDay(workDate, input.calendar, input.calendarOverrides)) {
      continue;
    }
    for (const brand of input.brands) {
      if (!brand.isActive) continue;
      const minHeadcount = getBrandMinHeadcount(brand.id, workDate, input.staffingRules);
      const assignedCount = input.entries.filter(
        (e) => e.workDate === workDate && e.brandId === brand.id
      ).length;

      if (assignedCount < minHeadcount) {
        conflicts.push(
          RosterConflictSchema.parse({
            workDate,
            employeeId: null,
            brandId: brand.id,
            conflictType: "UNDERSTAFFED_BRAND",
            severity: "HIGH",
            description: `Brand ${brand.code} has ${assignedCount}/${minHeadcount} scheduled staff on ${workDate}.`,
          })
        );
      }
    }
  }

  return {
    valid: conflicts.length === 0,
    conflicts,
  };
}

export function generateMonthlyRoster(rawInput: RosterEngineInput): {
  entries: RosterEntry[];
  conflicts: RosterConflict[];
} {
  const input = RosterEngineInputSchema.parse(rawInput);
  const dates = getMonthDates(input.year, input.month);

  const sortedBrands = [...input.brands]
    .filter((b) => b.isActive)
    .sort((a, b) => a.code.localeCompare(b.code));

  const activeEmployees = [...input.employees]
    .filter((e) => e.isActive)
    .sort((a, b) => a.employeeCode.localeCompare(b.employeeCode));

  const entries: RosterEntry[] = [];
  const assignedOnDate = new Set<string>();

  for (const workDate of dates) {
    if (!isOperatingDay(workDate, input.calendar, input.calendarOverrides)) {
      continue;
    }

    for (const brand of sortedBrands) {
      const minHeadcount = getBrandMinHeadcount(brand.id, workDate, input.staffingRules);
      const brandAssignments = input.assignments.filter((a) => a.brandId === brand.id);

      const candidateIds =
        brandAssignments.length > 0
          ? brandAssignments.map((a) => a.employeeId)
          : activeEmployees.map((e) => e.id);

      let scheduledForBrand = 0;

      for (const empId of candidateIds) {
        if (scheduledForBrand >= minHeadcount) break;
        const emp = activeEmployees.find((e) => e.id === empId);
        if (!emp) continue;

        const key = `${emp.id}::${workDate}`;
        if (assignedOnDate.has(key)) continue;
        if (isEmployeeUnavailable(emp.id, workDate, input.timeOffs)) continue;

        entries.push(
          RosterEntrySchema.parse({
            workDate,
            employeeId: emp.id,
            brandId: brand.id,
            podId: brand.podId,
            processId: brand.processId,
            source: "GENERATED",
          })
        );
        assignedOnDate.add(key);
        scheduledForBrand += 1;
      }
    }
  }

  const { conflicts } = validateRosterEntries({
    ...input,
    entries,
  });

  return { entries, conflicts };
}