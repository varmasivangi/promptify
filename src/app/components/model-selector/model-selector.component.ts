import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModelItem } from '../../models/model-item';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-model-selector',
  imports: [CommonModule,FormsModule],
  templateUrl: './model-selector.component.html',
  styleUrl: './model-selector.component.scss'
})
export class ModelSelectorComponent {
  @Input() models: ModelItem[] = [];
  @Input() selected!: ModelItem;
  @Output() select = new EventEmitter<ModelItem>();

  selectByModelId(mid: string) {
    const m = this.models.find(x => x.modelId === mid) ?? this.models[0];
    this.select.emit(m);
  }
  onModelChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedModelId = selectElement.value;
    const selectedModel = this.models.find(m => m.modelId === selectedModelId);
    if (selectedModel) {
      this.select.emit(selectedModel);
    }
  }
}
