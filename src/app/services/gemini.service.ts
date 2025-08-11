import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

// Import Google Generative AI SDK types & classes
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI!: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(environment.geminiApiKey);
  }

  async generateText(
    modelId: string,  // dynamic model
    prompt: string,
    temperature = 0.3,
    maxTokens = 1000
  ) {
    try {
      const model = this.genAI.getGenerativeModel({
        model: modelId,  // use passed model
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
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      return {
        success: true,
        data: result.response.text(),
        raw: result
      };
    } catch (err: any) {
      return { success: false, error: err?.message ?? String(err) };
    }
  }
}
