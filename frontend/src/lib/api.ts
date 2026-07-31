// Central API & Socket configuration
// All backend URLs must be read from this file — NEVER hardcode them elsewhere.

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
export const API_BASE = `${BACKEND_URL}/api`;
