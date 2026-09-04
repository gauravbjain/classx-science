/**
 * The canonical list of simulation ids.
 *
 * Adding a simulation: write the component under components/sims/, add its id
 * here, then add it to REGISTRY in components/sims/registry.tsx. TypeScript
 * enforces that this list and the registry stay in sync, and that every
 * { t: "sim", id } in any chapter refers to an id that actually exists.
 */
export const SIM_IDS = [
  // optics
  "mirror-ray", "lens-ray", "refraction-slab", "eye-defects", "prism-dispersion", "scattering",
  // electricity and magnetism
  "ohms-law", "series-parallel", "power-bill", "magnetic-field", "fleming-lhr", "domestic-circuit",
  // chemistry
  "equation-balancer", "ph-scale", "reactivity-series", "homologous-builder", "periodic-table",
  // biology
  "heart-circulation", "reflex-arc", "punnett-square", "digestion-journey", "plant-tropism",
  "nephron-filter", "flower-anatomy", "natural-selection",
  // environment
  "food-chain", "waste-sorter", "ozone-shield",
] as const;

export type SimId = (typeof SIM_IDS)[number];
