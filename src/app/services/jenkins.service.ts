import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface JenkinsBuild {
  jobName: string;
  buildNumber: number;
  status: 'SUCCESS' | 'FAILURE' | 'UNSTABLE' | 'ABORTED' | 'BUILDING' | 'UNKNOWN';
  timestamp: number;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class JenkinsService {
  /**
   * Stub: Retrieve build status for specified Jenkins jobs.
   * To be implemented when Jenkins API integration is needed.
   */
  getBuildStatuses(_jobNames: string[]): Observable<JenkinsBuild[]> {
    return of([]);
  }

  /**
   * Stub: Retrieve the latest build for a specific job.
   */
  getLatestBuild(_jobName: string): Observable<JenkinsBuild | null> {
    return of(null);
  }
}
