/**
 * Shared Constants
 * SOLID-Prinzip: Open/Closed - Konfiguration ohne Code-Änderung
 */

export const COLORS = {
	CHRISTMAS_RED: '#DC143C',
	CHRISTMAS_GREEN: '#228B22',
	CHRISTMAS_GOLD: '#FFD700',
	DARK_BG: '#0F1419',
	LIGHT_TEXT: '#FFF8DC'
} as const;

export const BREAKPOINTS = {
	SM: 640,
	MD: 768,
	LG: 1024,
	XL: 1920
} as const;

export const DEFAULT_POINT_VALUES = [100, 200, 300, 400, 500];
export const MIN_PLAYER_NAME_LENGTH = 2;
export const MAX_PLAYER_NAME_LENGTH = 20;
export const DEFAULT_PORT = 3000;
export const WS_PATH = '/ws';

