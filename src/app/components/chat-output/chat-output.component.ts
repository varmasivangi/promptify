import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatMessage } from '../../models/chat-message';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-output',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-output.component.html',
  styleUrl: './chat-output.component.scss',
})
export class ChatOutputComponent {
  @Input() messages: ChatMessage[] = [];
  @Input() loading = false;
  @Output() download = new EventEmitter<void>();
  @Output() copy = new EventEmitter<string>();
  @Output() send = new EventEmitter<string>();

  onDownload() {
    this.download.emit();
  }
  onCopy(t: string) {
    this.copy.emit(t);
  }

  editingIndex: number | null = null;
  editText: string = '';

  startEdit(index: number) {
    this.editingIndex = index;
    this.editText = this.messages[index].text;
  }

  saveEdit(index: number) {
    if (this.editText.trim()) {
      // this.messages[index].text = this.editText.trim();
      console.log('saveEdit triggered', this.editText);
      debugger;
      this.send.emit(this.editText);
    }
    this.editingIndex = null;
  }

  cancelEdit() {
    this.editingIndex = null;
  }
}
