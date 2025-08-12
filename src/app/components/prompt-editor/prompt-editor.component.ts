import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'app-prompt-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prompt-editor.component.html',
  styleUrl: './prompt-editor.component.scss',
})
export class PromptEditorComponent {
  text = '';
  @Output() send = new EventEmitter<string>();
  @Output() saveTemplate = new EventEmitter<{ name: string; text: string }>();
  @Output() toggleDocumentAnalyzer = new EventEmitter<void>(false);
  @Input() loading = false;
  @Output() downloadJSON = new EventEmitter<void>();
  onSend() {
    this.send.emit(this.text);
    this.text = '';
  }

  onSave() {
    const name = prompt('Template name');
    if (!name) return;
    this.saveTemplate.emit({ name, text: this.text });
  }

  loadTemplate(text: string) {
    this.text = text; // or however your editor sets the value
  }

  openDocumentAnalyzer() {
    this.toggleDocumentAnalyzer.emit();
  }
  openFileUploader() {}
  openSettings() {}

  downloadJSONs(){
 
    this.downloadJSON.emit();
  }

  chipsVisible = false;

toggleChips() {
  this.chipsVisible = !this.chipsVisible;
}

summarizeText() {
  // Implement your summarize text logic here
}

clearChat()
{

}
}