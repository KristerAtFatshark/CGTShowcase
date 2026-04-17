import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { App } from './app';
import { UserSettings } from './models/user-settings.model';
import { SettingsService } from './services/settings.service';
import { JiraService } from './services/jira.service';
import { JiraSearchResponse } from './models/jira.models';

describe('App', () => {
  const mockSettings: UserSettings = {
    showDebugBar: true,
    leftPanelFilterId: '18046',
    rightPanelFilterId: '18047',
    descriptionAutoScrollPixelsPerSecond: 12.5,
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

    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: JiraService, useValue: mockJiraService },
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

  it('should show startup jira errors under loading text', () => {
    const fixture = setup(mockSettings, true);
    const loadingErrors = fixture.nativeElement.querySelectorAll('.loading-error');

    expect(loadingErrors.length).toBe(2);
    expect(loadingErrors[0].textContent).toContain('[18046] Failed to load issues: Filter missing');
    expect(loadingErrors[1].textContent).toContain('[18047] Failed to load issues: Filter missing');
  });
});
