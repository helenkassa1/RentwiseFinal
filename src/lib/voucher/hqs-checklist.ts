/**
 * Housing Quality Standards (HQS) Inspection Checklist
 *
 * Based on HUD form 52580 — the checklist DCHA inspectors use
 * to evaluate units before approving Section 8 tenancy.
 * Items marked "high" failure risk are the most common reasons
 * units fail initial HQS inspections.
 */

export type HQSItem = {
  id: string;
  label: string;
  tip: string;
  failureRisk: "high" | "medium" | "low";
};

export type HQSCategory = {
  category: string;
  icon: string; // lucide icon name for reference
  items: HQSItem[];
};

export const HQS_CHECKLIST: HQSCategory[] = [
  {
    category: "Living Room",
    icon: "Sofa",
    items: [
      { id: "lr-1", label: "At least one window present and operable", tip: "Window must open and close properly and lock securely. Cracked or broken glass is an automatic fail.", failureRisk: "medium" },
      { id: "lr-2", label: "Ceiling, walls, and floor in good condition", tip: "No large cracks, holes, peeling paint, or water damage. Minor cosmetic issues are usually acceptable.", failureRisk: "medium" },
      { id: "lr-3", label: "At least two working electrical outlets", tip: "Outlets must be properly grounded. Use a circuit tester ($10 at hardware stores) to verify before inspection.", failureRisk: "high" },
      { id: "lr-4", label: "Adequate lighting (natural or electric)", tip: "At least one working light fixture or sufficient natural light from windows.", failureRisk: "low" },
      { id: "lr-5", label: "No exposed wiring or electrical hazards", tip: "Cover plates on all outlets and switches. No extension cords used as permanent wiring.", failureRisk: "high" },
    ],
  },
  {
    category: "Kitchen",
    icon: "CookingPot",
    items: [
      { id: "k-1", label: "Working stove/oven with all burners functional", tip: "All burners must ignite and heat. Oven must reach temperature. Gas appliances must have no leaks.", failureRisk: "high" },
      { id: "k-2", label: "Working refrigerator that maintains temperature", tip: "Fridge must maintain 40°F or below, freezer at 0°F. Check the seal on the door — worn seals are a common issue.", failureRisk: "high" },
      { id: "k-3", label: "Sink with hot and cold running water", tip: "Hot water must reach at least 110°F within a reasonable time. Check for leaks under the sink.", failureRisk: "high" },
      { id: "k-4", label: "Adequate cabinet/storage space", tip: "Must have some food storage. A single shelf counts, but no storage at all is a fail.", failureRisk: "low" },
      { id: "k-5", label: "Adequate ventilation (window or exhaust fan)", tip: "Either an operable window or a working range hood/exhaust fan.", failureRisk: "medium" },
      { id: "k-6", label: "No evidence of pest infestation", tip: "Check under sink, behind appliances, and in cabinets. Droppings or live pests are an automatic fail.", failureRisk: "high" },
    ],
  },
  {
    category: "Bathroom",
    icon: "Bath",
    items: [
      { id: "b-1", label: "Working toilet that flushes and doesn't leak", tip: "Check the base for water stains — a common sign of a slow leak. Ensure the flapper seals properly.", failureRisk: "high" },
      { id: "b-2", label: "Working tub or shower", tip: "Must have a showerhead or tub spout with hot and cold water. Check caulking around tub — mold or gaps fail.", failureRisk: "high" },
      { id: "b-3", label: "Hot and cold running water at sink", tip: "Both handles must work. Hot water must reach adequate temperature.", failureRisk: "medium" },
      { id: "b-4", label: "Ventilation (window or exhaust fan)", tip: "An operable window or working exhaust fan is required. Non-functional bathroom fans are a very common fail point.", failureRisk: "high" },
      { id: "b-5", label: "Door with privacy lock", tip: "Bathroom door must have a functioning lock for privacy. A simple push-button lock is sufficient.", failureRisk: "medium" },
      { id: "b-6", label: "No visible mold or mildew", tip: "Check ceiling corners, grout lines, and around the tub. Surface mold can be cleaned, but extensive mold fails.", failureRisk: "high" },
    ],
  },
  {
    category: "Bedrooms",
    icon: "Bed",
    items: [
      { id: "br-1", label: "At least one window (egress capable)", tip: "Bedroom windows must be large enough for emergency escape. Minimum: 5.7 sq ft opening, 24\" high, 20\" wide.", failureRisk: "high" },
      { id: "br-2", label: "Closet or wardrobe space", tip: "Must have some built-in storage. A freestanding wardrobe counts if there's no closet.", failureRisk: "low" },
      { id: "br-3", label: "Working door with lock or latch", tip: "Bedroom doors must close and latch. A lock is required for the primary bedroom.", failureRisk: "medium" },
      { id: "br-4", label: "At least two electrical outlets", tip: "Or one outlet and one light fixture. Extension cords cannot substitute for permanent outlets.", failureRisk: "medium" },
      { id: "br-5", label: "Ceiling, walls, floor in good condition", tip: "No holes, peeling paint (especially in pre-1978 homes), water stains, or structural damage.", failureRisk: "medium" },
    ],
  },
  {
    category: "Safety",
    icon: "ShieldAlert",
    items: [
      { id: "s-1", label: "Working smoke detector on every level", tip: "Must be hardwired or have fresh batteries. Test each one. DC requires photoelectric smoke alarms (DC Code § 6-751.02).", failureRisk: "high" },
      { id: "s-2", label: "Carbon monoxide detector near sleeping areas", tip: "Required if the unit has gas appliances, a fireplace, or an attached garage. DC requires CO detectors in all rental units.", failureRisk: "high" },
      { id: "s-3", label: "No peeling or chipping paint (pre-1978)", tip: "This is the #1 reason units fail HQS in DC. Any peeling paint in a pre-1978 unit triggers lead remediation requirements.", failureRisk: "high" },
      { id: "s-4", label: "Handrails on stairs (4+ steps)", tip: "Any stairway with 4 or more risers must have a secure handrail. Check that it's firmly attached.", failureRisk: "high" },
      { id: "s-5", label: "GFCI outlets near water sources", tip: "Required within 6 feet of sinks, tubs, and in kitchens/bathrooms. Retrofit with GFCI outlets or breakers if missing.", failureRisk: "high" },
      { id: "s-6", label: "No trip hazards (loose carpet, uneven floors)", tip: "Secure loose carpet edges, fix uneven thresholds, and ensure no cords cross walkways.", failureRisk: "medium" },
    ],
  },
  {
    category: "Exterior & Entry",
    icon: "DoorOpen",
    items: [
      { id: "e-1", label: "Secure entry door with deadbolt lock", tip: "Front door must have a working deadbolt and knob lock. Door frame must be solid — no signs of forced entry damage.", failureRisk: "high" },
      { id: "e-2", label: "Weather-tight windows and doors", tip: "No gaps or drafts. Check weatherstripping and caulking around all windows and exterior doors.", failureRisk: "medium" },
      { id: "e-3", label: "No structural damage to foundation/walls", tip: "Check for large cracks in foundation, leaning walls, or sagging roof lines.", failureRisk: "medium" },
      { id: "e-4", label: "Address numbers clearly visible", tip: "Unit number and street address must be visible from the street for emergency services.", failureRisk: "low" },
      { id: "e-5", label: "Safe walkways and steps (no tripping hazards)", tip: "Repair cracked sidewalks, loose steps, and ensure adequate outdoor lighting.", failureRisk: "medium" },
    ],
  },
  {
    category: "Mechanical Systems",
    icon: "Thermometer",
    items: [
      { id: "m-1", label: "Working heating system (maintains 68°F)", tip: "HVAC must be able to heat the unit to at least 68°F. Have your system serviced before the inspection.", failureRisk: "high" },
      { id: "m-2", label: "Working hot water heater", tip: "Must produce hot water at all fixtures. Temperature should reach 110-120°F. Check for rust or leaks at the base.", failureRisk: "high" },
      { id: "m-3", label: "Adequate water pressure at all fixtures", tip: "Test all faucets and showers. Low pressure may indicate plumbing issues that need repair.", failureRisk: "medium" },
      { id: "m-4", label: "No visible plumbing leaks", tip: "Check under all sinks, around toilets, and near the water heater. Even small drips can fail inspection.", failureRisk: "high" },
      { id: "m-5", label: "Electrical panel accessible and properly labeled", tip: "Panel must not be blocked. Breakers should be labeled. No double-tapped breakers or exposed wiring.", failureRisk: "medium" },
    ],
  },
  {
    category: "General Health & Safety",
    icon: "HeartPulse",
    items: [
      { id: "g-1", label: "No evidence of rodent or insect infestation", tip: "Check basements, utility rooms, and kitchen areas. Droppings, nests, or live pests are automatic fails.", failureRisk: "high" },
      { id: "g-2", label: "Garbage and trash disposal available", tip: "Unit must have access to trash collection — either curbside pickup or a dumpster/enclosure.", failureRisk: "low" },
      { id: "g-3", label: "Interior free of garbage and debris", tip: "The unit must be clean and free of accumulated trash or debris at the time of inspection.", failureRisk: "low" },
      { id: "g-4", label: "No hazardous materials stored improperly", tip: "Paint cans, chemicals, and flammable materials must be stored in appropriate containers away from living areas.", failureRisk: "medium" },
      { id: "g-5", label: "Adequate natural or artificial light in all rooms", tip: "Every habitable room needs at least one light source. Hallways and stairways need lighting too.", failureRisk: "low" },
    ],
  },
];

/** Flat list of all items for easy counting */
export const ALL_HQS_ITEMS = HQS_CHECKLIST.flatMap((c) => c.items);

/** Count of high-risk items — these are the most common failure points */
export const HIGH_RISK_COUNT = ALL_HQS_ITEMS.filter((i) => i.failureRisk === "high").length;
