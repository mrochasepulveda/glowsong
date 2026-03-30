import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config/env.js';
import { ScrapedEvent } from './ScraperEngine.js';

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

export class ClaudeParser {
  /**
   * Passes raw unstructured text to Claude 3 Haiku and requests a strictly formatted JSON array 
   * of events found in that text.
   */
  static async extractEventsFromText(rawText: string, sourceUrl: string): Promise<ScrapedEvent[]> {
    if (!config.anthropic.apiKey || config.anthropic.apiKey === 'your_anthropic_api_key') {
      console.warn('⚠️ Anthropic API Key not configured. Skipping AI extraction.');
      return [];
    }

    const systemPrompt = `
Eres un experto extrayendo metadatos de conciertos, fiestas y eventos en Chile a partir de texto desordenado (como un post de Instagram).
Revisa el texto entregado y extrae TODOS los eventos futuros que encuentres.

REGLAS ESTRICTAS:
1. Retorna ÚNICAMENTE un JSON VÁLIDO. Ningún otro texto antes ni después. El formato debe ser un array de objetos JSON:
[
  {
    "title": "Un título representativo del evento",
    "artistName": "Nombre del artista o banda principal",
    "venueName": "Nombre del recinto o lugar físico (ej: Blondie, Sala SCD, Club Chocolate)",
    "date": "Una fecha ISO8601 de la realización del evento (o fecha más cercana al presente, asumiendo zona horaria de Chile)",
    "priceMin": número entero equivalente al precio mínimo en pesos chilenos (si no hay, omite o pon null),
    "imageUrl": null,
    "ticketUrl": "La URL del post de Instagram o fuente original"
  }
]
2. Si el recinto no está explícito pero se asume por la cuenta (ejemplo: un post de @blondiecl), asume que el venueName es "Blondie".
3. Si el texto habla de conciertos en el pasado o simplemente no menciona un evento futuro, retorna un array vacío [].
4. Transforma las fechas informales (ej. "Jueves 25 abril") a una aproximación ISO usando el año actual (${new Date().getFullYear()}).
`;

    try {
      console.log('🤖 Sending text to Claude (Haiku) for extraction...');
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        temperature: 0, // deterministic
        system: systemPrompt,
        messages: [
          { role: 'user', content: `Text source: ${sourceUrl}\n\nRAW TEXT:\n${rawText}` }
        ]
      });

      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
      
      // Attempt to clean and parse the JSON response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Map to ensure it fits our interface
        return parsed.map((item: any) => ({
          title: item.title,
          artistName: item.artistName,
          venueName: item.venueName,
          date: item.date ? new Date(item.date) : new Date(),
          priceMin: item.priceMin || undefined,
          imageUrl: undefined, // AI can't know the exact image URL from plain text alone
          ticketUrl: sourceUrl, // We default the ticketUrl to the Instagram profile/post URL
        }));
      }

      return [];
    } catch (error) {
      console.error('ClaudeParser Error:', error);
      return [];
    }
  }
}
