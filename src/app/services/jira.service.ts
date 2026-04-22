import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { JiraSearchResponse, JiraFilterResponse } from '../models/jira.models';

@Injectable({
  providedIn: 'root',
})
export class JiraService {
  constructor(private http: HttpClient) {}

  getFilterResults(
    filterId: string,
    nextPageToken?: string,
    maxResults: number = 50,
  ): Observable<HttpResponse<JiraSearchResponse>> {
    return this.http.get<JiraFilterResponse>(`/jira-api/filter/${filterId}`).pipe(
      switchMap((filterResponse) => {
        const jql = encodeURIComponent(filterResponse.jql);
        let url = `/jira-api/search/jql?jql=${jql}&maxResults=${maxResults}&fields=summary,status,issuetype,priority,assignee,description,duedate`;
        if (nextPageToken) {
          url += `&nextPageToken=${encodeURIComponent(nextPageToken)}`;
        }
        return this.http
          .get<JiraSearchResponse>(url, {
            observe: 'response',
          })
          .pipe(
            map((response) => {
              const body = response.body
                ? { ...response.body, filterName: filterResponse.name ?? filterId }
                : null;

              return response.clone({ body });
            }),
          );
      }),
    );
  }
}
