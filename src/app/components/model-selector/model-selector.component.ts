import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { ModelItem } from '../../models/model-item';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-model-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './model-selector.component.html',
  styleUrls: ['./model-selector.component.scss'], // fixed here
})
export class ModelSelectorComponent implements OnInit {
  @Input() models: ModelItem[] = [];
  @Input() selected!: ModelItem;
  @Output() select = new EventEmitter<ModelItem>();

  apiToolCategories = [
    {
      category: 'Coding AI',
      tools: [
        { id: 'gemini', name: 'Gemini (Default)' },
        { id: 'chatgpt', name: 'ChatGPT' },
        { id: 'other-coding', name: 'Other Coding AI' },
      ],
    },
    {
      category: 'Photo / Edit AI',
      tools: [
        { id: 'deepai', name: 'DeepAI' },
        { id: 'other-photo', name: 'Other Photo AI' },
      ],
    },

    {
      category: 'Video & Animation AI',
      tools: [
        { id: 'videoai', name: 'Video AI' },
        { id: 'animationai', name: 'Animation AI' },
      ],
    },
  ];

  selectedCategoryId: string = '';
  filteredTools: { id: string; name: string }[] = [];

  selectedApiTool: string = '';

  ngOnInit() {
    // Set default category (first category)
    if (this.apiToolCategories.length > 0) {
      this.selectedCategoryId = this.apiToolCategories[0].category;
      this.filteredTools = this.apiToolCategories[0].tools;
      this.selectedApiTool = this.filteredTools[0]?.id ?? '';
    }
  }

  get filteredModels(): ModelItem[] {
    return this.models.filter((m) => m.provider === this.selectedApiTool);
  }

  onCategoryChange(event: Event) {
    const selectEl = event.target as HTMLSelectElement;
    this.selectedCategoryId = selectEl.value;

    const category = this.apiToolCategories.find(
      (c) => c.category === this.selectedCategoryId
    );
    this.filteredTools = category ? category.tools : [];
    this.selectedApiTool = this.filteredTools[0]?.id ?? '';

    // Optionally emit model selection of first model of new API tool
    const firstModel = this.models.find(
      (m) => m.provider === this.selectedApiTool
    );
    if (firstModel) {
      this.select.emit(firstModel);
    }
  }

  onApiToolChange(event: Event) {
    const selectEl = event.target as HTMLSelectElement;
    this.selectedApiTool = selectEl.value;

    // Automatically select first model of chosen API tool
    const firstModel = this.models.find(
      (m) => m.provider === this.selectedApiTool
    );
    if (firstModel) {
      this.select.emit(firstModel);
    }
  }

  onModelChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedModelId = selectElement.value;
    const selectedModel = this.models.find(
      (m) => m.modelId === selectedModelId
    );
    if (selectedModel) {
      this.select.emit(selectedModel);
    }
  }
}
