# Status

## General

- Project is an Angular 21 standalone app for Windows-based Jira showcase screens.
- Runtime settings are loaded from `public/UserSettings.json`.
- Jira API access is proxied through `/jira-api/*` in dev and production.
- TeamCity API access is handled separately from Jira to avoid cross-breaking auth changes.
- App uses zoneless Angular change detection via `provideZonelessChangeDetection()`.

## Current Behavior

- Top debug bar can be hidden with `showDebugBar`.
- The text size multiplier is loaded from `UserSettings.json` and scales component-level text sizes directly.
- Left and right Jira panels load from configured filter IDs.
- Panel headers show Jira filter name and filter ID.
- Jira items show issue type icon, key, and status in the top row.
- Jira item descriptions auto-scroll using native `scrollTop` with rounded pixel steps, a 2-second pause at the bottom, and a 1-second pause at the top.
- Startup loading failures are shown in red under `Loading...`.
- Bottom bar shows TeamCity build status items for configured build types.
- TeamCity lookups now request the latest finished default-branch build through the TeamCity `builds` locator API.
- TeamCity build items show ID, build type ID, success/failure text, and finished time.

## Current Settings

- Left panel filter ID: `18046`
- Right panel filter ID: `18048`
- Description auto-scroll speed: `12.5` pixels/second
- Text size multiplier: `1`
- TeamCity build type IDs: `Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite`

## Known Issues

- Jira filters can return 404 if the configured filter is unavailable to the Jira account.
- Jira dev proxy auth can break if `proxy.conf.json` loses the Jira `Authorization` header.
- TeamCity data depends on local `teamcity-auth.json` or TeamCity environment variables being present.
- Browser-visible behavior can depend on the dev proxy being active when running locally.
- TeamCity `builds` locator responses are collections, not single-build objects.
- Angular dev serve must use `proxy.dev.conf.js` so TeamCity requests get bearer auth while Jira keeps its own proxy config.

## Workarounds

- If a Jira filter is missing or inaccessible, the startup loading screen should show the Jira error text.
- Restart the dev server after proxy or runtime config changes.
- Provide Jira credentials through local `jira-auth.json` or environment variables for production server use.
- For local dev, keep Jira auth in `proxy.conf.json`; `ng serve` does not read the production `serve.js` auth flow.
- Provide TeamCity credentials through local `teamcity-auth.json` or environment variables for production server use.
- TeamCity has its own auth-driven connection path and should not be merged into Jira proxy changes.
- If the bottom bar only shows `TeamCity Build Status` in local dev, verify the app was started after the combined dev proxy config change.

## Recent Changes

- Added `AGENTS.md` workflow rule file.
- Added this `status.md` operational status file.
- Moved text size scaling into `UserSettings.json` and removed the debug-bar control.
- Updated `plan.md` to reflect the current application state and runtime model.
- Added TeamCity auth support, TeamCity settings, and bottom-bar TeamCity build status rendering.
- Fixed TeamCity locator handling to read the `builds` collection response and keep only the latest finished default-branch build.
- Updated the TeamCity bottom-bar item UI to show the requested build fields with formatted finish time and clearer success/failure text.
- Fixed Angular dev proxy wiring so `/teamcity-api/*` uses the separate bearer-auth TeamCity proxy during `ng serve`.
- Restored Jira auth in the dev proxy after the TeamCity proxy update removed it.
- Added a separate TeamCity proxy/auth config path so TeamCity changes do not affect Jira auth.
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
- Verified the TeamCity dev proxy fix with a live `localhost:4201/teamcity-api/...` request plus `npm.cmd test -- --watch=false` and `npm.cmd run build`.
