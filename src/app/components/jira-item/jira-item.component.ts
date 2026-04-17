import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { JiraIssue } from '../../models/jira.models';

@Component({
  selector: 'app-jira-item',
  standalone: true,
  templateUrl: './jira-item.component.html',
  styleUrl: './jira-item.component.css',
})
export class JiraItemComponent implements AfterViewInit, OnChanges, OnDestroy {
  private static readonly BOTTOM_PAUSE_MS = 2000;
  private static readonly TOP_PAUSE_MS = 1000;

  @Input({ required: true }) issue!: JiraIssue;
  @Input() autoScrollPixelsPerSecond = 0;
  @ViewChild('descriptionViewport') descriptionViewport?: ElementRef<HTMLDivElement>;
  @ViewChild('descriptionContent') descriptionContent?: ElementRef<HTMLDivElement>;

  private animationFrameId: number | null = null;
  private lastTimestamp: number | null = null;
  private bottomPauseUntil: number | null = null;
  private topPauseUntil: number | null = null;
  private currentOffset = 0;
  private maxOffset = 0;

  get issueTypeName(): string {
    return this.issue.fields.issuetype?.name ?? 'Issue';
  }

  get issueTypeIconUrl(): string {
    return this.issue.fields.issuetype?.iconUrl ?? '';
  }

  get priorityName(): string {
    return this.issue.fields.priority?.name ?? 'No priority';
  }

  get priorityIconUrl(): string {
    return this.issue.fields.priority?.iconUrl ?? '';
  }

  get statusName(): string {
    return this.issue.fields.status?.name ?? 'Unknown';
  }

  get description(): string {
    const desc = this.issue.fields.description;
    if (!desc) return 'No description';
    if (typeof desc === 'string') return desc;
    return this.extractTextFromAdf(desc);
  }

  ngAfterViewInit(): void {
    this.restartAutoScroll();
  }

  ngOnChanges(): void {
    this.restartAutoScroll();
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
  }

  private extractTextFromAdf(adf: unknown): string {
    if (typeof adf === 'string') return adf;
    if (!adf || typeof adf !== 'object') return 'No description';
    const node = adf as { type?: string; text?: string; content?: unknown[] };
    if (node.type === 'text' && node.text) return node.text;
    if (Array.isArray(node.content)) {
      return node.content.map((child) => this.extractTextFromAdf(child)).join('\n');
    }
    return 'No description';
  }

  private restartAutoScroll(): void {
    this.stopAutoScroll();

    if (
      typeof window === 'undefined' ||
      !this.descriptionViewport ||
      !this.descriptionContent ||
      this.autoScrollPixelsPerSecond <= 0
    ) {
      return;
    }

    const viewport = this.descriptionViewport.nativeElement;
    const content = this.descriptionContent.nativeElement;
    this.currentOffset = 0;
    this.maxOffset = Math.max(0, content.scrollHeight - viewport.clientHeight);
    viewport.scrollTop = 0;

    if (this.maxOffset <= 0) {
      return;
    }

    this.lastTimestamp = null;
    this.animationFrameId = window.requestAnimationFrame((timestamp) =>
      this.stepAutoScroll(timestamp),
    );
  }

  private stopAutoScroll(): void {
    if (this.animationFrameId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.animationFrameId);
    }

    this.animationFrameId = null;
    this.lastTimestamp = null;
    this.bottomPauseUntil = null;
    this.topPauseUntil = null;
    this.currentOffset = 0;
    this.maxOffset = 0;

    if (this.descriptionViewport) {
      this.descriptionViewport.nativeElement.scrollTop = 0;
    }
  }

  private stepAutoScroll(timestamp: number): void {
    const viewport = this.descriptionViewport?.nativeElement;
    const content = this.descriptionContent?.nativeElement;

    if (
      !viewport ||
      !content ||
      this.autoScrollPixelsPerSecond <= 0 ||
      typeof window === 'undefined'
    ) {
      this.stopAutoScroll();
      return;
    }

    if (this.lastTimestamp === null) {
      this.lastTimestamp = timestamp;
    }

    const deltaSeconds = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    this.maxOffset = Math.max(0, content.scrollHeight - viewport.clientHeight);

    if (this.maxOffset <= 0) {
      viewport.scrollTop = 0;
      this.animationFrameId = window.requestAnimationFrame((next) => this.stepAutoScroll(next));
      return;
    }

    if (this.topPauseUntil !== null) {
      if (timestamp < this.topPauseUntil) {
        viewport.scrollTop = 0;
        this.animationFrameId = window.requestAnimationFrame((next) => this.stepAutoScroll(next));
        return;
      }

      this.topPauseUntil = null;
      this.lastTimestamp = timestamp;
    }

    if (this.bottomPauseUntil !== null) {
      if (timestamp < this.bottomPauseUntil) {
        viewport.scrollTop = this.maxOffset;
        this.animationFrameId = window.requestAnimationFrame((next) => this.stepAutoScroll(next));
        return;
      }

      this.bottomPauseUntil = null;
      this.currentOffset = 0;
      viewport.scrollTop = 0;
      this.topPauseUntil = timestamp + JiraItemComponent.TOP_PAUSE_MS;
      this.lastTimestamp = timestamp;
      this.animationFrameId = window.requestAnimationFrame((next) => this.stepAutoScroll(next));
      return;
    }

    this.currentOffset += this.autoScrollPixelsPerSecond * deltaSeconds;

    if (this.currentOffset >= this.maxOffset) {
      this.currentOffset = this.maxOffset;
      this.bottomPauseUntil = timestamp + JiraItemComponent.BOTTOM_PAUSE_MS;
    }

    viewport.scrollTop = Math.round(this.currentOffset);
    this.animationFrameId = window.requestAnimationFrame((next) => this.stepAutoScroll(next));
  }
}
