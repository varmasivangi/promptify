import { FormsModule } from '@angular/forms';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Output,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-prompt-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prompt-editor.component.html',
  styleUrls: ['./prompt-editor.component.scss'],
})
export class PromptEditorComponent implements OnDestroy, AfterViewInit {
  text = '';

  @Input() loading = false;

  @Output() send = new EventEmitter<string>();
  @Output() saveTemplate = new EventEmitter<{ name: string; text: string }>();
  @Output() toggleDocumentAnalyzer = new EventEmitter<void>();
  @Output() downloadJSON = new EventEmitter<void>();
  @Output() clearChat = new EventEmitter<void>();

  chipsVisible = false;
  listening = false;
  recognition: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'en-IN';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        this.recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          this.text += (this.text ? ' ' : '') + transcript;
        };

        this.recognition.onend = () => {
          this.listening = false;
        };
      }
    }
  }

  ngAfterViewInit() {
    // Enable Bootstrap tooltips (hover + focus)
    if (isPlatformBrowser(this.platformId)) {
      const tooltipTriggerList = Array.from(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
      );
      tooltipTriggerList.forEach((el) => {
        new (window as any).bootstrap.Tooltip(el, { trigger: 'hover focus' });
      });
    }
  }

  toggleMic() {
    if (!this.recognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (this.listening) {
      this.recognition.stop();
      this.listening = false;
    } else {
      this.recognition.start();
      this.listening = true;
    }
  }

  onSend() {
    if (!this.text.trim()) return;
    this.send.emit(this.text);
    this.text = '';
  }

  onSave() {
    const name = prompt('Template name');
    if (!name) return;
    this.saveTemplate.emit({ name, text: this.text });
  }

  loadTemplate(text: string) {
    this.text = text;
  }

  openDocumentAnalyzer() {
    this.toggleDocumentAnalyzer.emit();
  }

  downloadJSONs() {
    this.downloadJSON.emit();
  }

  toggleChips() {
    this.chipsVisible = !this.chipsVisible;
  }

  clearChats() {
    this.clearChat.emit();
  }

  handleKeyPress(event: KeyboardEvent, action: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      switch (action) {
        case 'download':
          this.downloadJSONs();
          break;
        case 'save':
          this.onSave();
          break;
        case 'review':
          this.openDocumentAnalyzer();
          break;
        case 'clear':
          this.clearChats();
          break;
        case 'toggleChips':
          this.toggleChips();
          break;
      }
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId) && this.recognition) {
      this.recognition.stop();
    }
  }
}
