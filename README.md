# 🎨 Generador de Paletas de Colores con IA

Una aplicación Angular full-stack que utiliza inteligencia artificial (Google Gemini) para generar paletas de colores hermosas basadas en temas descriptivos.

## 🌟 Características

- **Generación con IA**: Utiliza Google Gemini AI para crear paletas únicas
- **Angular SSR**: Server-Side Rendering para mejor rendimiento y SEO
- **Interfaz Moderna**: Design system con signals de Angular y CSS moderno
- **Responsive**: Funciona perfectamente en desktop y móvil
- **Copiado Fácil**: Un clic para copiar códigos hexadecimales
- **Colores de Respaldo**: Sistema de fallback robusto

## 🚀 Tutorial Paso a Paso

### Prerrequisitos

- Node.js 18+ instalado
- npm o yarn
- Cuenta en Google AI Studio para obtener API key

### Paso 1: Crear el Proyecto Angular con SSR

```bash
# Crear nuevo proyecto Angular con SSR habilitado
ng new color-palette-app --ssr=true --routing=false --style=css --skip-tests=true

# Navegar al directorio del proyecto
cd color-palette-app
```

### Paso 2: Instalar Dependencias

```bash
# Ya están incluidas en el proyecto Angular SSR generado
# No es necesario instalar dependencias adicionales para la IA
# Angular SSR incluye todo lo necesario para HTTP requests
```

**Nota**: A diferencia del tutorial original con Genkit, este proyecto usa directamente la API REST de Google Gemini sin SDKs adicionales, lo que simplifica la configuración y reduce las dependencias.

### Paso 3: Configurar Variables de Entorno (⚠️ IMPORTANTE para Seguridad)

1. **Obtén tu API key de Google AI Studio**: 
   - Ve a https://ai.google.dev/
   - Inicia sesión con tu cuenta de Google
   - Haz clic en "Get API Key" y crea una nueva clave

2. **Copia el archivo de ejemplo**:
```bash
cp .env.example .env
```

3. **Edita el archivo `.env`** y reemplaza `your_gemini_api_key_here` con tu API key real:
```bash
# .env (en la raíz del proyecto)
GOOGLE_AI_API_KEY=AIzaSy...tu_api_key_real_aqui
PORT=4200
```

4. **⚠️ NUNCA subas el archivo `.env` a Git**: 
   - El archivo ya está incluido en `.gitignore`
   - Esto protege tu API key de ser expuesta públicamente

5. **Para producción**: Configura la variable de entorno `GOOGLE_AI_API_KEY` en tu plataforma de hosting (Vercel, Netlify, etc.)

**Nota**: El servidor Angular SSR carga automáticamente las variables desde `.env` usando una función personalizada que busca el archivo en la raíz del proyecto.

### Paso 4: Configurar el Servidor Express (Backend)

El archivo `src/server.ts` incluye:
- **Carga automática de variables de entorno** desde `.env`
- **API endpoint** `/api/colors` que se comunica con Google Gemini
- **Extracción robusta de colores** con múltiples métodos de parsing
- **Sistema de fallback** para casos de error
- **Logging detallado** para debugging

```typescript
// Características clave del servidor:
- Carga de .env desde el directorio raíz del proyecto
- Múltiples intentos de extracción de colores (JSON, regex)
- Manejo de errores con colores de respaldo
- Integración nativa con Angular SSR
```

### Paso 5: Crear el Servicio Angular (Frontend)

El archivo `src/app/services/color-palette.service.ts` proporciona:
- **HttpClient** para comunicación con la API
- **Tipado estricto** con interfaces TypeScript
- **Manejo de errores** y estados de carga
- **Utilidades** para trabajar con colores

### Paso 6: Implementar el Componente Principal

El archivo `src/app/app.ts` utiliza las características modernas de Angular 20:
- **Signals** para manejo de estado reactivo
- **Reactive Forms** con tipado estricto
- **Función inject()** para dependency injection
- **Standalone components** sin NgModules

