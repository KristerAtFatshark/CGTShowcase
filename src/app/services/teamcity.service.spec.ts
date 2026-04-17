import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TeamCityService } from './teamcity.service';

describe('TeamCityService', () => {
  let service: TeamCityService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), TeamCityService],
    });

    service = TestBed.inject(TeamCityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch the latest build status for a build type', () => {
    service
      .getLatestBuildStatus('Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite')
      .subscribe((build) => {
        expect(build).toEqual({
          id: 123,
          number: '456',
          status: 'SUCCESS',
          statusText: 'Success',
          finishDate: '20260417T100000+0000',
          buildTypeId: 'Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite',
          branchName: 'main',
          defaultBranch: true,
        });
      });

    const req = httpMock.expectOne(
      '/teamcity-api/app/rest/buildTypes/id:Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite/builds/?locator=running%3Afalse%2Cbranch%3Amain%2Ccount%3A1&fields=count%2Cbuild(id%2Cnumber%2Cstatus%2CstatusText%2CfinishDate%2CfinishOnAgentDate%2CbuildTypeId%2CbranchName%2CdefaultBranch)',
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      count: 1,
      build: [
        {
          id: 123,
          number: '456',
          status: 'SUCCESS',
          statusText: 'Success',
          finishDate: '20260417T100000+0000',
          buildTypeId: 'Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite',
          branchName: 'main',
          defaultBranch: true,
        },
      ],
    });
  });

  it('should fetch a build by revision for the main branch', () => {
    service
      .getBuildByRevision(
        'Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite',
        '664ad19cab4eaca1e8318ac9aa674322fc99ee16',
      )
      .subscribe((build) => {
        expect(build).toEqual({
          id: 714094,
          number: '1323',
          status: 'SUCCESS',
          statusText: 'Build chain finished (success: 28)',
          finishDate: '20260416T142642+0000',
          buildTypeId: 'Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite',
          branchName: 'main',
          defaultBranch: true,
        });
      });

    const req = httpMock.expectOne(
      '/teamcity-api/app/rest/builds/?locator=buildType%3A(id%3ALive_DarktideEngineGameStingrayEngineEditorAndToolsComposite)%2Cbranch%3Amain%2Crunning%3Afalse%2Crevision%3A(version%3A664ad19cab4eaca1e8318ac9aa674322fc99ee16)%2Ccount%3A1&fields=count%2Cbuild(id%2Cnumber%2Cstatus%2CstatusText%2CfinishDate%2CfinishOnAgentDate%2CbuildTypeId%2CbranchName%2CdefaultBranch)',
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      count: 1,
      build: [
        {
          id: 714094,
          number: '1323',
          status: 'SUCCESS',
          statusText: 'Build chain finished (success: 28)',
          finishDate: '20260416T142642+0000',
          buildTypeId: 'Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite',
          branchName: 'main',
          defaultBranch: true,
        },
      ],
    });
  });

  it('should return null when no build matches the revision', () => {
    service.getBuildByRevision('BuildA', 'revision123').subscribe((build) => {
      expect(build).toBeNull();
    });

    httpMock
      .expectOne(
        '/teamcity-api/app/rest/builds/?locator=buildType%3A(id%3ABuildA)%2Cbranch%3Amain%2Crunning%3Afalse%2Crevision%3A(version%3Arevision123)%2Ccount%3A1&fields=count%2Cbuild(id%2Cnumber%2Cstatus%2CstatusText%2CfinishDate%2CfinishOnAgentDate%2CbuildTypeId%2CbranchName%2CdefaultBranch)',
      )
      .flush({ count: 0, build: [] });
  });

  it('should fetch latest statuses for multiple build types', () => {
    service.getLatestBuildStatuses(['BuildA', 'BuildB']).subscribe((builds) => {
      expect(builds.length).toBe(2);
      expect(builds[0].buildTypeId).toBe('BuildA');
      expect(builds[1].buildTypeId).toBe('BuildB');
    });

    httpMock
      .expectOne(
        '/teamcity-api/app/rest/buildTypes/id:BuildA/builds/?locator=running%3Afalse%2Cbranch%3Amain%2Ccount%3A1&fields=count%2Cbuild(id%2Cnumber%2Cstatus%2CstatusText%2CfinishDate%2CfinishOnAgentDate%2CbuildTypeId%2CbranchName%2CdefaultBranch)',
      )
      .flush({
        count: 1,
        build: [
          {
            id: 1,
            number: '1',
            status: 'SUCCESS',
            statusText: 'Success',
            buildTypeId: 'BuildA',
            branchName: 'main',
            defaultBranch: true,
          },
        ],
      });

    httpMock
      .expectOne(
        '/teamcity-api/app/rest/buildTypes/id:BuildB/builds/?locator=running%3Afalse%2Cbranch%3Amain%2Ccount%3A1&fields=count%2Cbuild(id%2Cnumber%2Cstatus%2CstatusText%2CfinishDate%2CfinishOnAgentDate%2CbuildTypeId%2CbranchName%2CdefaultBranch)',
      )
      .flush({
        count: 1,
        build: [
          {
            id: 2,
            number: '2',
            status: 'FAILURE',
            statusText: 'Failure',
            buildTypeId: 'BuildB',
            branchName: 'main',
            defaultBranch: true,
          },
        ],
      });
  });

  it('should return null when TeamCity has no finished default-branch build', () => {
    service.getLatestBuildStatus('BuildA').subscribe((build) => {
      expect(build).toBeNull();
    });

    httpMock
      .expectOne(
        '/teamcity-api/app/rest/buildTypes/id:BuildA/builds/?locator=running%3Afalse%2Cbranch%3Amain%2Ccount%3A1&fields=count%2Cbuild(id%2Cnumber%2Cstatus%2CstatusText%2CfinishDate%2CfinishOnAgentDate%2CbuildTypeId%2CbranchName%2CdefaultBranch)',
      )
      .flush({ count: 0, build: [] });
  });

  it('should fall back to finishOnAgentDate when finishDate is missing', () => {
    service.getLatestBuildStatus('BuildA').subscribe((build) => {
      expect(build?.finishDate).toBe('20260417T103652+0000');
    });

    httpMock
      .expectOne(
        '/teamcity-api/app/rest/buildTypes/id:BuildA/builds/?locator=running%3Afalse%2Cbranch%3Amain%2Ccount%3A1&fields=count%2Cbuild(id%2Cnumber%2Cstatus%2CstatusText%2CfinishDate%2CfinishOnAgentDate%2CbuildTypeId%2CbranchName%2CdefaultBranch)',
      )
      .flush({
        count: 1,
        build: [
          {
            id: 1,
            number: '1',
            status: 'SUCCESS',
            statusText: 'Success',
            finishOnAgentDate: '20260417T103652+0000',
            buildTypeId: 'BuildA',
            branchName: 'main',
            defaultBranch: true,
          },
        ],
      });
  });

  it('should return empty array for no build ids', () => {
    service.getLatestBuildStatuses([]).subscribe((builds) => {
      expect(builds).toEqual([]);
    });
  });
});
