import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private totalCommitsSubject = new BehaviorSubject<number>(0);
  totalCommits$ = this.totalCommitsSubject.asObservable();

  setTotalCommits(totalCommits: number): void {
    this.totalCommitsSubject.next(totalCommits);
  }
}
