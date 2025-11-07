import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Función para cargar variables de entorno
function loadEnvironmentVariables() {
  try {
    // Buscar .env en el directorio raíz del proyecto
    const workingDir = process.cwd();
    const envPath = join(workingDir, '.env');
    const envFile = readFileSync(envPath, 'utf8');
    
    const envVars: Record<string, string> = {};
    envFile.split('\n').forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Ignorar líneas vacías y comentarios
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return;
      }
      
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        const value = trimmedLine.substring(equalIndex + 1).trim().replace(/^["']|["']$/g, '');
        
        if (key && value) {
          envVars[key] = value;
        }
      }
    });
    
    // Asignar variables a process.env
    Object.entries(envVars).forEach(([key, value]) => {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
    
    console.log('✅ Environment variables loaded from .env');
    return envVars;
  } catch (error) {
    console.log('⚠️  No .env file found, using system environment variables');
    return {};
  }
}

// Cargar variables al iniciar
loadEnvironmentVariables();

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * API Routes - Implementación directa de la API de colores
 */
app.use(express.json()); // Para parsear JSON en las peticiones


app.post('/api/colors', async (req, res) => {
    console.log('🎯 API /api/colors llamada con:', req.body);
    
    try {
      const { theme } = req.body;
      
      console.log('📝 Tema recibido:', theme);
      
      if (!theme || typeof theme !== 'string') {
        console.log('❌ Tema inválido');
        return res.status(400).json({ 
          error: 'Theme is required and must be a string' 
        });
      }

    // Obtener la API key de múltiples fuentes posibles
    const apiKey = process.env['GOOGLE_AI_API_KEY'] || 
                   process.env['GEMINI_API_KEY'] ||
                   process.env['VITE_GOOGLE_AI_API_KEY'];
    
    if (!apiKey) {
      console.log('❌ API key not found in environment variables');
      return res.json({
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
        theme,
        fallback: true,
        message: 'API key not configured, using fallback colors'
      });
    }

    // Llamar a la API de Gemini 2.5
    const prompt = `Generate exactly 5 hex color codes for the theme "${theme}".

IMPORTANT: Respond ONLY with a valid JSON array of 5 hex color strings. No explanation, no markdown, no code blocks.

Format: ["#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB"]

Example for "ocean sunset": ["#FF6B35", "#F7931E", "#FFD23F", "#4A90E2", "#5A67D8"]

Theme: ${theme}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    // Extraer el texto de la respuesta de Gemini
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    console.log('🤖 AI Response received, length:', generatedText?.length);
    
    if (!generatedText) {
      throw new Error('No response from AI');
    }

    // Función para extraer colores de manera más robusta
    function extractColors(text: string): string[] | null {
      try {
        // Método 1: Intentar JSON directo
        const cleaned = text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.every(c => typeof c === 'string' && c.startsWith('#'))) {
          console.log('✅ JSON extraction successful');
          return parsed.slice(0, 5); // Solo tomar los primeros 5
        }
      } catch (e) {
        console.log('🔄 JSON failed, trying regex extraction...');
      }

      // Método 2: Buscar colores hex con regex
      const hexRegex = /#[A-Fa-f0-9]{6}/g;
      const matches = text.match(hexRegex);
      if (matches && matches.length >= 5) {
        console.log('✅ Regex extraction successful (6-digit hex)');
        return matches.slice(0, 5);
      }

      // Método 3: Buscar colores hex de 3 dígitos
      const hexShortRegex = /#[A-Fa-f0-9]{3}/g;
      const shortMatches = text.match(hexShortRegex);
      if (shortMatches && shortMatches.length >= 5) {
        console.log('✅ Regex extraction successful (3-digit hex, expanded)');
        // Convertir colores de 3 dígitos a 6 dígitos
        return shortMatches.slice(0, 5).map(color => {
          const [, r, g, b] = color.match(/#([A-Fa-f0-9])([A-Fa-f0-9])([A-Fa-f0-9])/) || [];
          return `#${r}${r}${g}${g}${b}${b}`;
        });
      }

      return null;
    }

    // Intentar extraer colores
    const colors = extractColors(generatedText);
    
    if (colors && colors.length >= 5) {
      console.log('🎨 Successfully generated colors for theme:', theme);
      return res.json({ 
        colors, 
        theme,
        fallback: false,
        message: `Colores generados con IA para "${theme}"`,
        timestamp: new Date().toISOString(),
        aiModel: 'gemini-2.0-flash-exp'
      });
    } else {
      console.error('❌ No valid colors extracted from AI response');
      console.error('❌ Original AI text:', generatedText);
      
      // Si falla la extracción, generar colores de fallback
      const fallbackColors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', 
        '#96CEB4', '#FFEAA7'
      ];
      
      return res.json({ 
        colors: fallbackColors, 
        theme,
        fallback: true,
        message: `AI parsing failed. Original response: "${generatedText?.substring(0, 100)}..."`,
        timestamp: new Date().toISOString(),
        aiModel: 'fallback'
      });
    }

  } catch (error) {
    console.error('Error generating colors:', error);
    
    // Colores de fallback en caso de error
    const fallbackColors = [
      '#E74C3C', '#3498DB', '#2ECC71', 
      '#F39C12', '#9B59B6'
    ];
    
    return res.json({ 
      colors: fallbackColors,
      theme: req.body.theme || 'fallback',
      message: 'Failed to generate colors, using fallback',
      fallback: true,
      timestamp: new Date().toISOString(),
      aiModel: 'error-fallback'
    });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
