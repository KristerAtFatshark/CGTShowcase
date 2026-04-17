import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DistributedLatestMainService {
  constructor(private http: HttpClient) {}

  getEngineRevision(filePath: string): Observable<string | null> {
    const encodedPath = encodeURIComponent(filePath);

    return this.http
      .get(`/app-api/distributed-latest-main?path=${encodedPath}`, {
        responseType: 'text',
      })
      .pipe(map((contents) => this.extractEngineRevision(contents)));
  }

  private extractEngineRevision(contents: string): string | null {
    try {
      const parsed = JSON.parse(contents) as { engine_revision?: unknown };
      return typeof parsed.engine_revision === 'string' && parsed.engine_revision.trim().length > 0
        ? parsed.engine_revision.trim()
        : null;
    } catch {
      return null;
    }
  }
}
