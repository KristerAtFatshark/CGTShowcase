# Status

## General

- Project is an Angular 21 standalone app for Windows-based Jira showcase screens.
- Runtime settings are loaded from `public/UserSettings.json`.
- Jira API access is proxied through `/jira-api/*` in dev and production.
- App uses zoneless Angular change detection via `provideZonelessChangeDetection()`.

## Current Behavior

- Top debug bar can be hidden with `showDebugBar`.
- The text size multiplier is loaded from `UserSettings.json` and scales component-level text sizes directly.
- Left and right Jira panels load from configured filter IDs.
- Panel headers show Jira filter name and filter ID.
- Jira items show issue type icon, key, and status in the top row.
- Jira item descriptions auto-scroll using native `scrollTop` with rounded pixel steps, a 2-second pause at the bottom, and a 1-second pause at the top.
- Startup loading failures are shown in red under `Loading...`.
- Bottom bar is a Jenkins placeholder.

## Current Settings

- Left panel filter ID: `18046`
- Right panel filter ID: `18048`
- Description auto-scroll speed: `12.5` pixels/second
- Text size multiplier: `1`

## Known Issues

- Jira filters can return 404 if the configured filter is unavailable to the Jira account.
- Browser-visible behavior can depend on the dev proxy being active when running locally.

## Workarounds

- If a Jira filter is missing or inaccessible, the startup loading screen should show the Jira error text.
- Restart the dev server after proxy or runtime config changes.
- Provide Jira credentials through local `jira-auth.json` or environment variables for production server use.

## Recent Changes

- Added `AGENTS.md` workflow rule file.
- Added this `status.md` operational status file.
- Moved text size scaling into `UserSettings.json` and removed the debug-bar control.
- Updated `plan.md` to reflect the current application state and runtime model.
- Panel headers now show bold filter names with non-bold filter IDs in parentheses.
- Jira items now show issue type icons.
- Replaced duration-based auto-scroll tuning with decimal `descriptionAutoScrollPixelsPerSecond` for consistent speed across all descriptions.
- Switched description scrolling back to native scrolling with stable timing to reduce text flicker.
- Added a 2-second pause when description scrolling reaches the bottom before restarting from the top.
- Added a 1-second pause at the top before description scrolling starts again.
- Removed committed Jira credentials; production auth now comes from ignored local config or environment variables.
- Scrollbars were restyled to match the dark UI.
