import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JiraItemComponent } from './jira-item.component';
import { JiraIssue } from '../../models/jira.models';

describe('JiraItemComponent', () => {
  let component: JiraItemComponent;
  let fixture: ComponentFixture<JiraItemComponent>;

  const mockIssue: JiraIssue = {
    key: 'TEST-42',
    fields: {
      summary: 'Fix the widget',
      description: 'The widget is broken and needs fixing.',
      status: { name: 'In Progress' },
      issuetype: {
        name: 'Bug',
        iconUrl: 'https://example.com/bug.svg',
      },
      duedate: '2026-06-15',
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JiraItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JiraItemComponent);
    component = fixture.componentInstance;
    component.issue = mockIssue;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the issue type icon', () => {
    const el = fixture.nativeElement.querySelector('.issue-type-icon');
    expect(el).toBeTruthy();
    expect(el.getAttribute('src')).toBe('https://example.com/bug.svg');
    expect(el.getAttribute('alt')).toBe('Bug');
  });

  it('should display the issue key', () => {
    const el = fixture.nativeElement.querySelector('.key');
    expect(el.textContent).toContain('TEST-42');
  });

  it('should display the status', () => {
    const el = fixture.nativeElement.querySelector('.status');
    expect(el.textContent).toContain('In Progress');
  });

  it('should display the summary', () => {
    const el = fixture.nativeElement.querySelector('.summary');
    expect(el.textContent).toContain('Fix the widget');
  });

  it('should display the description', () => {
    const el = fixture.nativeElement.querySelector('.description-box');
    expect(el.textContent).toContain('The widget is broken');
  });

  it('should show "No description" when description is null', () => {
    const fix = TestBed.createComponent(JiraItemComponent);
    fix.componentInstance.issue = {
      ...mockIssue,
      fields: { ...mockIssue.fields, description: null },
    };
    fix.detectChanges();
    const el = fix.nativeElement.querySelector('.description-box');
    expect(el.textContent).toContain('No description');
  });

  it('should accept auto scroll pixels per second input', () => {
    component.autoScrollPixelsPerSecond = 12.5;
    expect(component.autoScrollPixelsPerSecond).toBe(12.5);
  });
});
