import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserSettings } from '../models/user-settings.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private settingsSubject = new ReplaySubject<UserSettings>(1);
  public settings$ = this.settingsSubject.asObservable();
  private currentSettings: UserSettings | null = null;

  constructor(private http: HttpClient) {}

  loadSettings(): Observable<UserSettings> {
    return this.http.get<UserSettings>('UserSettings.json').pipe(
      tap((settings) => {
        this.currentSettings = settings;
        this.settingsSubject.next(settings);
      }),
    );
  }

  getSettings(): UserSettings | null {
    return this.currentSettings;
  }
}
