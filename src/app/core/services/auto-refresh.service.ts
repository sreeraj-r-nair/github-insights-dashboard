import { Injectable } from '@angular/core';
import { Subject, interval } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AutoRefreshService {
  private refreshSubject = new Subject<void>();

  constructor() {
    // Emit a refresh event every 15 minutes (900000 ms)
    interval(900000).subscribe(() => {
      this.triggerRefresh();
    });
  }

  get refresh$() {
    return this.refreshSubject.asObservable();
  }

  triggerRefresh(): void {
    this.refreshSubject.next();
  }
}
