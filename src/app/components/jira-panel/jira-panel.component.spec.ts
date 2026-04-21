import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { JiraPanelComponent } from './jira-panel.component';
import { JiraService } from '../../services/jira.service';
import { JiraSearchResponse } from '../../models/jira.models';
import { vi } from 'vitest';

describe('JiraPanelComponent', () => {
  let component: JiraPanelComponent;
  let fixture: ComponentFixture<JiraPanelComponent>;
  let getFilterResultsSpy: ReturnType<typeof vi.fn>;

  function setup(
    issues: JiraSearchResponse['issues'] = [],
    shouldError = false,
    showDescription = true,
  ): void {
    getFilterResultsSpy = vi.fn();

    if (shouldError) {
      getFilterResultsSpy.mockReturnValue(throwError(() => new Error('Network error')));
    } else {
      const response = new HttpResponse<JiraSearchResponse>({
        body: { issues, filterName: 'My Filter' },
        status: 200,
      });
      getFilterResultsSpy.mockReturnValue(of(response));
    }

    TestBed.configureTestingModule({
      imports: [JiraPanelComponent],
      providers: [{ provide: JiraService, useValue: { getFilterResults: getFilterResultsSpy } }],
    });

    fixture = TestBed.createComponent(JiraPanelComponent);
    component = fixture.componentInstance;
    component.filterId = '18046';
    component.descriptionAutoScrollPixelsPerSecond = 12.5;
    component.showDescription = showDescription;
    fixture.detectChanges();
  }

  it('should create and load issues', () => {
    setup();
    expect(component).toBeTruthy();
    expect(component.loading()).toBe(false);
    expect(getFilterResultsSpy).toHaveBeenCalledWith('18046');
    expect(component.filterName()).toBe('My Filter');
  });

  it('should display the filter name in the header', () => {
    setup();
    const title = fixture.nativeElement.querySelector('.panel-title');
    const filterId = fixture.nativeElement.querySelector('.panel-filter-id');
    expect(title.textContent).toContain('My Filter');
    expect(filterId.textContent).toContain('(18046)');
  });

  it('should display issues after loading', () => {
    setup([
      {
        key: 'TEST-1',
        fields: {
          summary: 'Issue 1',
          description: 'Desc',
          status: { name: 'Open' },
          issuetype: { name: 'Bug', iconUrl: 'https://example.com/bug.svg' },
          duedate: null,
        },
      },
    ]);

    expect(component.issues().length).toBe(1);
    const items = fixture.nativeElement.querySelectorAll('app-jira-item');
    expect(items.length).toBe(1);
  });

  it('should keep configured auto scroll speed', () => {
    setup();
    expect(component.descriptionAutoScrollPixelsPerSecond).toBe(12.5);
  });

  it('should keep the showDescription setting for jira items', () => {
    setup(
      [
        {
          key: 'TEST-1',
          fields: {
            summary: 'Issue 1',
            description: 'Desc',
            status: { name: 'Open' },
            issuetype: { name: 'Bug', iconUrl: 'https://example.com/bug.svg' },
            duedate: null,
          },
        },
      ],
      false,
      false,
    );

    const item = fixture.nativeElement.querySelector('app-jira-item');
    expect(item).toBeTruthy();
    expect(component.showDescription).toBe(false);
  });

  it('should show error on failure', () => {
    setup([], true);

    expect(component.error()).toBeTruthy();
    const errorEl = fixture.nativeElement.querySelector('.error');
    expect(errorEl).toBeTruthy();
  });

  it('should emit initial load failure details', () => {
    getFilterResultsSpy = vi.fn().mockReturnValue(throwError(() => new Error('Network error')));

    TestBed.configureTestingModule({
      imports: [JiraPanelComponent],
      providers: [{ provide: JiraService, useValue: { getFilterResults: getFilterResultsSpy } }],
    });

    fixture = TestBed.createComponent(JiraPanelComponent);
    component = fixture.componentInstance;
    component.filterId = '18046';

    const emitted = vi.fn();
    component.initialLoadResolved.subscribe(emitted);

    fixture.detectChanges();

    expect(emitted).toHaveBeenCalledWith({
      filterId: '18046',
      error: 'Failed to load issues: Network error',
    });
  });

  it('should show empty message when no issues', () => {
    setup([]);

    const emptyEl = fixture.nativeElement.querySelector('.empty');
    expect(emptyEl).toBeTruthy();
    expect(emptyEl.hidden).toBe(false);
  });
});
