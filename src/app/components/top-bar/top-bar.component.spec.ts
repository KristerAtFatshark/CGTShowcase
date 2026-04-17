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
});
