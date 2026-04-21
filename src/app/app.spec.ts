import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { vi } from 'vitest';
import { App } from './app';
import { UserSettings } from './models/user-settings.model';
import { SettingsService } from './services/settings.service';
import { BrowserSettingsService } from './services/browser-settings.service';
import { DistributedLatestMainService } from './services/distributed-latest-main.service';
import { JiraService } from './services/jira.service';
import { JiraSearchResponse } from './models/jira.models';
import { TeamCityService } from './services/teamcity.service';

describe('App', () => {
  const mockSettings: UserSettings = {
    showDebugBar: true,
    leftPanelFilterId: '18046',
    rightPanelFilterId: '18047',
    descriptionAutoScrollPixelsPerSecond: 12.5,
    textSizeMultiplier: 1.25,
    leftPanelWidth: '45%',
    bottomBarHeight: '72px',
    distributedLatestMain: '\\\\filegw02\\vault\\stingray-binaries\\main\\latest\\build_info.txt',
    teamCityBuildTypeIds: ['Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite'],
  };

  function setup(
    settings: UserSettings | null = mockSettings,
    jiraShouldFail: boolean = false,
  ): ComponentFixture<App> {
    const mockSettingsService = {
      loadSettings: () => {
        if (settings) {
          return of(settings);
        }
        return throwError(() => new Error('Failed'));
      },
      getSettings: () => settings,
      settings$: settings ? of(settings) : throwError(() => new Error('Failed')),
    };

    const mockJiraService = {
      getFilterResults: () => {
        if (jiraShouldFail) {
          return throwError(() => new Error('Filter missing'));
        }

        const emptyResponse = new HttpResponse<JiraSearchResponse>({
          body: { issues: [] },
          status: 200,
        });

        return of(emptyResponse);
      },
    };

    const mockTeamCityService = {
      getLatestBuildStatuses: () =>
        of([
          {
            id: 123,
            number: '456',
            status: 'SUCCESS',
            statusText: 'Success',
            buildTypeId: 'Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite',
            finishDate: '20260417T100000+0000',
            branchName: 'main',
          },
        ]),
      getBuildByRevision: () => of(null),
    };

    const mockDistributedLatestMainService = {
      getEngineRevision: () => of(null),
    };

    const mockBrowserSettingsService = {
      getOverrides: () => ({}),
      overrides$: of({}),
      updateOverride: () => {},
    };

    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: BrowserSettingsService, useValue: mockBrowserSettingsService },
        { provide: DistributedLatestMainService, useValue: mockDistributedLatestMainService },
        { provide: JiraService, useValue: mockJiraService },
        { provide: TeamCityService, useValue: mockTeamCityService },
      ],
    });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    return fixture;
  }

  it('should create the app', () => {
    const fixture = setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show debug bar when showDebugBar is true', () => {
    const fixture = setup();
    const topBar = fixture.nativeElement.querySelector('app-top-bar');
    expect(topBar).toBeTruthy();
    expect(topBar.hidden).toBe(false);
  });

  it('should hide debug bar when showDebugBar is false', () => {
    const fixture = setup({ ...mockSettings, showDebugBar: false });
    const topBar = fixture.nativeElement.querySelector('app-top-bar');
    expect(topBar.hidden).toBe(true);
  });

  it('should show loading screen errors when settings fail to load', () => {
    const fixture = setup(null);
    const loadingScreen = fixture.nativeElement.querySelector('.loading-screen');
    const loadingError = fixture.nativeElement.querySelector('.loading-error');
    expect(loadingScreen).toBeTruthy();
    expect(loadingError).toBeTruthy();
    expect(loadingError.textContent).toContain('Failed to load UserSettings.json');
  });

  it('should render both jira panels', () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelectorAll('app-jira-panel').length).toBe(2);
  });

  it('should apply text size multiplier from settings', () => {
    const fixture = setup();
    const layout = fixture.nativeElement.querySelector('.app-layout');
    expect(layout.style.getPropertyValue('--text-scale')).toBe('1.25');
  });

  it('should apply panel size settings from settings', () => {
    const fixture = setup();
    const layout = fixture.nativeElement.querySelector('.app-layout');
    expect(layout.style.getPropertyValue('--left-panel-width')).toBe('45%');
    expect(layout.style.getPropertyValue('--bottom-bar-height')).toBe('72px');
  });

  it('should show startup jira errors under loading text', () => {
    const fixture = setup(mockSettings, true);
    const loadingErrors = fixture.nativeElement.querySelectorAll('.loading-error');

    expect(loadingErrors.length).toBe(2);
    expect(loadingErrors[0].textContent).toContain('[18046] Failed to load issues: Filter missing');
    expect(loadingErrors[1].textContent).toContain('[18047] Failed to load issues: Filter missing');
  });

  it('should render TeamCity builds in the bottom bar', () => {
    const fixture = setup();
    const bottomBar = fixture.nativeElement.querySelector('app-bottom-bar');
    expect(bottomBar.textContent).toContain(
      'Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite',
    );
    expect(bottomBar.textContent).toContain('Number: 456');
    expect(bottomBar.textContent).toContain('ID: 123');
    expect(bottomBar.textContent).toContain('Finished: 2026-04-17 12:00:00 SWE');
    expect(bottomBar.textContent).toContain('Branch: main');
  });

  it('should apply browser settings overrides on top of server settings', () => {
    const mockSettingsService = {
      loadSettings: () => of(mockSettings),
      getSettings: () => mockSettings,
      settings$: of(mockSettings),
    };

    const mockJiraService = {
      getFilterResults: () =>
        of(
          new HttpResponse<JiraSearchResponse>({
            body: { issues: [] },
            status: 200,
          }),
        ),
    };

    const mockTeamCityService = {
      getLatestBuildStatuses: () => of([]),
      getBuildByRevision: () => of(null),
    };

    const mockDistributedLatestMainService = {
      getEngineRevision: () => of(null),
    };

    const mockBrowserSettingsService = {
      getOverrides: () => ({ textSizeMultiplier: 1.6, leftPanelWidth: '40%' }),
      overrides$: of({ textSizeMultiplier: 1.6, leftPanelWidth: '40%' }),
      updateOverride: () => {},
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: BrowserSettingsService, useValue: mockBrowserSettingsService },
        { provide: DistributedLatestMainService, useValue: mockDistributedLatestMainService },
        { provide: JiraService, useValue: mockJiraService },
        { provide: TeamCityService, useValue: mockTeamCityService },
      ],
    });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const layout = fixture.nativeElement.querySelector('.app-layout');
    expect(layout.style.getPropertyValue('--text-scale')).toBe('1.6');
    expect(layout.style.getPropertyValue('--left-panel-width')).toBe('40%');
  });

  it('should persist debug bar setting changes through the browser settings service', () => {
    let overrideUpdate: { key: string; value: unknown } | undefined;

    const mockSettingsService = {
      loadSettings: () => of(mockSettings),
      getSettings: () => mockSettings,
      settings$: of(mockSettings),
    };

    const mockJiraService = {
      getFilterResults: () =>
        of(
          new HttpResponse<JiraSearchResponse>({
            body: { issues: [] },
            status: 200,
          }),
        ),
    };

    const mockTeamCityService = {
      getLatestBuildStatuses: () => of([]),
      getBuildByRevision: () => of(null),
    };

    const mockDistributedLatestMainService = {
      getEngineRevision: () => of(null),
    };

    const mockBrowserSettingsService = {
      getOverrides: () => ({}),
      overrides$: of({}),
      updateOverride: (key: string, value: unknown) => {
        overrideUpdate = { key, value };
      },
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: BrowserSettingsService, useValue: mockBrowserSettingsService },
        { provide: DistributedLatestMainService, useValue: mockDistributedLatestMainService },
        { provide: JiraService, useValue: mockJiraService },
        { provide: TeamCityService, useValue: mockTeamCityService },
      ],
    });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const textScaleInput = fixture.nativeElement.querySelector('input[type="number"]');
    textScaleInput.value = '1.7';
    textScaleInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(overrideUpdate).toEqual({ key: 'textSizeMultiplier', value: 1.7 });
  });

  it('should show the debug bar from the reveal button', () => {
    let overrideUpdate: { key: string; value: unknown } | undefined;

    const hiddenSettings = { ...mockSettings, showDebugBar: false };

    const mockSettingsService = {
      loadSettings: () => of(hiddenSettings),
      getSettings: () => hiddenSettings,
      settings$: of(hiddenSettings),
    };

    const mockJiraService = {
      getFilterResults: () =>
        of(
          new HttpResponse<JiraSearchResponse>({
            body: { issues: [] },
            status: 200,
          }),
        ),
    };

    const mockTeamCityService = {
      getLatestBuildStatuses: () => of([]),
      getBuildByRevision: () => of(null),
    };

    const mockDistributedLatestMainService = {
      getEngineRevision: () => of(null),
    };

    const mockBrowserSettingsService = {
      getOverrides: () => ({ showDebugBar: false }),
      overrides$: of({ showDebugBar: false }),
      updateOverride: (key: string, value: unknown) => {
        overrideUpdate = { key, value };
      },
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: BrowserSettingsService, useValue: mockBrowserSettingsService },
        { provide: DistributedLatestMainService, useValue: mockDistributedLatestMainService },
        { provide: JiraService, useValue: mockJiraService },
        { provide: TeamCityService, useValue: mockTeamCityService },
      ],
    });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const revealButton = fixture.nativeElement.querySelector('.debug-bar-reveal-button');
    revealButton.click();

    expect(overrideUpdate).toEqual({ key: 'showDebugBar', value: true });
  });

  it('should append the distributed latest main TeamCity build when a revision matches', () => {
    const matchingBuild = {
      id: 714094,
      number: '1323',
      status: 'SUCCESS',
      statusText: 'Build chain finished (success: 28)',
      buildTypeId: 'Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite',
      finishDate: '20260416T142642+0000',
      branchName: 'main',
      defaultBranch: true,
    };

    const mockSettingsService = {
      loadSettings: () => of(mockSettings),
      getSettings: () => mockSettings,
      settings$: of(mockSettings),
    };

    const mockJiraService = {
      getFilterResults: () =>
        of(
          new HttpResponse<JiraSearchResponse>({
            body: { issues: [] },
            status: 200,
          }),
        ),
    };

    const mockTeamCityService = {
      getLatestBuildStatuses: () =>
        of([
          {
            id: 123,
            number: '456',
            status: 'SUCCESS',
            statusText: 'Success',
            buildTypeId: 'Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite',
            finishDate: '20260417T100000+0000',
            branchName: 'main',
          },
        ]),
      getBuildByRevision: () => of(matchingBuild),
    };

    const mockDistributedLatestMainService = {
      getEngineRevision: () => of('664ad19cab4eaca1e8318ac9aa674322fc99ee16'),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: DistributedLatestMainService, useValue: mockDistributedLatestMainService },
        { provide: JiraService, useValue: mockJiraService },
        { provide: TeamCityService, useValue: mockTeamCityService },
      ],
    });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const buildItems = fixture.nativeElement.querySelectorAll('.build-item');
    expect(buildItems.length).toBe(2);
    expect(buildItems[1].textContent).toContain('Number: 1323');
    expect(buildItems[1].textContent).toContain('ID: 714094');
    expect(buildItems[1].textContent).toContain('Finished: 2026-04-16 16:26:42 SWE');
    expect(buildItems[1].textContent).toContain('Distributed Latest Main');
  });

  it('should refresh TeamCity bottom bar data when the refresh button is clicked', () => {
    let latestBuildStatusesCalls = 0;
    let engineRevisionCalls = 0;
    let buildByRevisionCalls = 0;

    const mockSettingsService = {
      loadSettings: () => of(mockSettings),
      getSettings: () => mockSettings,
      settings$: of(mockSettings),
    };

    const mockJiraService = {
      getFilterResults: () =>
        of(
          new HttpResponse<JiraSearchResponse>({
            body: { issues: [] },
            status: 200,
          }),
        ),
    };

    const mockTeamCityService = {
      getLatestBuildStatuses: () => {
        latestBuildStatusesCalls += 1;
        return of([]);
      },
      getBuildByRevision: () => {
        buildByRevisionCalls += 1;
        return of(null);
      },
    };

    const mockDistributedLatestMainService = {
      getEngineRevision: () => {
        engineRevisionCalls += 1;
        return of('664ad19cab4eaca1e8318ac9aa674322fc99ee16');
      },
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: DistributedLatestMainService, useValue: mockDistributedLatestMainService },
        { provide: JiraService, useValue: mockJiraService },
        { provide: TeamCityService, useValue: mockTeamCityService },
      ],
    });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(latestBuildStatusesCalls).toBe(1);
    expect(engineRevisionCalls).toBe(1);
    expect(buildByRevisionCalls).toBe(1);

    fixture.nativeElement.querySelector('.refresh-btn').click();
    fixture.detectChanges();

    expect(latestBuildStatusesCalls).toBe(2);
    expect(engineRevisionCalls).toBe(2);
    expect(buildByRevisionCalls).toBe(2);
  });

  it('should automatically refresh TeamCity bottom bar data every 5 minutes', () => {
    let latestBuildStatusesCalls = 0;
    let engineRevisionCalls = 0;
    let buildByRevisionCalls = 0;

    vi.useFakeTimers();

    const mockSettingsService = {
      loadSettings: () => of(mockSettings),
      getSettings: () => mockSettings,
      settings$: of(mockSettings),
    };

    const mockJiraService = {
      getFilterResults: () =>
        of(
          new HttpResponse<JiraSearchResponse>({
            body: { issues: [] },
            status: 200,
          }),
        ),
    };

    const mockTeamCityService = {
      getLatestBuildStatuses: () => {
        latestBuildStatusesCalls += 1;
        return of([]);
      },
      getBuildByRevision: () => {
        buildByRevisionCalls += 1;
        return of(null);
      },
    };

    const mockDistributedLatestMainService = {
      getEngineRevision: () => {
        engineRevisionCalls += 1;
        return of('664ad19cab4eaca1e8318ac9aa674322fc99ee16');
      },
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: DistributedLatestMainService, useValue: mockDistributedLatestMainService },
        { provide: JiraService, useValue: mockJiraService },
        { provide: TeamCityService, useValue: mockTeamCityService },
      ],
    });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(latestBuildStatusesCalls).toBe(1);
    expect(engineRevisionCalls).toBe(1);
    expect(buildByRevisionCalls).toBe(1);

    vi.advanceTimersByTime(5 * 60 * 1000);
    fixture.detectChanges();

    expect(latestBuildStatusesCalls).toBe(2);
    expect(engineRevisionCalls).toBe(2);
    expect(buildByRevisionCalls).toBe(2);

    fixture.destroy();
    vi.useRealTimers();
  });
});
