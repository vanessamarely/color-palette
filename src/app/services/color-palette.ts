import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { retry, catchError, map } from 'rxjs/operators';
import { 
  ColorPaletteRequest, 
  ColorPaletteResponse, 
  HexColor, 
  ColorInfo,
  ColorGenerationError,
  DEFAULT_COLORS 
} from '../shared/types';

@Injectable({
  providedIn: 'root',
})
export class ColorPalette {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/colors' as const;

  private readonly cache = new Map<string, ColorPaletteResponse>();

  /**
   * Genera una paleta de colores basada en un tema usando IA
   * @param theme - El tema para generar los colores (ej: "bosque tropical")
   * @returns Observable con la respuesta de la API
   */
  generatePalette(theme: string): Observable<ColorPaletteResponse> {
    const trimmedTheme = theme.trim().toLowerCase();
    
    // Verificar cache primero
    const cached = this.cache.get(trimmedTheme);
    if (cached) {
      console.log(`🎨 Usando cache para tema: ${trimmedTheme}`);
      return of(cached);
    }

    const request: ColorPaletteRequest = { theme: trimmedTheme };
    
    return this.http.post<ColorPaletteResponse>(this.apiUrl, request).pipe(
      // Reintentar hasta 3 veces si falla
      retry(3),
      
      // Guardar en cache si es exitoso
      map(response => {
        this.cache.set(trimmedTheme, response);
        console.log(`✅ Guardado en cache: ${trimmedTheme}`);
        return response;
      }),
      
      // Manejo de errores con fallback
      catchError(error => {
        console.error('❌ Error generando paleta:', error);
        return this.getFallbackPalette(trimmedTheme);
      })
    );
  }

  /**
   * Retorna una paleta de colores por defecto cuando la IA falla
   * @param theme - El tema original solicitado
   * @returns Observable con paleta de respaldo
   */
  private getFallbackPalette(theme: string): Observable<ColorPaletteResponse> {
    const fallbackResponse: ColorPaletteResponse = {
      colors: DEFAULT_COLORS,
      theme: theme,
      fallback: true,
      message: 'Se usaron colores por defecto debido a un error en la IA',
      timestamp: new Date().toISOString(),
      aiModel: 'fallback'
    };

    return of(fallbackResponse);
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

  /**
   * Limpia el cache de paletas guardadas
   * Útil para testing o para liberar memoria
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Cache de paletas limpiado');
  }

  /**
   * Obtiene estadísticas del cache actual
   * @returns Información sobre temas cacheados
   */
  getCacheStats(): { size: number; themes: string[] } {
    return {
      size: this.cache.size,
      themes: Array.from(this.cache.keys())
    };
  }
}
