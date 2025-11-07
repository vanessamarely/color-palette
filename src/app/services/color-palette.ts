import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  ColorPaletteRequest, 
  ColorPaletteResponse, 
  HexColor, 
  ColorInfo,
  ColorGenerationError 
} from '../shared/types';

@Injectable({
  providedIn: 'root',
})
export class ColorPalette {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/colors' as const;

  /**
   * Genera una paleta de colores basada en un tema usando IA
   * @param theme - El tema para generar los colores (ej: "bosque tropical")
   * @returns Observable con la respuesta de la API
   */
  generatePalette(theme: string): Observable<ColorPaletteResponse> {
    const request: ColorPaletteRequest = { theme: theme.trim() };
    
    return this.http.post<ColorPaletteResponse>(this.apiUrl, request);
  }

  /**
   * Valida que un color esté en formato hexadecimal
   * @param color - El color a validar
   * @returns true si es válido
   */
  isValidHexColor(color: string): color is HexColor {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }

  /**
   * Convierte un color hex a RGB para cálculos adicionales
   * @param hex - Color en formato hex
   * @returns Objeto con valores r, g, b
   */
  hexToRgb(hex: HexColor): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Calcula si un color es claro u oscuro para determinar el color del texto
   * @param hex - Color en formato hex
   * @returns true si es claro, false si es oscuro
   */
  isLightColor(hex: HexColor): boolean {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return false;
    
    // Fórmula de luminancia: https://en.wikipedia.org/wiki/Relative_luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5;
  }
}
