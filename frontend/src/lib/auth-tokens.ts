// src/lib/auth-tokens.ts
import Cookies from 'js-cookie';
import { AuthTokens } from '@/types';

const TOKEN_KEY = 'auth_tokens';
const COOKIE_OPTIONS = {
  expires: 7,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

/**
 * Récupère les tokens sous forme d'objet
 */
export const getTokens = (): AuthTokens | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = Cookies.get(TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Stocke les tokens (à la fois le cookie JSON et les cookies individuels)
 */
export const setTokens = (tokens: AuthTokens): void => {
  if (typeof window === 'undefined') return;
  // Stockage JSON
  Cookies.set(TOKEN_KEY, JSON.stringify(tokens), COOKIE_OPTIONS);
  // Stockage individuel pour compatibilité avec d'éventuels autres composants
  document.cookie = `accessToken=${tokens.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  document.cookie = `refreshToken=${tokens.refreshToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
};

/**
 * Supprime les tokens (JSON et cookies individuels)
 */
export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  Cookies.remove(TOKEN_KEY);
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

/**
 * Récupère l'access token (pour l'intercepteur)
 */
export const getAccessToken = (): string | null => {
  const tokens = getTokens();
  return tokens?.accessToken || null;
};

/**
 * Récupère le refresh token
 */
export const getRefreshToken = (): string | null => {
  const tokens = getTokens();
  return tokens?.refreshToken || null;
};