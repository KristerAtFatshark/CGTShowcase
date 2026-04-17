import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SettingsService } from './settings.service';
import { UserSettings } from '../models/user-settings.model';

describe('SettingsService', () => {
  let service: SettingsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), SettingsService],
    });
    service = TestBed.inject(SettingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null before loading', () => {
    expect(service.getSettings()).toBeNull();
  });

  it('should load settings from UserSettings.json', () => {
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

    service.loadSettings().subscribe((settings) => {
      expect(settings).toEqual(mockSettings);
    });

    const req = httpMock.expectOne('UserSettings.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockSettings);

    expect(service.getSettings()).toEqual(mockSettings);
  });

  it('should emit settings via settings$ observable', () => {
    const mockSettings: UserSettings = {
      showDebugBar: false,
      leftPanelFilterId: '111',
      rightPanelFilterId: '222',
      descriptionAutoScrollPixelsPerSecond: 8.5,
      textSizeMultiplier: 0.9,
      leftPanelWidth: '40%',
      bottomBarHeight: '80px',
      distributedLatestMain: '\\\\filegw02\\vault\\stingray-binaries\\main\\latest\\build_info.txt',
      teamCityBuildTypeIds: ['BuildA', 'BuildB'],
    };

    let emitted: UserSettings | undefined;
    service.settings$.subscribe((s) => (emitted = s));

    service.loadSettings().subscribe();
    const req = httpMock.expectOne('UserSettings.json');
    req.flush(mockSettings);

    expect(emitted).toEqual(mockSettings);
  });
});
