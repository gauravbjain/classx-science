"use client";
import React from "react";
import type { SimId } from "@/lib/sim-ids";
import { MirrorRay, LensRay, RefractionSlab, EyeDefects, PrismDispersion, Scattering } from "./optics";
import { OhmsLaw, SeriesParallel, PowerBill, MagneticField, FlemingLHR, DomesticCircuit } from "./electricity";
import { EquationBalancer, PhScale, ReactivitySeries, HomologousBuilder, PeriodicTable } from "./chemistry";
import { HeartCirculation, ReflexArc, PunnettSquare, DigestionJourney, PlantTropism, NephronFilter, FlowerAnatomy, NaturalSelection } from "./biology";
import { FoodChain, WasteSorter, OzoneShield } from "./environment";
import { PolynomialGraph, LinearPair, QuadraticRoots, APExplorer, FactorHcfLcm } from "./maths-algebra";
import { SimilarTriangles, CoordinatePlane, TrigRatios, HeightsDistances, CircleTangents, SectorSegment, SolidsCombo } from "./maths-geometry";
import { GroupedData, ProbabilitySim } from "./maths-stats";
import {
  EuropeTimeline, IndiaFreedomTimeline, GlobalWorldTimeline, PrintCultureTimeline,
  IndustrialisationTimeline, PowerSharingForms, FederalismLists, PartySystem, DemocracyOutcomes,
} from "./social-core";
import {
  IndiaLocator, LandUse, CroppingSeasons, WildlifeStatus, DamTradeoffs, EnergyMix,
  IndustryLocation, TransportCompare,
} from "./social-geo";
import {
  DevelopmentCompare, SectorsEconomy, MoneyCredit, GlobalisationChain, ConsumerRights,
  SocialDivisions,
} from "./social-econ";

/** TypeScript enforces that this covers exactly the ids in lib/sim-ids.ts. */
const REGISTRY: Record<SimId, React.ComponentType> = {
  "mirror-ray": MirrorRay,
  "lens-ray": LensRay,
  "refraction-slab": RefractionSlab,
  "eye-defects": EyeDefects,
  "prism-dispersion": PrismDispersion,
  "scattering": Scattering,
  "ohms-law": OhmsLaw,
  "series-parallel": SeriesParallel,
  "power-bill": PowerBill,
  "magnetic-field": MagneticField,
  "fleming-lhr": FlemingLHR,
  "domestic-circuit": DomesticCircuit,
  "equation-balancer": EquationBalancer,
  "ph-scale": PhScale,
  "reactivity-series": ReactivitySeries,
  "homologous-builder": HomologousBuilder,
  "periodic-table": PeriodicTable,
  "heart-circulation": HeartCirculation,
  "reflex-arc": ReflexArc,
  "punnett-square": PunnettSquare,
  "digestion-journey": DigestionJourney,
  "plant-tropism": PlantTropism,
  "nephron-filter": NephronFilter,
  "flower-anatomy": FlowerAnatomy,
  "natural-selection": NaturalSelection,
  "food-chain": FoodChain,
  "waste-sorter": WasteSorter,
  "ozone-shield": OzoneShield,

  "polynomial-graph": PolynomialGraph,
  "linear-pair": LinearPair,
  "quadratic-roots": QuadraticRoots,
  "ap-explorer": APExplorer,
  "factor-hcf-lcm": FactorHcfLcm,
  "similar-triangles": SimilarTriangles,
  "coordinate-plane": CoordinatePlane,
  "trig-ratios": TrigRatios,
  "heights-distances": HeightsDistances,
  "circle-tangents": CircleTangents,
  "sector-segment": SectorSegment,
  "solids-combo": SolidsCombo,
  "grouped-data": GroupedData,
  "probability-sim": ProbabilitySim,

  "europe-timeline": EuropeTimeline,
  "india-freedom-timeline": IndiaFreedomTimeline,
  "global-world-timeline": GlobalWorldTimeline,
  "print-culture-timeline": PrintCultureTimeline,
  "industrialisation-timeline": IndustrialisationTimeline,
  "india-locator": IndiaLocator,
  "land-use": LandUse,
  "cropping-seasons": CroppingSeasons,
  "wildlife-status": WildlifeStatus,
  "dam-tradeoffs": DamTradeoffs,
  "energy-mix": EnergyMix,
  "industry-location": IndustryLocation,
  "transport-compare": TransportCompare,
  "power-sharing-forms": PowerSharingForms,
  "federalism-lists": FederalismLists,
  "social-divisions": SocialDivisions,
  "party-system": PartySystem,
  "democracy-outcomes": DemocracyOutcomes,
  "development-compare": DevelopmentCompare,
  "sectors-economy": SectorsEconomy,
  "money-credit": MoneyCredit,
  "globalisation-chain": GlobalisationChain,
  "consumer-rights": ConsumerRights,
};

export default function Sim({ id }: { id: SimId; title?: string; caption?: string }) {
  const C = REGISTRY[id];
  if (!C) return null;
  return <C />;
}
