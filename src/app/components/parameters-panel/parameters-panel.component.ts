import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-parameters-panel',
  imports: [CommonModule],
  templateUrl: './parameters-panel.component.html',
  styleUrl: './parameters-panel.component.scss'
})
export class ParametersPanelComponent {
  @Input() temperature = 0.2;
  @Output() temperatureChange = new EventEmitter<number>();

  @Input() maxTokens = 512;
  @Output() maxTokensChange = new EventEmitter<number>();
}
