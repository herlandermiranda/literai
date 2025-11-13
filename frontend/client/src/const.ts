import { getApiBaseUrlSync, initializeApiConfig } from './lib/apiConfig';

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "LiterAI - Assistant d'Écriture Littéraire";

export const APP_LOGO = "/logo.svg";

// API Configuration
// Dynamically detected based on current location
export const API_BASE_URL = getApiBaseUrlSync();
export const API_V1_PREFIX = "/api/v1";

// Initialize API configuration on startup
if (typeof window !== 'undefined') {
  initializeApiConfig().catch(error => {
    console.error('[LiterAI] Failed to initialize API configuration:', error);
  });
}

// Local Storage Keys
export const AUTH_TOKEN_KEY = "literai_auth_token";
export const AUTH_USER_KEY = "literai_auth_user";

// Editor Configuration
export const AUTO_SAVE_DELAY = 2000; // 2 seconds
export const WORD_COUNT_UPDATE_DELAY = 500; // 0.5 seconds

// LLM Configuration
export const DEFAULT_CONTINUATION_LENGTH = 500;
export const MIN_CONTINUATION_LENGTH = 50;
export const MAX_CONTINUATION_LENGTH = 2000;

// Entity Types
export const ENTITY_TYPES = [
  { value: "character", label: "Personnage" },
  { value: "location", label: "Lieu" },
  { value: "object", label: "Objet" },
  { value: "concept", label: "Concept" },
  { value: "organization", label: "Organisation" },
  { value: "event", label: "Événement" },
] as const;

// Document Types
export const DOCUMENT_TYPES = [
  { value: "draft", label: "Brouillon" },
  { value: "scene", label: "Scène" },
  { value: "note", label: "Note" },
  { value: "outline", label: "Plan" },
  { value: "worldbuilding", label: "Worldbuilding" },
  { value: "character_sheet", label: "Fiche Personnage" },
  { value: "location_sheet", label: "Fiche Lieu" },
] as const;

// Arc Colors
export const ARC_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
] as const;

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
