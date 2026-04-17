import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DistributedLatestMainService } from './distributed-latest-main.service';

describe('DistributedLatestMainService', () => {
  let service: DistributedLatestMainService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), DistributedLatestMainService],
    });

    service = TestBed.inject(DistributedLatestMainService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should parse engine_revision from the distributed latest main file', () => {
    service
      .getEngineRevision('\\\\filegw02\\vault\\stingray-binaries\\main\\latest\\build_info.txt')
      .subscribe((revision) => {
        expect(revision).toBe('664ad19cab4eaca1e8318ac9aa674322fc99ee16');
      });

    const req = httpMock.expectOne(
      '/app-api/distributed-latest-main?path=%5C%5Cfilegw02%5Cvault%5Cstingray-binaries%5Cmain%5Clatest%5Cbuild_info.txt',
    );
    expect(req.request.method).toBe('GET');
    req.flush(`{
  "engine_revision": "664ad19cab4eaca1e8318ac9aa674322fc99ee16"
}`);
  });

  it('should return null when the distributed file is not valid json', () => {
    service.getEngineRevision('path').subscribe((revision) => {
      expect(revision).toBeNull();
    });

    const req = httpMock.expectOne('/app-api/distributed-latest-main?path=path');
    req.flush('not json');
  });

  it('should return null when engine_revision is missing', () => {
    service.getEngineRevision('path').subscribe((revision) => {
      expect(revision).toBeNull();
    });

    const req = httpMock.expectOne('/app-api/distributed-latest-main?path=path');
    req.flush('{"build_id":"714093"}');
  });
});
