import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BottomBarComponent } from './bottom-bar.component';
import { TeamCityBuild } from '../../models/teamcity.models';

describe('BottomBarComponent', () => {
  let component: BottomBarComponent;
  let fixture: ComponentFixture<BottomBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render placeholder text', () => {
    const el = fixture.nativeElement.querySelector('.placeholder');
    expect(el.textContent).toContain('TeamCity Build Status');
  });

  it('should render build status items', () => {
    const build: TeamCityBuild = {
      id: 123,
      number: '456',
      status: 'SUCCESS',
      statusText: 'Success',
      buildTypeId: 'Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite',
      finishDate: '20260417T100000+0000',
      branchName: 'main',
    };

    const buildFixture = TestBed.createComponent(BottomBarComponent);
    buildFixture.componentInstance.builds = [build];
    buildFixture.detectChanges();

    const item = buildFixture.nativeElement.querySelector('.build-item');
    expect(item).toBeTruthy();
    expect(item.textContent).toContain(
      'Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite',
    );
    expect(item.textContent).toContain('ID: 123');
    expect(item.textContent).toContain('Finished: 2026-04-17 10:00:00 UTC+00:00');
    expect(item.textContent).toContain('Branch: main');
  });

  it('should render non-successful builds as not successful', () => {
    const buildFixture = TestBed.createComponent(BottomBarComponent);
    buildFixture.componentInstance.builds = [
      {
        id: 124,
        number: '789',
        status: 'FAILURE',
        statusText: 'Failure',
        buildTypeId: 'BuildB',
        finishDate: '20260417T120500+0200',
        branchName: 'release/test',
      },
    ];
    buildFixture.detectChanges();

    const status = buildFixture.nativeElement.querySelector('.build-status');
    expect(status.textContent).toContain('Not successful');
    expect(status.classList).toContain('build-status-failed');
  });

  it('should show unknown branch when TeamCity omits branch name', () => {
    const buildFixture = TestBed.createComponent(BottomBarComponent);
    buildFixture.componentInstance.builds = [
      {
        id: 125,
        number: '790',
        status: 'SUCCESS',
        statusText: 'Success',
        buildTypeId: 'BuildC',
        finishDate: '20260417T120500+0200',
      },
    ];
    buildFixture.detectChanges();

    expect(buildFixture.nativeElement.querySelector('.build-item').textContent).toContain(
      'Branch: Unknown branch',
    );
  });
});
