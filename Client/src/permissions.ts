import { CountryCode } from "./contexts/AuthContext";

/** clefs = "slug" logique de tes pages */
export type RouteKey =
  | "dashboard"
  | "countries"
  | "country-detail"
  | "analytics"
  | "data-management"
  | "prediction";

const PERMISSIONS: Record<CountryCode, RouteKey[]> = {
  usa: [
    "dashboard",
    "countries",
    "country-detail",
    "analytics",
    "data-management",
    "prediction",
  ],
  fr: [
    "dashboard",
    "countries",
    "country-detail",
    "analytics",
    "data-management",
  ],
  ch: ["prediction"],
};

export const canAccess = (country: CountryCode, routeKey: RouteKey) =>
  PERMISSIONS[country].includes(routeKey);
