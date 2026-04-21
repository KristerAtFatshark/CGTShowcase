import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { UserSettings } from '../models/user-settings.model';

type BrowserSettingsOverrideKey =
  | 'showDebugBar'
  | 'textSizeMultiplier'
  | 'leftPanelWidth'
  | 'bottomBarHeight'
  | 'descriptionAutoScrollPixelsPerSecond';

export type BrowserSettingsOverrides = Partial<Pick<UserSettings, BrowserSettingsOverrideKey>>;

const COOKIE_NAME = 'cgtshowcase-browser-settings';
const COOKIE_DAYS = 365;

@Injectable({
  providedIn: 'root',
})
export class BrowserSettingsService {
  private overridesSubject = new ReplaySubject<BrowserSettingsOverrides>(1);
  readonly overrides$ = this.overridesSubject.asObservable();
  private overrides: BrowserSettingsOverrides = {};

  constructor() {
    this.overrides = this.readOverridesFromCookie();
    this.overridesSubject.next(this.overrides);
  }

  getOverrides(): BrowserSettingsOverrides {
    return this.overrides;
  }

  updateOverride<K extends keyof BrowserSettingsOverrides>(
    key: K,
    value: BrowserSettingsOverrides[K],
  ): void {
    this.overrides = {
      ...this.overrides,
      [key]: value,
    };
    this.writeOverridesCookie(this.overrides);
    this.overridesSubject.next(this.overrides);
  }

  private readOverridesFromCookie(): BrowserSettingsOverrides {
    if (typeof document === 'undefined') {
      return {};
    }

    const cookie = document.cookie.split('; ').find((entry) => entry.startsWith(`${COOKIE_NAME}=`));

    if (!cookie) {
      return {};
    }

    const encodedValue = cookie.substring(COOKIE_NAME.length + 1);

    try {
      return this.normalizeOverrides(JSON.parse(decodeURIComponent(encodedValue)) as object);
    } catch {
      return {};
    }
  }

  private normalizeOverrides(raw: object): BrowserSettingsOverrides {
    const candidate = raw as Partial<Record<BrowserSettingsOverrideKey, unknown>>;
    const normalized: BrowserSettingsOverrides = {};

    if (typeof candidate.showDebugBar === 'boolean') {
      normalized.showDebugBar = candidate.showDebugBar;
    }

    if (typeof candidate.textSizeMultiplier === 'number') {
      normalized.textSizeMultiplier = candidate.textSizeMultiplier;
    }

    if (typeof candidate.leftPanelWidth === 'string') {
      normalized.leftPanelWidth = candidate.leftPanelWidth;
    }

    if (typeof candidate.bottomBarHeight === 'string') {
      normalized.bottomBarHeight = candidate.bottomBarHeight;
    }

    if (typeof candidate.descriptionAutoScrollPixelsPerSecond === 'number') {
      normalized.descriptionAutoScrollPixelsPerSecond =
        candidate.descriptionAutoScrollPixelsPerSecond;
    }

    return normalized;
  }

  private writeOverridesCookie(overrides: BrowserSettingsOverrides): void {
    if (typeof document === 'undefined') {
      return;
    }

    const expires = new Date();
    expires.setDate(expires.getDate() + COOKIE_DAYS);
    const encodedValue = encodeURIComponent(JSON.stringify(overrides));
    document.cookie = `${COOKIE_NAME}=${encodedValue}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }
}
