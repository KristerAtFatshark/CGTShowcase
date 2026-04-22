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
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'heading',
            content: [{ type: 'text', text: 'Summary / Goal' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'The widget is broken and needs fixing.' }],
          },
          {
            type: 'mediaSingle',
            attrs: { layout: 'center' },
          },
          {
            type: 'heading',
            content: [{ type: 'text', text: 'Implementation Details' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Do not show this in the card.' }],
          },
        ],
      } as unknown as string,
      status: { name: 'In Progress' },
      issuetype: {
        name: 'Bug',
        iconUrl: 'https://example.com/bug.svg',
      },
      priority: {
        name: 'Highest',
        iconUrl: 'https://example.com/highest.svg',
      },
      assignee: {
        displayName: 'Jane Doe',
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

  it('should display the assignee', () => {
    const el = fixture.nativeElement.querySelector('.assignee');
    expect(el.textContent).toContain('Jane Doe');
  });

  it('should display the status', () => {
    const el = fixture.nativeElement.querySelector('.status');
    expect(el.textContent).toContain('In Progress');
  });

  it('should display the priority icon and name', () => {
    const icon = fixture.nativeElement.querySelector('.priority-icon');
    const text = fixture.nativeElement.querySelector('.priority-name');
    expect(icon.getAttribute('src')).toBe('https://example.com/highest.svg');
    expect(icon.getAttribute('alt')).toBe('Highest');
    expect(text.textContent).toContain('Highest');
  });

  it('should show priority text when icon is missing', () => {
    const fix = TestBed.createComponent(JiraItemComponent);
    fix.componentInstance.issue = {
      ...mockIssue,
      fields: {
        ...mockIssue.fields,
        priority: { name: 'Medium' },
      },
    };
    fix.detectChanges();

    expect(fix.nativeElement.querySelector('.priority-icon')).toBeNull();
    expect(fix.nativeElement.querySelector('.priority-name').textContent).toContain('Medium');
  });

  it('should display the summary', () => {
    const el = fixture.nativeElement.querySelector('.summary');
    expect(el.textContent).toContain('Fix the widget');
  });

  it('should hide the description when showDescription is false', () => {
    const fix = TestBed.createComponent(JiraItemComponent);
    fix.componentInstance.issue = mockIssue;
    fix.componentInstance.showDescription = false;
    fix.detectChanges();

    expect(fix.nativeElement.querySelector('.row-summary')).toBeTruthy();
    expect(fix.nativeElement.querySelector('.row-description')).toBeNull();
  });

  it('should display the description', () => {
    const el = fixture.nativeElement.querySelector('.description-box');
    expect(el.textContent).toContain('The widget is broken');
    expect(el.textContent).not.toContain('No description');
    expect(el.textContent).not.toContain('Do not show this in the card');
    expect(component.description).toBe('The widget is broken and needs fixing.');
  });

  it('should show fallback text when description is null', () => {
    const fix = TestBed.createComponent(JiraItemComponent);
    fix.componentInstance.issue = {
      ...mockIssue,
      fields: { ...mockIssue.fields, description: null },
    };
    fix.detectChanges();
    const el = fix.nativeElement.querySelector('.description-box');
    expect(el.textContent).toContain('Summary / Goal section is missing from this ticket');
  });

  it('should show unassigned when jira assignee is missing', () => {
    const fix = TestBed.createComponent(JiraItemComponent);
    fix.componentInstance.issue = {
      ...mockIssue,
      fields: { ...mockIssue.fields, assignee: null },
    };
    fix.detectChanges();

    expect(fix.nativeElement.querySelector('.assignee').textContent).toContain('Unassigned');
  });

  it('should show fallback text when Summary / Goal section is missing', () => {
    const fix = TestBed.createComponent(JiraItemComponent);
    fix.componentInstance.issue = {
      ...mockIssue,
      fields: {
        ...mockIssue.fields,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'heading',
              content: [{ type: 'text', text: 'Implementation Details' }],
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Only implementation details exist.' }],
            },
          ],
        } as unknown as string,
      },
    };
    fix.detectChanges();

    const el = fix.nativeElement.querySelector('.description-box');
    expect(el.textContent).toContain('Summary / Goal section is missing from this ticket');
  });

  it('should accept auto scroll pixels per second input', () => {
    component.autoScrollPixelsPerSecond = 12.5;
    expect(component.autoScrollPixelsPerSecond).toBe(12.5);
  });
});
