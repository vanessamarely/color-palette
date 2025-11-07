// API Route para generar paletas de colores usando IA
// Angular SSR maneja esto automáticamente como endpoint REST

export async function POST(request: Request): Promise<Response> {
  try {
    // Leer el tema del cuerpo de la petición
    const { theme } = await request.json();
    
    if (!theme) {
      return Response.json(
        { error: 'Theme is required' }, 
        { status: 400 }
      );
    }

    // Obtener la API key de las variables de entorno
    const apiKey = process.env['GOOGLE_AI_API_KEY'];
    
    if (!apiKey) {
      return Response.json(
        { error: 'API key not configured' }, 
        { status: 500 }
      );
    }

    // Llamar a la API de Gemini para generar colores
    const prompt = `Genera exactamente 5 códigos de color hexadecimales (incluyendo #) para el tema "${theme}". 
    Responde solo con un array JSON de strings, nada más. 
    Ejemplo: ["#FF5733", "#33FF57", "#3357FF", "#FF33F5", "#F5FF33"]`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
    const generatedText = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!generatedText) {
      throw new Error('No response from AI');
    }

    // Intentar parsear la respuesta como JSON
    try {
      const colors = JSON.parse(generatedText.trim());
      
      // Validar que sea un array de strings
      if (Array.isArray(colors) && colors.every(color => typeof color === 'string')) {
        return Response.json({ colors, theme });
      } else {
        throw new Error('Invalid color format');
      }
    } catch (parseError) {
      // Si falla el parsing, generar colores de fallback
      const fallbackColors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', 
        '#96CEB4', '#FFEAA7'
      ];
      
      return Response.json({ 
        colors: fallbackColors, 
        theme,
        fallback: true,
        message: 'Used fallback colors due to AI parsing error'
      });
    }

  } catch (error) {
    console.error('Error generating colors:', error);
    
    // Colores de fallback en caso de error
    const fallbackColors = [
      '#E74C3C', '#3498DB', '#2ECC71', 
      '#F39C12', '#9B59B6'
    ];
    
    return Response.json({ 
      colors: fallbackColors,
      theme: 'fallback',
      error: 'Failed to generate colors, using fallback',
      fallback: true
    });
  }
}