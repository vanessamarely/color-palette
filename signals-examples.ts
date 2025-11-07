// 📚 Ejemplos de signals: set() vs update()

import { signal } from '@angular/core';

// =============================================================================
// EJEMPLO 1: Contador simple
// =============================================================================

const counter = signal(0);

// ❌ Con set() - menos eficiente
counter.set(counter() + 1);

// ✅ Con update() - más limpio y eficiente
counter.update(current => current + 1);

// =============================================================================
// EJEMPLO 2: Array de colores
// =============================================================================

const colors = signal<string[]>([]);

// Para reemplazar completamente:
colors.set(['#FF0000', '#00FF00', '#0000FF']); // ✅ Usar set()

// Para agregar un color:
// ❌ Con set() - verboso
colors.set([...colors(), '#NEW_COLOR']);

// ✅ Con update() - más claro
colors.update(current => [...current, '#NEW_COLOR']);

// Para filtrar colores:
// ❌ Con set() - verboso
colors.set(colors().filter(color => color !== '#FF0000'));

// ✅ Con update() - más expresivo
colors.update(current => current.filter(color => color !== '#FF0000'));

// =============================================================================
// EJEMPLO 3: Objeto complejo
// =============================================================================

interface User {
  name: string;
  email: string;
  preferences: {
    theme: string;
    notifications: boolean;
  };
}

const user = signal<User>({
  name: 'Juan',
  email: 'juan@example.com',
  preferences: {
    theme: 'dark',
    notifications: true
  }
});

// Para reemplazar el usuario completo:
user.set({
  name: 'Ana',
  email: 'ana@example.com',
  preferences: { theme: 'light', notifications: false }
}); // ✅ Usar set()

// Para cambiar solo el nombre:
// ❌ Con set() - propenso a errores
user.set({
  ...user(),
  name: 'Pedro'
});

// ✅ Con update() - más seguro
user.update(current => ({
  ...current,
  name: 'Pedro'
}));

// Para cambiar solo las preferencias:
user.update(current => ({
  ...current,
  preferences: {
    ...current.preferences,
    theme: 'auto'
  }
}));

// =============================================================================
// EJEMPLO 4: Estados de loading con historial
// =============================================================================

interface LoadingState {
  isLoading: boolean;
  history: string[];
  lastAction: string;
}

const loadingState = signal<LoadingState>({
  isLoading: false,
  history: [],
  lastAction: ''
});

// Agregar acción al historial:
loadingState.update(current => ({
  ...current,
  isLoading: true,
  history: [...current.history, 'Generating colors'],
  lastAction: 'Generating colors'
}));

// =============================================================================
// EJEMPLO 5: Aplicado a tu proyecto
// =============================================================================

// En lugar de esto en tu componente:
// notification.set('📋 Color copiado');
// setTimeout(() => {
//   notification.set('');
// }, 2000);

// Podrías usar un signal más complejo:
interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: number;
}

const notificationState = signal<NotificationState>({
  message: '',
  type: 'info',
  timestamp: 0
});

// Y luego:
notificationState.update(current => ({
  ...current,
  message: '📋 Color copiado',
  type: 'success',
  timestamp: Date.now()
}));

// =============================================================================
// REGLAS DE ORO
// =============================================================================

/*
🎯 SET() - "Reemplazar todo"
- Cuando tienes el valor final completo
- Para primitivos simples (string, number, boolean)
- Para resetear a un estado inicial
- Para valores que no dependen del estado anterior

🎯 UPDATE() - "Modificar basándose en lo actual"
- Cuando necesitas el valor anterior para calcular el nuevo
- Para objetos y arrays complejos
- Para operaciones como agregar, filtrar, mapear
- Para cambios parciales en objetos
*/

export { }; // Para que TypeScript lo trate como módulo