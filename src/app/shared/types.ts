/**
 * Tipos y interfaces específicas para Angular 20 + Vite
 * Con tipado estricto y mejores prácticas
 */

// Enums para mayor type safety
export enum ColorFormat {
  HEX = 'hex',
  RGB = 'rgb',
  HSL = 'hsl'
}

export enum ThemeCategory {
  NATURE = 'nature',
  URBAN = 'urban',
  ABSTRACT = 'abstract',
  SEASONAL = 'seasonal',
  EMOTION = 'emotion'
}

// Tipos utilitarios para colores
export type HexColor = `#${string}`;
export type RgbColor = `rgb(${number}, ${number}, ${number})`;
export type ColorValue = HexColor | RgbColor;

// Interfaces principales con tipado estricto
export interface ColorPaletteRequest {
  readonly theme: string;
  readonly count?: number;
  readonly format?: ColorFormat;
  readonly category?: ThemeCategory;
}

export interface ColorPaletteResponse {
  readonly colors: readonly HexColor[];
  readonly theme: string;
  readonly fallback: boolean;
  readonly message?: string;
  readonly timestamp: string;
  readonly aiModel: string;
}

export interface ColorInfo {
  readonly hex: HexColor;
  readonly rgb: RgbColor;
  readonly luminance: number;
  readonly isLight: boolean;
  readonly name?: string;
}

// Tipos para el estado del componente usando Signals
export interface AppState {
  readonly loading: boolean;
  readonly colors: readonly ColorInfo[];
  readonly error: string;
  readonly currentTheme: string;
  readonly isFallback: boolean;
  readonly notification: string;
}

// Tipos para configuración de Vite/Angular
export interface EnvironmentConfig {
  readonly production: boolean;
  readonly apiBaseUrl: string;
  readonly aiApiKey: string;
  readonly enableLogging: boolean;
}

// Tipos para el servicio de colores
export interface ColorService {
  generatePalette(request: ColorPaletteRequest): Promise<ColorPaletteResponse>;
  validateColor(color: string): color is HexColor;
  convertHexToRgb(hex: HexColor): RgbColor;
  calculateLuminance(hex: HexColor): number;
  isLightColor(hex: HexColor): boolean;
}

// Tipos para formularios reactivos
export interface ThemeFormValue {
  readonly theme: string;
}

export interface ThemeFormControls {
  readonly theme: string;
}

// Utility types para mejor inferencia
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type NonEmptyArray<T> = [T, ...T[]];

// Tipos específicos para Angular 20 Signals
export type WritableSignal<T> = import('@angular/core').WritableSignal<T>;
export type Signal<T> = import('@angular/core').Signal<T>;
export type ComputedSignal<T> = import('@angular/core').Signal<T>;

// Tipos para inyección de dependencias moderna
export type InjectOptions = import('@angular/core').InjectOptions;
export type Provider = import('@angular/core').Provider;

// Error types para mejor manejo de errores
export class ColorGenerationError extends Error {
  public override readonly cause?: unknown;
  public readonly retryable: boolean;
  
  constructor(
    message: string,
    cause?: unknown,
    retryable: boolean = true
  ) {
    super(message);
    this.name = 'ColorGenerationError';
    this.cause = cause;
    this.retryable = retryable;
  }
}

export class ApiKeyError extends Error {
  constructor(message: string = 'Invalid or missing API key') {
    super(message);
    this.name = 'ApiKeyError';
  }
}

// Tipos para validación de formularios
export interface ValidationErrors {
  readonly [key: string]: unknown;
}

export interface FormValidation {
  readonly isValid: boolean;
  readonly errors: ValidationErrors;
  readonly touched: boolean;
  readonly dirty: boolean;
}

// Constantes tipadas
export const DEFAULT_COLORS: readonly HexColor[] = [
  '#FF6B6B',
  '#4ECDC4', 
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7'
] as const;

export const THEME_EXAMPLES: readonly string[] = [
  'Bosque otoñal',
  'Océano profundo',
  'Neón cyberpunk',
  'Café parisino',
  'Aurora boreal'
] as const;

// Tipos para configuración del servidor
export interface ServerConfig {
  readonly port: number;
  readonly host: string;
  readonly cors: {
    readonly origin: readonly string[];
    readonly credentials: boolean;
  };
}

// Tipos para logging estructurado
export interface LogEntry {
  readonly level: 'info' | 'warn' | 'error' | 'debug';
  readonly message: string;
  readonly timestamp: string;
  readonly context?: Record<string, unknown>;
}

export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}