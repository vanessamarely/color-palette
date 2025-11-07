# 📚 Guía de Migración: Angular Anterior vs Angular 20

Esta guía explica las diferencias entre las versiones anteriores de Angular y Angular 20, mostrando qué cambió y por qué.

## 🚀 Cambios Principales en Angular 20

### 1. **Control Flow Syntax**

#### ❌ **Antes (Angular < 17)**
```html
<!-- Sintaxis con directivas estructurales -->
<div *ngIf="loading">Cargando...</div>
<div *ngIf="error; else success">Error occurred</div>

<div *ngFor="let item of items; trackBy: trackByFn; let i = index">
  {{ i }}: {{ item.name }}
</div>

<div [ngSwitch]="status">
  <div *ngSwitchCase="'loading'">Loading...</div>
  <div *ngSwitchCase="'error'">Error!</div>
  <div *ngSwitchDefault>Success!</div>
</div>
```

#### ✅ **Ahora (Angular 17+)**
```html
<!-- Nueva sintaxis de control de flujo -->
@if (loading) {
  <div>Cargando...</div>
} @else if (error) {
  <div>Error occurred</div>
} @else {
  <div>Success!</div>
}

@for (item of items; track item.id; let i = $index) {
  <div>{{ i }}: {{ item.name }}</div>
}

@switch (status) {
  @case ('loading') { <div>Loading...</div> }
  @case ('error') { <div>Error!</div> }
  @default { <div>Success!</div> }
}
```

**¿Por qué cambió?**
- Mejor rendimiento en tiempo de compilación
- Sintaxis más limpia y legible
- Mejor tree-shaking
- IntelliSense mejorado en editores

---

### 2. **Componentes Standalone**

#### ❌ **Antes (Angular < 14)**
```typescript
// Se requería NgModule
@NgModule({
  declarations: [MyComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [MyComponent]
})
export class MyModule {}

@Component({
  selector: 'app-my-component',
  template: `<div>Content</div>`
})
export class MyComponent {}
```

#### ✅ **Ahora (Angular 20)**
```typescript
// Componentes standalone por defecto
@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `<div>Content</div>`
})
export class MyComponent {}
```

**¿Por qué cambió?**
- Menos boilerplate code
- Mejor tree-shaking
- Lazy loading más simple
- Arquitectura más modular

---

### 3. **Sistema de Signals**

#### ❌ **Antes (Angular < 16)**
```typescript
export class MyComponent {
  loading = false;
  users: User[] = [];
  
  constructor() {
    // Detección de cambios manual o con observables
  }
  
  updateUsers(newUsers: User[]) {
    this.users = newUsers;
    // Angular detecta cambios con Zone.js
  }
}
```

#### ✅ **Ahora (Angular 20)**
```typescript
export class MyComponent {
  protected readonly loading = signal(false);
  protected readonly users = signal<User[]>([]);
  protected readonly activeUsers = computed(() => 
    this.users().filter(user => user.active)
  );
  
  constructor() {
    effect(() => {
      console.log('Users changed:', this.users().length);
    });
  }
  
  updateUsers(newUsers: User[]) {
    this.users.set(newUsers);
    // Signals optimizan automáticamente los re-renders
  }
}
```

**¿Por qué cambió?**
- Mejor rendimiento (fine-grained reactivity)
- Menos dependencia de Zone.js
- Detección de cambios más eficiente
- Mejor composición de estado

---

### 4. **Inyección de Dependencias**

#### ❌ **Antes (Angular < 14)**
```typescript
export class MyComponent {
  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}
}
```

#### ✅ **Ahora (Angular 20)**
```typescript
export class MyComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
}
```

**¿Por qué cambió?**
- Sintaxis más funcional
- Mejor tree-shaking
- Más flexible para composición
- Funciona mejor con funciones puras

---

### 5. **Build Tool: Webpack → Vite**

#### ❌ **Antes (Angular < 17)**
```javascript
// angular.json usaba Webpack
"build": {
  "builder": "@angular-devkit/build-angular:browser",
  // Configuración compleja de Webpack
}

// Variables de entorno
const apiKey = process.env['API_KEY'];
```

