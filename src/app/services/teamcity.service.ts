import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  TeamCityBuild,
  TeamCityBuildDetails,
  TeamCityBuildResponse,
} from '../models/teamcity.models';

@Injectable({
  providedIn: 'root',
})
export class TeamCityService {
  constructor(private http: HttpClient) {}

  getLatestBuildStatus(buildTypeId: string): Observable<TeamCityBuild | null> {
    const locator = encodeURIComponent(
      'running:false,defaultFilter:false,branch:default:any,count:1',
    );

    return this.http
      .get<TeamCityBuildResponse>(
        `/teamcity-api/app/rest/buildTypes/id:${encodeURIComponent(buildTypeId)}/builds/?locator=${locator}`,
      )
      .pipe(map((response) => this.mapLatestBuild(response.build?.[0])));
  }

  getLatestBuildStatuses(buildTypeIds: string[]): Observable<TeamCityBuild[]> {
    if (buildTypeIds.length === 0) {
      return of([]);
    }

    return forkJoin(buildTypeIds.map((buildTypeId) => this.getLatestBuildStatus(buildTypeId))).pipe(
      map((results) => results.filter((build): build is TeamCityBuild => build !== null)),
    );
  }

  private mapLatestBuild(build?: TeamCityBuildDetails): TeamCityBuild | null {
    if (!build) {
      return null;
    }

    return {
      id: build.id,
      number: build.number,
      status: build.status,
      statusText: build.statusText,
      finishDate: build.finishDate,
      buildTypeId: build.buildTypeId,
      branchName: build.branchName,
      defaultBranch: build.defaultBranch,
    };
  }
}
