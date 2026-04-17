import { TestBed } from '@angular/core/testing';
import { JenkinsService, JenkinsBuild } from './jenkins.service';

describe('JenkinsService', () => {
  let service: JenkinsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JenkinsService],
    });
    service = TestBed.inject(JenkinsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty array from getBuildStatuses stub', () => {
    service.getBuildStatuses(['job1', 'job2']).subscribe((result: JenkinsBuild[]) => {
      expect(result).toEqual([]);
    });
  });

  it('should return null from getLatestBuild stub', () => {
    service.getLatestBuild('job1').subscribe((result) => {
      expect(result).toBeNull();
    });
  });
});
