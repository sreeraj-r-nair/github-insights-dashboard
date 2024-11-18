import { TestBed } from '@angular/core/testing';
import { SharedDataService } from './shared-data.service';
import { skip } from 'rxjs/operators';

describe('SharedDataService', () => {
  let service: SharedDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SharedDataService]
    });

    service = TestBed.inject(SharedDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get total commits correctly', (done: DoneFn) => {
    const totalCommits = 100;

    service.totalCommits$.pipe(skip(1)).subscribe((value) => {
      expect(value).toBe(totalCommits);
      done();
    });

    service.setTotalCommits(totalCommits);
  });

  it('should initialize total commits to 0', (done: DoneFn) => {
    service.totalCommits$.subscribe((value) => {
      expect(value).toBe(0);
      done();
    });
  });
});
