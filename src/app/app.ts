import { Component, OnDestroy, OnInit, ViewChild, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { JiraPanelComponent } from './components/jira-panel/jira-panel.component';
import { BottomBarComponent } from './components/bottom-bar/bottom-bar.component';
import { SettingsService } from './services/settings.service';
import { UserSettings } from './models/user-settings.model';
import { TeamCityBuild } from './models/teamcity.models';
import { TeamCityService } from './services/teamcity.service';
import { DistributedLatestMainService } from './services/distributed-latest-main.service';
import {
  BrowserSettingsOverrides,
  BrowserSettingsService,
} from './services/browser-settings.service';
import {
  DebugBarSettingKey,
  DebugBarSettingsViewModel,
} from './components/top-bar/top-bar.component';

const DISTRIBUTED_MAIN_BUILD_TYPE_ID =
  'Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TopBarComponent, JiraPanelComponent, BottomBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private static readonly AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

  readonly serverSettings = signal<UserSettings | null>(null);
  readonly browserSettingsOverrides = signal<BrowserSettingsOverrides>({});
  readonly settings = computed<UserSettings | null>(() => {
    const serverSettings = this.serverSettings();
    if (!serverSettings) {
      return null;
    }

    return {
      ...serverSettings,
      ...this.browserSettingsOverrides(),
    };
  });
  readonly loaded = signal(false);
  readonly startupErrors = signal<string[]>([]);
  readonly pendingInitialPanelLoads = signal(0);
  readonly teamCityBuilds = signal<TeamCityBuild[]>([]);
  readonly debugBarSettings = computed<DebugBarSettingsViewModel>(() => {
    const settings = this.settings();

    return {
      showDebugBar: settings?.showDebugBar ?? true,
      textSizeMultiplier: settings?.textSizeMultiplier ?? 1,
      leftPanelWidth: settings?.leftPanelWidth ?? '50%',
      bottomBarHeight: settings?.bottomBarHeight ?? '60px',
      descriptionAutoScrollPixelsPerSecond: settings?.descriptionAutoScrollPixelsPerSecond ?? 10,
    };
  });
  readonly showStartupOverlay = computed(
    () =>
      this.settings() !== null &&
      (this.pendingInitialPanelLoads() > 0 || this.startupErrors().length > 0),
  );

  @ViewChild('leftPanel') leftPanel!: JiraPanelComponent;
  @ViewChild('rightPanel') rightPanel!: JiraPanelComponent;
  private autoRefreshIntervalId: number | null = null;

  constructor(
    private settingsService: SettingsService,
    private teamCityService: TeamCityService,
    private distributedLatestMainService: DistributedLatestMainService,
    private browserSettingsService: BrowserSettingsService,
  ) {}

  ngOnInit(): void {
    this.startupErrors.set([]);
    this.browserSettingsOverrides.set(this.browserSettingsService.getOverrides());
    this.browserSettingsService.overrides$.subscribe((overrides) => {
      this.browserSettingsOverrides.set(overrides);
    });

    this.settingsService.loadSettings().subscribe({
      next: (settings) => {
        this.serverSettings.set(settings);
        this.pendingInitialPanelLoads.set(2);
        this.refreshAllData();
        this.startAutoRefresh();
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

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  onInitialPanelLoadResolved(event: { filterId: string; error?: string }): void {
    this.pendingInitialPanelLoads.update((count) => Math.max(0, count - 1));
    if (event.error) {
      this.startupErrors.update((errors) => [...errors, `[${event.filterId}] ${event.error}`]);
    }
  }

  onRefresh(): void {
    this.refreshAllData();
  }

  onDebugSettingChanged(event: {
    key: DebugBarSettingKey;
    value: string | number | boolean;
  }): void {
    switch (event.key) {
      case 'showDebugBar':
        this.browserSettingsService.updateOverride('showDebugBar', Boolean(event.value));
        break;
      case 'textSizeMultiplier':
        this.browserSettingsService.updateOverride('textSizeMultiplier', Number(event.value));
        break;
      case 'leftPanelWidth':
        this.browserSettingsService.updateOverride('leftPanelWidth', String(event.value));
        break;
      case 'bottomBarHeight':
        this.browserSettingsService.updateOverride('bottomBarHeight', String(event.value));
        break;
      case 'descriptionAutoScrollPixelsPerSecond':
        this.browserSettingsService.updateOverride(
          'descriptionAutoScrollPixelsPerSecond',
          Number(event.value),
        );
        break;
    }
  }

  showDebugBarFromRevealButton(): void {
    this.browserSettingsService.updateOverride('showDebugBar', true);
  }

  private refreshAllData(): void {
    this.leftPanel?.loadIssues();
    this.rightPanel?.loadIssues();
    this.loadTeamCityBuilds(this.settings());
  }

  private startAutoRefresh(): void {
    this.stopAutoRefresh();

    if (typeof window === 'undefined') {
      return;
    }

    this.autoRefreshIntervalId = window.setInterval(() => {
      this.refreshAllData();
    }, App.AUTO_REFRESH_INTERVAL_MS);
  }

  private stopAutoRefresh(): void {
    if (this.autoRefreshIntervalId !== null && typeof window !== 'undefined') {
      window.clearInterval(this.autoRefreshIntervalId);
    }

    this.autoRefreshIntervalId = null;
  }

  private loadTeamCityBuilds(settings: UserSettings | null): void {
    const buildTypeIds = settings?.teamCityBuildTypeIds ?? [];
    const latestBuilds$ = this.teamCityService.getLatestBuildStatuses(buildTypeIds);
    const matchingDistributedBuild$ = settings?.distributedLatestMain
      ? this.distributedLatestMainService.getEngineRevision(settings.distributedLatestMain).pipe(
          switchMap((engineRevision) =>
            engineRevision
              ? this.teamCityService.getBuildByRevision(
                  DISTRIBUTED_MAIN_BUILD_TYPE_ID,
                  engineRevision,
                )
              : of(null),
          ),
          catchError((err) => {
            console.error('Failed to load distributed latest main build:', err);
            return of(null);
          }),
        )
      : of(null);

    forkJoin({
      latestBuilds: latestBuilds$,
      matchingDistributedBuild: matchingDistributedBuild$,
    }).subscribe({
      next: ({ latestBuilds, matchingDistributedBuild }) => {
        this.teamCityBuilds.set(
          matchingDistributedBuild
            ? [...latestBuilds, { ...matchingDistributedBuild, label: 'Distributed Latest Main' }]
            : latestBuilds,
        );
      },
      error: (err) => {
        console.error('Failed to load TeamCity builds:', err);
      },
    });
  }
}
