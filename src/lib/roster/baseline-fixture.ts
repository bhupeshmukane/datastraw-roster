import type { RosterEngineInput } from "@/lib/roster/engine";

export interface BaselinePod {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface BaselineProcess {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface BaselineRosterFixture extends RosterEngineInput {
  pods: BaselinePod[];
  processes: BaselineProcess[];
}

export const BASELINE_PODS: BaselinePod[] = [
  {
    id: "pod-1",
    code: "POD-A",
    name: "Core D2C Pod A",
    description: "High-velocity personal care and luxury beauty brand operations.",
  },
  {
    id: "pod-2",
    code: "POD-B",
    name: "Growth D2C Pod B",
    description: "Fast-scaling nutrition, wellness, and fitness retail streams.",
  },
  {
    id: "pod-3",
    code: "POD-C",
    name: "Retention & CX Pod C",
    description: "Apparel, eyewear, and home lifestyle customer experience triage.",
  },
  {
    id: "pod-4",
    code: "POD-D",
    name: "Fulfillment & Ops Pod D",
    description: "Consumer electronics, audio, and sustainable hardware logistics.",
  },
  {
    id: "pod-5",
    code: "POD-E",
    name: "Catalog & Launch Pod E",
    description: "Rapid seasonal launches, specialty artisan goods, and mobility.",
  },
];

export const BASELINE_PROCESSES: BaselineProcess[] = [
  {
    id: "proc-1",
    code: "PROC-ORDER",
    name: "Order & Dispatch Ops",
    description: "Omnichannel order validation, courier dispatch, and warehouse handoff.",
  },
  {
    id: "proc-2",
    code: "PROC-CX",
    name: "Customer Experience Tier 2",
    description: "Live escalation routing, VIP returns, and multi-channel ticket resolution.",
  },
  {
    id: "proc-3",
    code: "PROC-CATALOG",
    name: "Catalog & Inventory Sync",
    description: "Real-time stock reservation, SKU listing accuracy, and inventory reconciliation.",
  },
  {
    id: "proc-4",
    code: "PROC-SLA",
    name: "SLA Monitoring & Exceptions",
    description: "Delivery breach tracking, dispute escalation, and proactive customer outreach.",
  },
];

const OPERATOR_NAMES = [
  "Marcus Chen",
  "Priya Patel",
  "Sofia Rodriguez",
  "Liam O'Connor",
  "Aisha Khan",
  "Carlos Mendoza",
  "Sarah Jenkins",
  "David Kim",
  "Elena Rostova",
  "Tariq Al-Mansoor",
  "Hannah Abbott",
  "Julian Vance",
  "Mei-Ling Zhou",
  "Lucas Silva",
  "Chloe Martin",
  "Vikram Malhotra",
  "Zoe Washington",
  "Nathaniel Ford",
  "Ananya Sharma",
  "Gabriel Santos",
  "Rachel Green",
  "Benjamin Torres",
  "Kavita Reddy",
  "Owen Mitchell",
  "Fatima Zahra",
  "Alexander Scott",
  "Nadia Petrova",
  "Samuel Adebayo",
  "Isabella Gomez",
  "Daniel Wright",
];

const BRAND_DEFINITIONS = [
  { code: "BR-01", name: "AuraSkin Care", mode: "DEDICATED_SINGLE" as const },
  { code: "BR-02", name: "Lumina Home Tech", mode: "DEDICATED_SINGLE" as const },
  { code: "BR-03", name: "PeakFit Nutrition", mode: "DEDICATED_SINGLE" as const },
  { code: "BR-04", name: "Solstice Eyewear", mode: "DEDICATED_SINGLE" as const },
  { code: "BR-05", name: "Novawear Apparel", mode: "DEDICATED_SINGLE" as const },
  { code: "BR-06", name: "Artisan Roast Co", mode: "DEDICATED_SINGLE" as const },
  { code: "BR-07", name: "PureBotanics Lab", mode: "DEDICATED_SINGLE" as const },
  { code: "BR-08", name: "PulseAudio Gear", mode: "DEDICATED_SINGLE" as const },
  { code: "BR-09", name: "VelvetKnit Studio", mode: "DEDICATED_SINGLE" as const },
  { code: "BR-10", name: "UrbanStride Shoes", mode: "DEDICATED_SINGLE" as const },
  { code: "BR-11", name: "TerraGoods Living", mode: "DEDICATED_SINGLE" as const },
  { code: "BR-12", name: "ChronoWatch Atelier", mode: "DEDICATED_SINGLE" as const },
  { code: "BR-13", name: "HavenSleep Bedding", mode: "DEDICATED_SINGLE" as const },
  { code: "BR-14", name: "EcoSpark Cleaning", mode: "DEDICATED_SINGLE" as const },
  { code: "BR-15", name: "ZenithGlow Wellness", mode: "DEDICATED_SINGLE" as const },
  { code: "BR-16", name: "OrbitBikes Commute", mode: "DEDICATED_SINGLE" as const },
  { code: "BR-17", name: "AeroPack Luggage", mode: "SHARED_MULTI" as const },
  { code: "BR-18", name: "Verve Kitchenware", mode: "SHARED_MULTI" as const },
  { code: "BR-19", name: "Glint Fine Jewelry", mode: "SHARED_MULTI" as const },
  { code: "BR-20", name: "Kinetix Sports Gear", mode: "SHARED_MULTI" as const },
];

export function createBaselineRosterInput(
  year = 2026,
  month = 12
): BaselineRosterFixture {
  const employees = Array.from({ length: 30 }, (_, i) => {
    const id = `emp-${i + 1}`;
    const codeNumber = String(i + 1).padStart(2, "0");
    const pod = BASELINE_PODS[i % BASELINE_PODS.length];
    const process = BASELINE_PROCESSES[i % BASELINE_PROCESSES.length];

    return {
      id,
      employeeCode: `EMP-${codeNumber}`,
      fullName: OPERATOR_NAMES[i] ?? `Operations Specialist ${i + 1}`,
      podId: pod.id,
      primaryProcessId: process.id,
      isActive: true,
    };
  });

  const brands = BRAND_DEFINITIONS.map((def, i) => {
    const id = `brand-${i + 1}`;
    const pod = BASELINE_PODS[i % BASELINE_PODS.length];
    const process = BASELINE_PROCESSES[i % BASELINE_PROCESSES.length];

    return {
      id,
      code: def.code,
      name: def.name,
      staffingMode: def.mode,
      podId: pod.id,
      processId: process.id,
      isActive: true,
    };
  });

  // 16 dedicated brands get 1 dedicated primary operator (emp-1 to emp-16)
  const dedicatedAssignments = brands.slice(0, 16).map((brand, idx) => ({
    brandId: brand.id,
    employeeId: employees[idx].id,
    isPrimary: true,
  }));

  // 4 shared brands get shared operators
  const sharedAssignments = brands.slice(16).flatMap((brand, idx) => [
    {
      brandId: brand.id,
      employeeId: employees[16 + idx * 2].id,
      isPrimary: true,
    },
    {
      brandId: brand.id,
      employeeId: employees[17 + idx * 2].id,
      isPrimary: false,
    },
  ]);

  const assignments = [...dedicatedAssignments, ...sharedAssignments];

  const calendarOverrides = [
    {
      overrideDate: `${year}-${String(month).padStart(2, "0")}-25`,
      isOperating: false,
      reason: "Christmas Public Holiday Closure",
    },
  ];

  const timeOffs = [
    {
      employeeId: "emp-1",
      timeOffDate: `${year}-${String(month).padStart(2, "0")}-08`,
      kind: "LEAVE" as const,
      status: "APPROVED" as const,
      notes: "Annual personal leave",
    },
    {
      employeeId: "emp-18",
      timeOffDate: `${year}-${String(month).padStart(2, "0")}-19`,
      kind: "COMP_OFF" as const,
      status: "APPROVED" as const,
      notes: "Compensatory day off for weekend launch support",
    },
  ];

  const staffingRules = brands.map((b) => ({
    id: `rule-${b.id}`,
    brandId: b.id,
    podId: b.podId,
    processId: b.processId,
    minHeadcount: 1,
    effectiveFrom: null,
    effectiveTo: null,
  }));

  return {
    year,
    month,
    employees,
    brands,
    assignments,
    calendar: {
      id: "cal-standard-ops",
      name: "Standard Operating Calendar (Mon–Sat)",
      operatingDays: [1, 2, 3, 4, 5, 6],
      isDefault: true,
    },
    calendarOverrides,
    timeOffs,
    staffingRules,
    pods: BASELINE_PODS,
    processes: BASELINE_PROCESSES,
  };
}
