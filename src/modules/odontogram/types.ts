export const toothSurfaces = ["mesial", "distal", "occlusal", "buccal", "lingual"] as const;
export type ToothSurface = (typeof toothSurfaces)[number];
export type SurfaceCondition = "SOUND" | "CARIES" | "AMALGAM" | "COMPOSITE" | "SEALANT" | "CROWN" | "PLANNED";
export type ToothSurfaceMap = Record<ToothSurface, SurfaceCondition>;
export type ToothOverallStatus = "HEALTHY" | "MISSING" | "IMPACTED" | "CROWN" | "BRIDGE" | "IMPLANT" | "EXTRACTION_INDICATED" | "ENDO_TREATED";
export type ToothChartTag = "HEALTHY" | "CARIES" | "COMPOSITE" | "CROWN" | "ROOT_CANAL" | "MISSING";

export const healthySurfaces: ToothSurfaceMap = { mesial: "SOUND", distal: "SOUND", occlusal: "SOUND", buccal: "SOUND", lingual: "SOUND" };
export function isValidFdiTooth(number: number, pediatric = true): boolean {
  const quadrant = Math.floor(number / 10); const position = number % 10;
  return position >= 1 && position <= (quadrant >= 5 ? 5 : 8) && (quadrant >= 1 && quadrant <= (pediatric ? 8 : 4));
}
