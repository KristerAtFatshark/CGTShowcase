import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
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
export class JiraPanelComponent implements OnInit {
  @Input({ required: true }) filterId!: string;
  @Input() descriptionAutoScrollPixelsPerSecond = 0;
  @Input() showDescription = true;
  @Output() initialLoadResolved = new EventEmitter<{ filterId: string; error?: string }>();

  readonly issues = signal<JiraIssue[]>([]);
  readonly filterName = signal<string>('Filter');
  // Start in a loading state so the first render stays stable while ngOnInit kicks off the request.
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  private initialLoadReported = false;

  constructor(private jiraService: JiraService) {}

  ngOnInit(): void {
    this.loadIssues();
  }

  loadIssues(): void {
    this.loading.set(true);
    this.error.set(null);
    this.jiraService.getFilterResults(this.filterId).subscribe({
      next: (response) => {
        this.issues.set(response.body?.issues ?? []);
        this.filterName.set(response.body?.filterName ?? this.filterId);
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
}
