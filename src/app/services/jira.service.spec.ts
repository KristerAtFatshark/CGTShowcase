import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { JiraService } from './jira.service';
import { JiraFilterResponse, JiraSearchResponse } from '../models/jira.models';

describe('JiraService', () => {
  let service: JiraService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), JiraService],
    });
    service = TestBed.inject(JiraService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch filter then search with correct fields', () => {
    const mockFilter: JiraFilterResponse = { name: 'My Filter', jql: 'project = TEST' };
    const mockSearch: JiraSearchResponse = {
      issues: [
        {
          key: 'TEST-1',
          fields: {
            summary: 'Test issue',
            description: 'A description',
            status: { name: 'Open' },
            issuetype: { name: 'Task', iconUrl: 'https://example.com/task.svg' },
            duedate: '2026-05-01',
          },
        },
      ],
    };

    service.getFilterResults('18046').subscribe((response) => {
      expect(response.body?.issues.length).toBe(1);
      expect(response.body?.issues[0].key).toBe('TEST-1');
      expect(response.body?.filterName).toBe('My Filter');
    });

    const filterReq = httpMock.expectOne('/jira-api/filter/18046');
    expect(filterReq.request.method).toBe('GET');
    filterReq.flush(mockFilter);

    const jql = encodeURIComponent('project = TEST');
    const searchReq = httpMock.expectOne(
      `/jira-api/search/jql?jql=${jql}&maxResults=50&fields=summary,status,issuetype,description,duedate`,
    );
    expect(searchReq.request.method).toBe('GET');
    searchReq.flush(mockSearch);
  });

  it('should include nextPageToken when provided', () => {
    const mockFilter: JiraFilterResponse = { name: 'Paged Filter', jql: 'project = X' };
    const mockSearch: JiraSearchResponse = { issues: [] };

    service.getFilterResults('123', 'token123', 10).subscribe();

    const filterReq = httpMock.expectOne('/jira-api/filter/123');
    filterReq.flush(mockFilter);

    const jql = encodeURIComponent('project = X');
    const searchReq = httpMock.expectOne(
      `/jira-api/search/jql?jql=${jql}&maxResults=10&fields=summary,status,issuetype,description,duedate&nextPageToken=token123`,
    );
    searchReq.flush(mockSearch);
  });
});
