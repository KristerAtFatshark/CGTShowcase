import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  computed,
  signal,
} from '@angular/core';
import { JiraIssue } from '../../models/jira.models';
import { JiraService } from '../../services/jira.service';
import { JiraItemComponent } from '../jira-item/jira-item.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-jira-panel',
  standalone: true,
  imports: [CommonModule, JiraItemComponent],
  templateUrl: './jira-panel.component.html',
  styleUrl: './jira-panel.component.css',
})
export class JiraPanelComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) filterId!: string;
  @Input() descriptionAutoScrollPixelsPerSecond = 0;
  @Input() showDescription = true;
  @Input()
  set maxItemsPerPage(value: number) {
    const normalized = Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
    this.maxItemsPerPageValue.set(normalized);
    this.currentPage.set(0);
    this.restartAutoPageFlip();
  }

  get maxItemsPerPage(): number {
    return this.maxItemsPerPageValue();
  }

  @Input()
  set autoPageFlipSeconds(value: number) {
    const normalized = Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 30;
    this.autoPageFlipSecondsValue.set(normalized);
    this.restartAutoPageFlip();
  }

  get autoPageFlipSeconds(): number {
    return this.autoPageFlipSecondsValue();
  }
  @Output() initialLoadResolved = new EventEmitter<{ filterId: string; error?: string }>();

  readonly issues = signal<JiraIssue[]>([]);
  readonly filterName = signal<string>('Filter');
  // Start in a loading state so the first render stays stable while ngOnInit kicks off the request.
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly currentPage = signal(0);
  readonly totalPages = computed(() => {
    const pageSize = this.maxItemsPerPageValue();
    return Math.max(1, Math.ceil(this.issues().length / pageSize));
  });
  readonly pagedIssues = computed(() => {
    const pageSize = this.maxItemsPerPageValue();
    const start = this.currentPage() * pageSize;
    return this.issues().slice(start, start + pageSize);
  });
  private initialLoadReported = false;
  private readonly maxItemsPerPageValue = signal(4);
  private readonly autoPageFlipSecondsValue = signal(30);
  private autoPageFlipIntervalId: number | null = null;

  constructor(private jiraService: JiraService) {}

  ngOnInit(): void {
    this.loadIssues();
  }

  ngOnChanges(): void {
    this.restartAutoPageFlip();
  }

  ngOnDestroy(): void {
    this.stopAutoPageFlip();
  }

  loadIssues(): void {
    this.loading.set(true);
    this.error.set(null);
    this.jiraService.getFilterResults(this.filterId).subscribe({
      next: (response) => {
        this.issues.set(response.body?.issues ?? []);
        this.filterName.set(response.body?.filterName ?? this.filterId);
        this.currentPage.set(0);
        this.restartAutoPageFlip();
        this.loading.set(false);
        this.reportInitialLoad();
      },
      error: (err) => {
        const message = 'Failed to load issues: ' + (err.message || 'Unknown error');
        this.error.set(message);
        this.loading.set(false);
        this.reportInitialLoad(message);
      },
    });
  }

  private reportInitialLoad(error?: string): void {
    if (this.initialLoadReported) {
      return;
    }

    this.initialLoadReported = true;
    this.initialLoadResolved.emit({ filterId: this.filterId, error });
  }

  previousPage(): void {
    this.currentPage.update((page) => Math.max(0, page - 1));
  }

  nextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages() - 1, page + 1));
  }

  private restartAutoPageFlip(): void {
    this.stopAutoPageFlip();

    if (typeof window === 'undefined' || this.totalPages() <= 1) {
      return;
    }

    this.autoPageFlipIntervalId = window.setInterval(() => {
      this.currentPage.update((page) => (page + 1) % this.totalPages());
    }, this.autoPageFlipSecondsValue() * 1000);
  }

  private stopAutoPageFlip(): void {
    if (this.autoPageFlipIntervalId !== null && typeof window !== 'undefined') {
      window.clearInterval(this.autoPageFlipIntervalId);
    }

    this.autoPageFlipIntervalId = null;
  }
}
