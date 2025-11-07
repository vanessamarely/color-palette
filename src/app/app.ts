import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { ColorPalette } from './services/color-palette';
import { ColorPaletteResponse, HexColor } from './shared/types';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Inyección del servicio
  private readonly colorService = inject(ColorPalette);

  // Estado de la aplicación usando signals
  protected readonly loading = signal(false);
  protected readonly colors = signal<readonly HexColor[]>([]);
  protected readonly error = signal<string>('');
  protected readonly currentTheme = signal<string>('');
  protected readonly isFallback = signal(false);
  protected readonly notification = signal<string>('');

  // Control del formulario con validación
  protected readonly themeControl = new FormControl('Bosque tropical al atardecer', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(100)
  ]);

  /**
   * Maneja el envío del formulario para generar colores
   */
  protected async onSubmit(): Promise<void> {
    console.log('🚀 Formulario enviado correctamente');
    console.log('📝 Valor del formulario:', this.themeControl.value);
    console.log('✅ Formulario válido:', this.themeControl.valid);
    
    // Validar formulario
    if (this.themeControl.invalid || !this.themeControl.value) {
      console.log('❌ Formulario inválido');
      this.error.set('Por favor ingresa un tema válido (mínimo 3 caracteres)');
      return;
    }

    // Resetear estado
    this.loading.set(true);
    this.error.set('');
    this.colors.set([]);
    this.isFallback.set(false);
    this.notification.set('✅ Formulario enviado correctamente. Generando paleta...');

    const theme = this.themeControl.value.trim();
    this.currentTheme.set(theme);

    try {
      console.log('🎯 Iniciando generación de paleta para tema:', theme);
      
      // MODO DEBUG: Usar colores estáticos primero para probar la interfaz
      const debugMode = false;
      
      if (debugMode) {
        console.log('🧪 MODO DEBUG: Usando colores estáticos');
        const mockResponse: ColorPaletteResponse = {
          colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'] as const,
          theme: theme,
          fallback: true,
          message: 'Colores de prueba (modo debug)',
          timestamp: new Date().toISOString(),
          aiModel: 'debug-mode'
        };
        
        console.log('📦 Mock response:', mockResponse);
        
        // Actualizar estado con colores estáticos
        this.colors.set(mockResponse.colors);
        this.isFallback.set(mockResponse.fallback || false);
        
        console.log('🎨 Colores actualizados:', this.colors());
        console.log('🔢 Número de colores:', this.colors().length);
        console.log('✅ hasColors:', this.hasColors);
        
        if (mockResponse.fallback && mockResponse.message) {
          this.error.set(`Nota: ${mockResponse.message}`);
        }
      } else {
        // Llamar al servicio para generar colores (modo normal)
        const response: ColorPaletteResponse = await firstValueFrom(
          this.colorService.generatePalette(theme)
        );

        console.log('📦 Respuesta recibida:', response);

        // Actualizar estado con la respuesta
        this.colors.set(response.colors);
        this.isFallback.set(response.fallback || false);
        
        console.log('🎨 Colores actualizados:', this.colors());
        console.log('🔢 Número de colores:', this.colors().length);
        console.log('✅ hasColors:', this.hasColors);
        
        if (response.fallback && response.message) {
          this.error.set(`⚠️ ${response.message}`);
        } else if (!response.fallback) {
          // Mostrar mensaje de éxito brevemente
          this.notification.set(`✨ ¡Paleta generada exitosamente para "${theme}"!`);
        }
      }

    } catch (err) {
      console.error('❌ Error generating palette:', err);
      console.error('❌ Error details:', JSON.stringify(err, null, 2));
      this.error.set('Error al generar la paleta. Intenta nuevamente.');
      
      // Colores de emergencia si todo falla
      console.log('🚨 Usando colores de emergencia');
      this.colors.set(['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'] as const);
      this.isFallback.set(true);
      console.log('🎨 Colores de emergencia establecidos:', this.colors());
    } finally {
      this.loading.set(false);
      // Limpiar notificación después de 3 segundos
      setTimeout(() => {
        this.notification.set('');
      }, 3000);
    }
  }

  /**
   * Determina el color de texto basado en el color de fondo
   */
  protected getTextColor(backgroundColor: HexColor): string {
    return this.colorService.isLightColor(backgroundColor) ? '#333333' : '#FFFFFF';
  }

  /**
   * Copia un color al clipboard
   */
  protected async copyColor(color: HexColor): Promise<void> {
    try {
      await navigator.clipboard.writeText(color);
      console.log(`Color ${color} copiado al portapapeles`);
      
      // Feedback visual temporal
      const previousNotification = this.notification();
      this.notification.set(`📋 ${color} copiado al portapapeles`);
      
      // Restaurar notificación anterior después de 2 segundos
      setTimeout(() => {
        this.notification.set(previousNotification);
      }, 2000);
      
    } catch (err) {
      console.error('Error al copiar color:', err);
      this.notification.set('❌ Error al copiar color');
      setTimeout(() => {
        this.notification.set('');
      }, 2000);
    }
  }

  /**
   * Getter para mostrar si hay colores generados
   */
  protected get hasColors(): boolean {
    return this.colors().length > 0;
  }

  /**
   * Getter para el estado del formulario
   */
  protected get isFormValid(): boolean {
    return this.themeControl.valid;
  }
}
