# Status

## General

- Project is an Angular 21 standalone app for Windows-based Jira showcase screens.
- Runtime settings are loaded from `public/UserSettings.json`.
- Jira API access is proxied through `/jira-api/*` in dev and production.
- Jira and TeamCity API access now share a single dev proxy config with separate per-route auth settings.
- App uses zoneless Angular change detection via `provideZonelessChangeDetection()`.

## Current Behavior

- Top debug bar can be hidden with `showDebugBar`.
- The text size multiplier is loaded from `UserSettings.json` and scales component-level text sizes directly.
- The left Jira panel width is loaded from `UserSettings.json` as a CSS length string.
- The bottom bar height is loaded from `UserSettings.json` as a CSS length string.
- Left and right Jira panels load from configured filter IDs.
- Panel headers show Jira filter name and filter ID.
- Jira items show issue type icon, key, and status in the top row.
- Jira item descriptions auto-scroll using native `scrollTop` with rounded pixel steps, a 2-second pause at the bottom, and a 1-second pause at the top.
- Startup loading failures are shown in red under `Loading...`.
- Bottom bar shows TeamCity build status items for configured build types.
- TeamCity lookups now request the latest finished `main` branch build through the TeamCity `builds` locator API.
- TeamCity build items show build type ID in the title row, success/failure text in the title row, and number, ID, finished time, and branch in the detail row.
- TeamCity finished time now uses `finishDate`, with fallback to `finishOnAgentDate` when TeamCity omits `finishDate`.
- TeamCity finished time is displayed in Swedish local time using `Europe/Stockholm` timezone rules and the `SWE` suffix.

## Current Settings

- Left panel filter ID: `18046`
- Right panel filter ID: `18048`
- Description auto-scroll speed: `12.5` pixels/second
- Text size multiplier: `1`
- Left panel width: `50%`
- Bottom bar height: `60px`
- TeamCity build type IDs: `Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite`

## Known Issues

- Jira filters can return 404 if the configured filter is unavailable to the Jira account.
- Jira dev proxy auth can break if `proxy.conf.js` loses the Jira `Authorization` header setup.
- TeamCity data depends on local `teamcity-auth.json` or TeamCity environment variables being present.
- Browser-visible behavior can depend on the dev proxy being active when running locally.
- TeamCity `builds` locator responses are collections, not single-build objects.

## Workarounds

- If a Jira filter is missing or inaccessible, the startup loading screen should show the Jira error text.
- Restart the dev server after proxy or runtime config changes.
- Provide Jira credentials through local `jira-auth.json` or environment variables for production server use.
- For local dev, keep Jira and TeamCity auth in `proxy.conf.js`; `ng serve` does not read the production `serve.js` auth flow.
- Provide TeamCity credentials through local `teamcity-auth.json` or environment variables for production server use.
- If the bottom bar only shows `TeamCity Build Status` in local dev, verify the app was restarted after proxy config changes and that TeamCity auth is still present.

## Recent Changes

- Added `AGENTS.md` workflow rule file.
- Added this `status.md` operational status file.
- Moved text size scaling into `UserSettings.json` and removed the debug-bar control.
- Updated `plan.md` to reflect the current application state and runtime model.
- Added TeamCity auth support, TeamCity settings, and bottom-bar TeamCity build status rendering.
- Fixed TeamCity locator handling to read the `builds` collection response and keep only the latest finished default-branch build.
- Updated the TeamCity locator to return only the latest finished `main` branch build.
- Updated the TeamCity bottom-bar item UI to show the requested build fields with formatted finish time and clearer success/failure text.
- Adjusted the TeamCity bottom-bar detail row to remove duplicate build type/status text and show branch next to ID and finished time.
- Added TeamCity build `number` to the detail row before `ID`.
- Updated the TeamCity request fields so build completion time is returned consistently for the bottom bar.
- Converted TeamCity finished time display from raw UTC to Swedish local time in the bottom bar.
- Changed the Swedish time suffix from `svensk tid` to `SWE`.
- Merged the Angular dev proxy setup into `proxy.conf.js` so Jira and TeamCity both work from one config with route-specific auth.
- Added runtime layout settings for left panel width and bottom bar height in `UserSettings.json`.
- Restored Jira auth in the dev proxy after the TeamCity proxy update removed it.
- Removed the remaining Jenkins placeholder naming in favor of TeamCity terminology.
- Panel headers now show bold filter names with non-bold filter IDs in parentheses.
- Jira items now show issue type icons.
- Replaced duration-based auto-scroll tuning with decimal `descriptionAutoScrollPixelsPerSecond` for consistent speed across all descriptions.
- Switched description scrolling back to native scrolling with stable timing to reduce text flicker.
- Added a 2-second pause when description scrolling reaches the bottom before restarting from the top.
- Added a 1-second pause at the top before description scrolling starts again.
- Removed committed Jira credentials; production auth now comes from ignored local config or environment variables.
- Scrollbars were restyled to match the dark UI.
- Verified the current TeamCity service change with `npm.cmd test -- --watch=false` and `npm.cmd run build`.
- Verified the TeamCity bottom-bar UI change with `npm.cmd test -- --watch=false` and `npm.cmd run build`.
- Verified the revised TeamCity build item layout with `npm.cmd test -- --watch=false` and `npm.cmd run build`.
- Verified the TeamCity completion-time fallback with a live `localhost:4201/teamcity-api/...fields=...finishDate,finishOnAgentDate...` request plus `npm.cmd test -- --watch=false` and `npm.cmd run build`.
- Verified the Swedish TeamCity time formatting with `npm.cmd test -- --watch=false` and `npm.cmd run build`.
- Verified the `main` branch TeamCity filter with a live `localhost:4201/teamcity-api/...locator=running:false,branch:main,count:1...` request plus `npm.cmd test -- --watch=false` and `npm.cmd run build`.
- Verified the merged dev proxy with live `localhost:4201/jira-api/...` and `localhost:4201/teamcity-api/...` requests plus `npm.cmd test -- --watch=false` and `npm.cmd run build`.
- Verified the new layout settings with `npm.cmd test -- --watch=false` and `npm.cmd run build`.
