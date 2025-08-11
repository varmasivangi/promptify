import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatMessage } from '../../models/chat-message';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-output',
  imports: [CommonModule],
  templateUrl: './chat-output.component.html',
  styleUrl: './chat-output.component.scss'
})
export class ChatOutputComponent {
@Input() messages: ChatMessage[] = [];
  @Input() loading = false;
  @Output() download = new EventEmitter<void>();
  @Output() copy = new EventEmitter<string>();

  onDownload(){ this.download.emit(); }
  onCopy(t:string){ this.copy.emit(t); }
}
