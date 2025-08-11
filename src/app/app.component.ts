import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ModelSelectorComponent } from "./components/model-selector/model-selector.component";
import { PromptEditorComponent } from "./components/prompt-editor/prompt-editor.component";
import { ParametersPanelComponent } from "./components/parameters-panel/parameters-panel.component";
import { ThemeToggleComponent } from "./components/theme-toggle/theme-toggle.component";
import { ChatOutputComponent } from "./components/chat-output/chat-output.component";
import { ModelItem } from './models/model-item';
import { ChatMessage } from './models/chat-message';
import { GeminiService } from './services/gemini.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ModelSelectorComponent,
    PromptEditorComponent,
    ParametersPanelComponent,
    ThemeToggleComponent,
    ChatOutputComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Promptify (Angular 19)';

models: any[] = [
  { id: 'g2', name: 'Gemini 1.5 Flash', modelId: 'gemini-1.5-flash' },
 { id: 'g1', name: 'Gemini 1.5 Pro', modelId: 'gemini-1.5-pro' }

];


  selectedModel = this.models[0];
getSelectedModel(model: { modelId: string; name: string }) {

  this.selectedModel = model;
  console.log('Selected model object:', this.selectedModel);
}

  temperature = 0.2;
  maxTokens = 512;

  messages: ChatMessage[] = [];
  templates: Record<string, string> = {};
  loading = false;

  constructor(
    private gemini: GeminiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const t = localStorage.getItem('gc_templates');
      if (t) this.templates = JSON.parse(t);

      if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  }
sidebarCollapsed = true;

toggleSidebar() {
  this.sidebarCollapsed = !this.sidebarCollapsed;
}
  objectKeys(obj: any) {
    return Object.keys(obj || {});
  }

async onSend(prompt: string) {
  if (!prompt?.trim()) return;

  const user: ChatMessage = {
    id: this.uid(),
    role: 'user',
    text: prompt,
    ts: Date.now()
  };

  this.messages = [...this.messages, user];
  this.loading = true;

  const res = await this.gemini.generateText(
    this.selectedModel.modelId, // ✅ pass dynamic model
    prompt,
    this.temperature,
    this.maxTokens
  );

  if (res.success) {
    const assistant: ChatMessage = {
      id: this.uid(),
      role: 'assistant',
      text: res.data ?? '',
      ts: Date.now()
    };
    this.messages = [...this.messages, assistant];
  } else {
    const errMsg: ChatMessage = {
      id: this.uid(),
      role: 'assistant',
      text: 'Error: ' + res.error,
      ts: Date.now()
    };
    this.messages = [...this.messages, errMsg];
  }

  this.loading = false;
}


  onSaveTemplate(name: string, text: string) {
    if (!name) return;
    this.templates[name] = text;

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('gc_templates', JSON.stringify(this.templates));
    }
  }

  onLoadTemplate(name: string) {
    return this.templates[name] ?? '';
  }

  onDownload() {
    if (isPlatformBrowser(this.platformId)) {
      const blob = new Blob([JSON.stringify(this.messages, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'chat.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  onCopy(text: string) {
    if (isPlatformBrowser(this.platformId)) {
      navigator.clipboard.writeText(text);
    }
  }

  uid() {
    return Math.random().toString(36).slice(2, 10);
  }
}
