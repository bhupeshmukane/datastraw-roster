"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createBaselineRosterInput,
  type BaselineRosterFixture,
} from "@/lib/roster/baseline-fixture";
import {
  generateMonthlyRoster,
  validateRosterEntries,
} from "@/lib/roster/engine";
import type { RosterConflict, RosterEntry } from "@/lib/validation/roster";
import {
  persistRosterMonthAction,
  persistManualEditAction,
  resolveConflictAction,
  loadRosterDataAction,
  type PersistResult,
} from "@/app/actions/roster";

export interface ManualEditRecord {
  id: string;
  workDate: string;
  employeeId: string;
  brandId: string;
  action: "REASSIGNED" | "ADDED" | "REMOVED";
  timestamp: string;
}

export interface RosterWorkflowContextValue {
  year: number;
  month: number;
  fixture: BaselineRosterFixture;
  entries: RosterEntry[];
  conflicts: RosterConflict[];
  validationResult: { valid: boolean; conflicts: RosterConflict[] };
  manualEdits: ManualEditRecord[];
  dataSource: "SUPABASE" | "BASELINE_FIXTURE";
  dataSourceMessage: string | null;
  isRevalidating: boolean;
  isPersisting: boolean;
  persistenceStatus: PersistResult | null;

  // Actions
  changeCycle: (year: number, month: number) => Promise<void>;
  regenerateRoster: () => void;
  reassignShift: (
    workDate: string,
    oldEmployeeId: string,
    newEmployeeId: string,
    brandId: string
  ) => void;
  updateOrAddAssignment: (
    workDate: string,
    employeeId: string,
    brandId: string
  ) => void;
  removeAssignment: (
    workDate: string,
    employeeId: string,
    brandId: string
  ) => void;
  runValidation: () => void;
  resolveConflict: (
    workDate: string,
    conflictType: string,
    resolutionNote: string,
    employeeId?: string,
    brandId?: string
  ) => Promise<void>;
  persistCurrentRoster: () => Promise<PersistResult>;
  clearPersistenceStatus: () => void;
}

const RosterWorkflowContext = createContext<
  RosterWorkflowContextValue | undefined
>(undefined);