#### ✅ **Ahora (Angular 20)**
```javascript
// angular.json usa Vite
"build": {
  "builder": "@angular-devkit/build-angular:application",
  // Vite maneja la optimización automáticamente
}

// Variables de entorno con Vite
const apiKey = import.meta.env['VITE_API_KEY'];
```

**¿Por qué cambió?**
- Builds más rápidos (hasta 10x más rápido)
- Hot Module Replacement (HMR) más eficiente
- Menos configuración necesaria
- Mejor soporte para ES modules

---

### 6. **Formularios Reactivos**

#### ❌ **Antes**
```typescript
export class MyComponent {
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });
  
  constructor(private fb: FormBuilder) {}
  
  onSubmit() {
    if (this.form.valid) {
      const value = this.form.value; // tipo: any
    }
  }
}
```

#### ✅ **Ahora (Angular 20)**
```typescript
interface FormValue {
  name: string;
  email: string;
}

export class MyComponent {
  private readonly fb = inject(FormBuilder);
  
  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });
  
  protected onSubmit(): void {
    if (this.form.valid) {
      const value: FormValue = this.form.getRawValue(); // tipado fuerte
    }
  }
}
```

**¿Por qué cambió?**
- Mejor tipado con TypeScript
- Función inject() más moderna
- Patrones más funcionales

---

### 7. **SSR y Hydration**

#### ❌ **Antes (Angular Universal)**
```typescript
// Configuración compleja de Angular Universal
// app.server.module.ts, main.server.ts, etc.
// Hydration manual y propensa a errores
```

#### ✅ **Ahora (Angular 20)**
```typescript
// SSR integrado con --ssr flag
ng new my-app --ssr

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    // Hydration automática
  ]
};
```

**¿Por qué cambió?**
- Configuración más simple
- Hydration automática y optimizada
- Mejor experiencia de desarrollador
- Menos errores de hidratación

---

### 8. **Routing**

#### ❌ **Antes**
```typescript
// Guardias de clase
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(): boolean {
    return this.authService.isAuthenticated();
  }
}

// En routes
{
  path: 'protected',
  component: ProtectedComponent,
  canActivate: [AuthGuard]
}
```

#### ✅ **Ahora (Angular 20)**
```typescript
// Guardias funcionales
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};

// En routes
{
  path: 'protected',
  loadComponent: () => import('./protected.component'),
  canActivate: [authGuard]
}
```

**¿Por qué cambió?**
- Más funcional, menos orientado a objetos
- Mejor tree-shaking
- Lazy loading simplificado
- Menos boilerplate

---

## 🔄 **Proceso de Migración**

### Paso 1: Control Flow
```bash
# Angular provee migración automática
ng update @angular/core --migrate-only control-flow
```

### Paso 2: Standalone Components
```bash
ng generate @angular/core:standalone
```

### Paso 3: Signals
```typescript
// Migrar gradualmente de propiedades a signals
// Antes: this.loading = true
// Después: this.loading.set(true)
```

---

## 📊 **Comparación de Rendimiento**

| Aspecto | Angular < 16 | Angular 20 |
|---------|-------------|------------|
| Build Time | ~60s | ~6s |
| Bundle Size | ~2.1MB | ~1.8MB |
| Runtime Performance | Baseline | +15-30% mejor |
| Memory Usage | Baseline | -20% menos |
| First Paint | Baseline | +25% más rápido |

---

## ✅ **Checklist de Migración**

- [ ] Actualizar a Angular 20
- [ ] Migrar control flow (`*ngIf` → `@if`)
- [ ] Convertir a standalone components
- [ ] Implementar signals para estado local
- [ ] Usar función `inject()` para DI
- [ ] Actualizar variables de entorno (Vite)
- [ ] Configurar SSR con hydration
- [ ] Migrar guardias a funciones
- [ ] Actualizar tests para signals
- [ ] Optimizar imports y tree-shaking

---

## 🎯 **Recomendaciones Finales**

1. **Migra gradualmente** - No todo de una vez
2. **Usa Angular CLI** - Provee migraciones automáticas
3. **Prioriza signals** - Para nuevo estado de componentes
4. **Aprovecha standalone** - Para nuevos componentes
5. **Optimiza con Vite** - Configuración mínima necesaria

Esta guía te ayuda a entender el "por qué" detrás de cada cambio, no solo el "cómo" implementarlo.