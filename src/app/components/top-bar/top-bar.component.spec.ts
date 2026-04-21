import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopBarComponent } from './top-bar.component';

describe('TopBarComponent', () => {
  let component: TopBarComponent;
  let fixture: ComponentFixture<TopBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TopBarComponent);
    component = fixture.componentInstance;
    component.settings = {
      showDebugBar: true,
      textSizeMultiplier: 1,
      leftPanelWidth: '50%',
      bottomBarHeight: '60px',
      descriptionAutoScrollPixelsPerSecond: 10,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render refresh button', () => {
    const button = fixture.nativeElement.querySelector('.refresh-btn');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Refresh');
  });

  it('should emit refresh event when button clicked', () => {
    let refreshed = false;
    component.refresh.subscribe(() => (refreshed = true));

    const button = fixture.nativeElement.querySelector('.refresh-btn');
    button.click();

    expect(refreshed).toBe(true);
  });

  it('should render debug setting controls', () => {
    expect(fixture.nativeElement.querySelectorAll('.control').length).toBe(5);
  });

  it('should emit settingChanged when a setting changes', () => {
    let change: { key: string; value: string | number | boolean } | undefined;
    component.settingChanged.subscribe((event) => (change = event));

    const input = fixture.nativeElement.querySelector('input[type="number"]');
    input.value = '1.5';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(change).toEqual({ key: 'textSizeMultiplier', value: 1.5 });
  });
});
