import { TestBed } from '@angular/core/testing';
import { BrowserSettingsService } from './browser-settings.service';

describe('BrowserSettingsService', () => {
  beforeEach(() => {
    document.cookie =
      'cgtshowcase-browser-settings=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
    TestBed.resetTestingModule();
  });

  it('should load overrides from the cookie', () => {
    document.cookie =
      'cgtshowcase-browser-settings=%7B%22showDebugBar%22%3Afalse%2C%22textSizeMultiplier%22%3A1.3%7D; path=/; SameSite=Lax';

    const service = TestBed.inject(BrowserSettingsService);

    expect(service.getOverrides()).toEqual({
      showDebugBar: false,
      textSizeMultiplier: 1.3,
    });
  });

  it('should persist overrides into a cookie', () => {
    const service = TestBed.inject(BrowserSettingsService);

    service.updateOverride('leftPanelWidth', '42%');

    expect(document.cookie).toContain('cgtshowcase-browser-settings=');
    expect(decodeURIComponent(document.cookie)).toContain('"leftPanelWidth":"42%"');
  });

  it('should ignore invalid cookie payloads', () => {
    document.cookie = 'cgtshowcase-browser-settings=not-json; path=/; SameSite=Lax';

    const service = TestBed.inject(BrowserSettingsService);

    expect(service.getOverrides()).toEqual({});
  });
});