### Paso 7: Crear la Interfaz de Usuario

El template `src/app/app.html` incluye:
- **Nueva sintaxis de control flow** (`@if`, `@for`)
- **Design system moderno** con CSS Grid y Flexbox
- **Funcionalidad copy-to-clipboard** nativa
- **Estados de carga y error** informativos

### Paso 8: Estilos Modernos

El archivo `src/app/app.css` implementa:
- **CSS Custom Properties** para temas
- **CSS Grid** para layouts responsivos
- **Animaciones** suaves y microinteracciones
- **Design mobile-first** responsive

### Paso 9: Configuración de la Aplicación

El archivo `src/app/app.config.ts` está configurado con:
- **HttpClient** para requests HTTP
- **Angular SSR** con hydration
- **Providers** necesarios para el funcionamiento

### Paso 10: Ejecutar la Aplicación

```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start

# La aplicación estará disponible en http://localhost:4200
```

## 🎯 Características Técnicas

### Tecnologías Utilizadas
- **Frontend**: Angular 20.3.9 (Latest) con SSR
- **Build Tool**: Vite (reemplaza Webpack)
- **Backend**: Express.js integrado con Node.js 18+
- **IA**: Google Gemini AI API (modelo 2.0-flash-exp)
- **TypeScript**: 5.6+ con configuración estricta
- **Estilos**: CSS moderno con Grid, Flexbox y Custom Properties
- **Estado**: Angular Signals (moderno, reemplaza RxJS para estado local)
- **Formularios**: Angular Reactive Forms con tipado estricto
- **HTTP**: Angular HttpClient con fetch() API

### Características Modernas de Angular 20
- **Control Flow Syntax**: `@if`, `@for`, `@switch` (nueva sintaxis)
- **Standalone Components**: Sin NgModules por defecto
- **Signals**: Sistema reactivo optimizado para rendimiento
- **Dependency Injection**: Función `inject()` moderna
- **SSR Mejorado**: Hydration automática con event replay
- **Vite Integration**: Build y HMR más rápidos que Webpack

### Arquitectura
- **Componente Principal**: Maneja estado y lógica de negocio
- **Servicio**: Comunicación con API y utilidades de color
- **API Route**: Endpoint Express para integración con IA
- **SSR**: Renderizado del lado del servidor para mejor SEO

## 🎨 Personalización

### Cambiar el Modelo de IA
```typescript
// En server.ts
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
```

### Modificar Colores de Fallback
```typescript
// En server.ts
const fallbackColors = [
  '#TUS_COLORES', '#PERSONALIZADOS', '#AQUI'
];
```

## 🚀 Despliegue

### Producción Local
```bash
npm run build
npm run serve:ssr
```

### Vercel/Netlify
1. Configura las variables de entorno en tu plataforma
2. Sube el repositorio
3. Configura el build command: `npm run build`

## 🐛 Resolución de Problemas

### Error: API Key no válida
- Verifica que tu API key esté correcta en `.env`
- Asegúrate de que la API key tenga permisos para Gemini

### Los colores no se muestran
- Revisa la consola del navegador para errores
- Verifica que el servidor esté ejecutándose
- Comprueba que HttpClient esté configurado

### Error de CORS
- Asegúrate de que estés ejecutando en `localhost:4200`
- Verifica que el servidor Express esté configurado correctamente

## 📚 Recursos Adicionales

- [Documentación de Angular](https://angular.dev)
- [Google AI Studio](https://makersuite.google.com)
- [Angular SSR Guide](https://angular.dev/guide/ssr)
- [Guía de Migración](./MIGRATION-GUIDE.md) - Diferencias entre Angular anterior vs Angular 20

## 📄 Licencia

MIT License - ve el archivo LICENSE para más detalles.

---

¡Disfruta creando paletas de colores hermosas con IA! 🎨✨
