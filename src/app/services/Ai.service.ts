import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

// Import Gemini SDK types & classes
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private geminiAI!: GoogleGenerativeAI;

  constructor() {
    this.geminiAI = new GoogleGenerativeAI(environment.geminiApiKey);
  }

  async generateText(
    provider: string,
    modelId: string,
    prompt: string,
    temperature = 0.3,
    maxTokens = 1000,
    fileData?: any // Optional file data for Gemini
  ): Promise<{ success: boolean; data?: string; error?: string; raw?: any }> {
    try {
      if (provider === 'gemini') {
        // Gemini API call
        const model = this.geminiAI.getGenerativeModel({
          model: modelId,
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens
          },
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
          ],
        });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }, fileData] }],
        });

        return {
          success: true,
          data: result.response.text(),
          raw: result
        };
      }

      else if (provider === 'chatgpt') {
        // ChatGPT API call example (OpenAI SDK or fetch)
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${environment.chatGptApiKey}`
          },
          body: JSON.stringify({
            model: modelId, // e.g. 'gpt-3.5-turbo' or 'gpt-4'
            messages: [{ role: 'user', content: prompt }],
            temperature,
            max_tokens: maxTokens,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error?.message || 'OpenAI API error');
        }

        const json = await response.json();
        const text = json.choices?.[0]?.message?.content ?? '';

        return {
          success: true,
          data: text,
          raw: json
        };
      }

      else if (provider === 'deepai') {
        // DeepAI API call example (text generation)
        const response = await fetch('https://api.deepai.org/api/text-generator', {
          method: 'POST',
          headers: {
            'Api-Key': environment.deepAiApiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ text: prompt }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.err || 'DeepAI API error');
        }

        const json = await response.json();
        const text = json.output ?? '';

        return {
          success: true,
          data: text,
          raw: json
        };
      }

      else {
        return { success: false, error: `Unknown provider: ${provider}` };
      }
    } catch (err: any) {
      return { success: false, error: err?.message ?? String(err) };
    }
  }
}
