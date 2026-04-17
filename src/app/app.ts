import { Component, OnInit, ViewChild, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { JiraPanelComponent } from './components/jira-panel/jira-panel.component';
import { BottomBarComponent } from './components/bottom-bar/bottom-bar.component';
import { SettingsService } from './services/settings.service';
import { UserSettings } from './models/user-settings.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TopBarComponent, JiraPanelComponent, BottomBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  readonly settings = signal<UserSettings | null>(null);
  readonly loaded = signal(false);
  readonly startupErrors = signal<string[]>([]);
  readonly pendingInitialPanelLoads = signal(0);
  readonly showStartupOverlay = computed(
    () =>
      this.settings() !== null &&
      (this.pendingInitialPanelLoads() > 0 || this.startupErrors().length > 0),
  );

  @ViewChild('leftPanel') leftPanel!: JiraPanelComponent;
  @ViewChild('rightPanel') rightPanel!: JiraPanelComponent;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.startupErrors.set([]);
    this.settingsService.loadSettings().subscribe({
      next: (settings) => {
        this.settings.set(settings);
        this.pendingInitialPanelLoads.set(2);
        this.loaded.set(true);
      },
      error: (err) => {
        const message = 'Failed to load UserSettings.json: ' + (err.message || 'Unknown error');
        console.error(message, err);
        this.startupErrors.set([message]);
        this.loaded.set(true);
      },
    });
  }

  onInitialPanelLoadResolved(event: { filterId: string; error?: string }): void {
    this.pendingInitialPanelLoads.update((count) => Math.max(0, count - 1));
    if (event.error) {
      this.startupErrors.update((errors) => [...errors, `[${event.filterId}] ${event.error}`]);
    }
  }

  onRefresh(): void {
    this.leftPanel?.loadIssues();
    this.rightPanel?.loadIssues();
  }
}