export function RosterWorkflowProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(12);
  const [dataSource, setDataSource] = useState<"SUPABASE" | "BASELINE_FIXTURE">(
    "BASELINE_FIXTURE"
  );
  const [dataSourceMessage, setDataSourceMessage] = useState<string | null>(
    null
  );

  // Initialize baseline fixture and deterministic roster
  const initialFixture = useMemo(
    () => createBaselineRosterInput(year, month),
    [year, month]
  );

  const [fixture, setFixture] = useState<BaselineRosterFixture>(initialFixture);

  const initialGenerated = useMemo(
    () => generateMonthlyRoster(initialFixture),
    [initialFixture]
  );

  const [entries, setEntries] = useState<RosterEntry[]>(
    initialGenerated.entries
  );
  const [conflicts, setConflicts] = useState<RosterConflict[]>(
    initialGenerated.conflicts
  );
  const [manualEdits, setManualEdits] = useState<ManualEditRecord[]>([]);
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const [isPersisting, setIsPersisting] = useState<boolean>(false);
  const [persistenceStatus, setPersistenceStatus] =
    useState<PersistResult | null>(null);

  // Helper to revalidate given an updated entry set
  const revalidate = useCallback(
    (currentFixture: BaselineRosterFixture, currentEntries: RosterEntry[]) => {
      setIsRevalidating(true);
      const res = validateRosterEntries({
        ...currentFixture,
        entries: currentEntries,
      });
      setConflicts(res.conflicts);
      setIsRevalidating(false);
      return res;
    },
    []
  );

  // Change schedule cycle (year, month) with server-side loader
  const changeCycle = useCallback(
    async (newYear: number, newMonth: number) => {
      setYear(newYear);
      setMonth(newMonth);
      setManualEdits([]);
      setPersistenceStatus(null);

      try {
        const loaded = await loadRosterDataAction({ year: newYear, month: newMonth });
        if (loaded.success && loaded.result) {
          setDataSource(loaded.result.source);
          setDataSourceMessage(loaded.result.message);
          setFixture(loaded.result.data);

          if (loaded.result.existingEntries && loaded.result.existingEntries.length > 0) {
            setEntries(loaded.result.existingEntries);
            const { conflicts: existingConflicts } = validateRosterEntries({
              ...loaded.result.data,
              entries: loaded.result.existingEntries,
            });
            setConflicts(existingConflicts);
          } else {
            const generated = generateMonthlyRoster(loaded.result.data);
            setEntries(generated.entries);
            setConflicts(generated.conflicts);
          }
          return;
        }
      } catch {
        // Fallback gracefully to baseline fixture
      }

      const newFixture = createBaselineRosterInput(newYear, newMonth);
      setDataSource("BASELINE_FIXTURE");
      setFixture(newFixture);
      const generated = generateMonthlyRoster(newFixture);
      setEntries(generated.entries);
      setConflicts(generated.conflicts);
    },
    []
  );

  // Load real Supabase records on initial mount when configured
  useEffect(() => {
    let mounted = true;
    loadRosterDataAction({ year: 2026, month: 12 })
      .then((loaded) => {
        if (!mounted || !loaded.success || !loaded.result) return;
        setDataSource(loaded.result.source);
        setDataSourceMessage(loaded.result.message);
        if (loaded.result.source === "SUPABASE") {
          setFixture(loaded.result.data);
          if (
            loaded.result.existingEntries &&
            loaded.result.existingEntries.length > 0
          ) {
            setEntries(loaded.result.existingEntries);
            const { conflicts: existingConflicts } = validateRosterEntries({
              ...loaded.result.data,
              entries: loaded.result.existingEntries,
            });
            setConflicts(existingConflicts);
          } else {
            const generated = generateMonthlyRoster(loaded.result.data);
            setEntries(generated.entries);
            setConflicts(generated.conflicts);
          }
        }
      })
      .catch(() => {
        // Keep baseline fixture on error
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Reset all manual edits and re-run deterministic generation
  const regenerateRoster = useCallback(() => {
    const activeFixture =
      dataSource === "SUPABASE"
        ? fixture
        : createBaselineRosterInput(year, month);
    setFixture(activeFixture);
    const generated = generateMonthlyRoster(activeFixture);
    setEntries(generated.entries);
    setConflicts(generated.conflicts);
    setManualEdits([]);
    setPersistenceStatus(null);
  }, [dataSource, fixture, year, month]);

  // Reassign an existing shift from one employee to another
  const reassignShift = useCallback(
    (
      workDate: string,
      oldEmployeeId: string,
      newEmployeeId: string,
      brandId: string
    ) => {
      const brand = fixture.brands.find((b) => b.id === brandId);
      const podId = brand?.podId ?? "pod-1";
      const processId = brand?.processId ?? "proc-1";

      setEntries((prev) => {
        const filtered = prev.filter(
          (e) =>
            !(
              e.workDate === workDate &&
              e.employeeId === oldEmployeeId &&
              e.brandId === brandId
            )
        );

        const updatedEntries: RosterEntry[] = [
          ...filtered,
          {
            workDate,
            employeeId: newEmployeeId,
            brandId,
            podId,
            processId,
            source: "MANUAL_EDIT",
          },
        ];

        revalidate(fixture, updatedEntries);
        return updatedEntries;
      });

      setManualEdits((prev) => [
        {
          id: `edit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          workDate,
          employeeId: newEmployeeId,
          brandId,
          action: "REASSIGNED",
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);

      // Fire server action in background without blocking UI
      persistManualEditAction({
        rosterMonthId: `month-${year}-${String(month).padStart(2, "0")}`,
        workDate,
        employeeId: newEmployeeId,
        brandId,
        podId,
        processId,
      }).catch(() => {
        // Handled silently or displayed on status banner
      });
    },
    [fixture, year, month, revalidate]
  );

  // Update or add an assignment on a date
  const updateOrAddAssignment = useCallback(
    (workDate: string, employeeId: string, brandId: string) => {
      const brand = fixture.brands.find((b) => b.id === brandId);
      const podId = brand?.podId ?? "pod-1";
      const processId = brand?.processId ?? "proc-1";

      setEntries((prev) => {
        const withoutTarget = prev.filter(
          (e) =>
            !(
              e.workDate === workDate &&
              e.employeeId === employeeId &&
              e.brandId === brandId
            )
        );

        const updatedEntries: RosterEntry[] = [
          ...withoutTarget,
          {
            workDate,
            employeeId,
            brandId,
            podId,
            processId,
            source: "MANUAL_EDIT",
          },
        ];

        revalidate(fixture, updatedEntries);
        return updatedEntries;
      });

      setManualEdits((prev) => [
        {
          id: `edit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          workDate,
          employeeId,
          brandId,
          action: "ADDED",
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);

      // Fire server action in background
      persistManualEditAction({
        rosterMonthId: `month-${year}-${String(month).padStart(2, "0")}`,
        workDate,
        employeeId,
        brandId,
        podId,
        processId,
      }).catch(() => {});
    },
    [fixture, year, month, revalidate]
  );

  // Remove an assignment on a date
  const removeAssignment = useCallback(
    (workDate: string, employeeId: string, brandId: string) => {
      setEntries((prev) => {
        const updatedEntries = prev.filter(
          (e) =>
            !(
              e.workDate === workDate &&
              e.employeeId === employeeId &&
              e.brandId === brandId
            )
        );

        revalidate(fixture, updatedEntries);
        return updatedEntries;
      });

      setManualEdits((prev) => [
        {
          id: `edit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          workDate,
          employeeId,
          brandId,
          action: "REMOVED",
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    },
    [fixture, revalidate]
  );

  // Run on-demand validation
  const runValidation = useCallback(() => {
    revalidate(fixture, entries);
  }, [fixture, entries, revalidate]);

  // Resolve a conflict
  const resolveConflict = useCallback(
    async (
      workDate: string,
      conflictType: string,
      resolutionNote: string,
      employeeId?: string,
      brandId?: string
    ) => {
      // Remove or resolve conflict locally
      setConflicts((prev) =>
        prev.filter(
          (c) =>
            !(
              c.workDate === workDate &&
              c.conflictType === conflictType &&
              c.employeeId === (employeeId ?? null) &&
              c.brandId === (brandId ?? null)
            )
        )
      );

      // Attempt server action
      const res = await resolveConflictAction({
        rosterMonthId: `month-${year}-${String(month).padStart(2, "0")}`,
        workDate,
        conflictType,
        employeeId: employeeId ?? null,
        brandId: brandId ?? null,
        resolutionNote,
      });

      setPersistenceStatus({
        success: res.success,
        configured: res.configured,
        message: res.message,
      });
    },
    [year, month]
  );

  // Attempt server-side database persistence
  const persistCurrentRoster = useCallback(async (): Promise<PersistResult> => {
    setIsPersisting(true);
    try {
      const result = await persistRosterMonthAction({
        rosterMonthId: `month-${year}-${String(month).padStart(2, "0")}`,
        entries,
        conflicts,
      });
      setPersistenceStatus(result);
      return result;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const failure: PersistResult = {
        success: false,
        configured: false,
        message: `Persistence request failed: ${errorMsg}`,
      };
      setPersistenceStatus(failure);
      return failure;
    } finally {
      setIsPersisting(false);
    }
  }, [year, month, entries, conflicts]);

  const clearPersistenceStatus = useCallback(() => {
    setPersistenceStatus(null);
  }, []);

  const validationResult = useMemo(
    () => ({
      valid: conflicts.length === 0,
      conflicts,
    }),
    [conflicts]
  );

  const value: RosterWorkflowContextValue = useMemo(
    () => ({
      year,
      month,
      fixture,
      entries,
      conflicts,
      validationResult,
      manualEdits,
      dataSource,
      dataSourceMessage,
      isRevalidating,
      isPersisting,
      persistenceStatus,
      changeCycle,
      regenerateRoster,
      reassignShift,
      updateOrAddAssignment,
      removeAssignment,
      runValidation,
      resolveConflict,
      persistCurrentRoster,
      clearPersistenceStatus,
    }),
    [
      year,
      month,
      fixture,
      entries,
      conflicts,
      validationResult,
      manualEdits,
      dataSource,
      dataSourceMessage,
      isRevalidating,
      isPersisting,
      persistenceStatus,
      changeCycle,
      regenerateRoster,
      reassignShift,
      updateOrAddAssignment,
      removeAssignment,
      runValidation,
      resolveConflict,
      persistCurrentRoster,
      clearPersistenceStatus,
    ]
  );

  return (
    <RosterWorkflowContext.Provider value={value}>
      {children}
    </RosterWorkflowContext.Provider>
  );
}

export function useRosterWorkflow(): RosterWorkflowContextValue {
  const context = useContext(RosterWorkflowContext);
  if (!context) {
    throw new Error(
      "useRosterWorkflow must be used within a <RosterWorkflowProvider>"
    );
  }
  return context;
}
