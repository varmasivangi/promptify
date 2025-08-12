import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  NgZone,
  PLATFORM_ID,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-doc-analyzer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doc-analyzer.component.html',
  styleUrls: ['./doc-analyzer.component.scss'],
})
export class DocAnalyzerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() pdfDataChange = new EventEmitter<string>();
  @Output() toggleDocumentAnalyzer = new EventEmitter<void>(false);
  @ViewChild('pdfCanvas', { static: false })
  pdfCanvas!: ElementRef<HTMLCanvasElement>;

  pdfUrl: SafeResourceUrl | null = null;
  pdfName: string | null = null;
  messages: { type: 'user' | 'bot'; text: string }[] = [];
  userInput = '';
  loading = false;
  isPdfLoading = false;
  isTyping = false;
  isPdfLoaded = false;

  constructor(
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const rawPdf = localStorage.getItem('pdfData');
      if (rawPdf) {
        this.isPdfLoading = true;
        this.renderPdfToCanvas(rawPdf);
      }
    }
  }

  ngOnDestroy(): void {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file?.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        if (isPlatformBrowser(this.platformId)) {
          const result = reader.result as string;
          localStorage.setItem('pdfData', result);
          localStorage.setItem('pdfName', file.name);

          this.pdfDataChange.emit(result);
          console.log('Child emitting PDF data', result);
          this.isPdfLoading = true;
          this.renderPdfToCanvas(result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid PDF file.');
    }
  }

  private renderPdfToCanvas(base64Data: string): void {
    const base64 = base64Data.split(',')[1];
    const raw = atob(base64);
    const uint8Array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      uint8Array[i] = raw.charCodeAt(i);
    }

    const pdfjsLib = (window as any)['pdfjsLib'];
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });

    loadingTask.promise
      .then((pdf: any) => {
        this.ngZone.run(() => {
          this.isPdfLoading = false;
          this.isPdfLoaded = true;
        });

        pdf.getPage(1).then((page: any) => {
          const canvas = this.pdfCanvas?.nativeElement;
          if (!canvas) {
            console.error('Canvas not found');
            return;
          }

          const context = canvas.getContext('2d');
          const viewport = page.getViewport({ scale: 1.5 });

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          page
            .render({
              canvasContext: context!,
              viewport,
            })
            .promise.then(() => {});
        });
      })
      .catch((err: any) => {
        console.error('Error loading PDF:', err);
        this.ngZone.run(() => {
          this.isPdfLoading = false;
          this.isPdfLoaded = false;
        });
      });
  }

  removePdf(): void {
    const hasPdf =
      (isPlatformBrowser(this.platformId) &&
        (localStorage.getItem('pdfData') || localStorage.getItem('pdfName'))) ||
      this.isPdfLoaded;

    if (!hasPdf) {
      console.warn('No PDF found to remove.');

      this.showNoPdfMessage();
      return;
    }

    // Remove from local storage if in browser
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('pdfData');
      localStorage.removeItem('pdfName');
    }

    this.isPdfLoading = false;
    this.isPdfLoaded = false;

    // Clear canvas if exists
    if (this.pdfCanvas?.nativeElement) {
      const canvas = this.pdfCanvas.nativeElement;
      const context = canvas.getContext('2d');
      context?.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = 0;
      canvas.height = 0;
    }
  }

  private showNoPdfMessage(): void {
    this.toggleDocumentAnalyzer.emit();
  }
}
