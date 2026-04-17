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
  private readonly buildFields = encodeURIComponent(
    'count,build(id,number,status,statusText,finishDate,finishOnAgentDate,buildTypeId,branchName,defaultBranch)',
  );

  constructor(private http: HttpClient) {}

  getLatestBuildStatus(buildTypeId: string): Observable<TeamCityBuild | null> {
    const locator = encodeURIComponent('running:false,branch:main,count:1');

    return this.http
      .get<TeamCityBuildResponse>(
        `/teamcity-api/app/rest/buildTypes/id:${encodeURIComponent(buildTypeId)}/builds/?locator=${locator}&fields=${this.buildFields}`,
      )
      .pipe(map((response) => this.mapLatestBuild(response.build?.[0])));
  }

  getBuildByRevision(buildTypeId: string, revision: string): Observable<TeamCityBuild | null> {
    const locator = encodeURIComponent(
      `buildType:(id:${buildTypeId}),branch:main,running:false,revision:(version:${revision}),count:1`,
    );

    return this.http
      .get<TeamCityBuildResponse>(
        `/teamcity-api/app/rest/builds/?locator=${locator}&fields=${this.buildFields}`,
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
      finishDate: build.finishDate ?? build.finishOnAgentDate,
      buildTypeId: build.buildTypeId,
      branchName: build.branchName,
      defaultBranch: build.defaultBranch,
    };
  }
}
