# Status

## General

- Project is an Angular 21 standalone app for Windows-based Jira showcase screens.
- Runtime settings are loaded from `public/UserSettings.json`.
- Jira API access is proxied through `/jira-api/*` in dev and production.
- Jira and TeamCity API access now share a single dev proxy config with separate per-route auth settings.
- App uses zoneless Angular change detection via `provideZonelessChangeDetection()`.

## Current Behavior

- Top debug bar is hidden by default via `showDebugBar: false` and can be enabled through browser-local override or server settings.
- The debug bar can override selected settings per browser via cookie-backed local settings.
- The text size multiplier is loaded from `UserSettings.json` and scales component-level text sizes directly.
- The left Jira panel width is loaded from `UserSettings.json` as a CSS length string.
- The bottom bar height is loaded from `UserSettings.json` as a CSS length string.
- The `distributedLatestMain` path is loaded from `UserSettings.json` as a network file path string.
- Left and right Jira description visibility are loaded separately from `UserSettings.json`.
- Jira panel page size is loaded from `UserSettings.json`.
- Jira panel auto page-flip interval is loaded from `UserSettings.json`.
- Left and right Jira panels load from configured filter IDs.
- Jira panels support paging with a runtime-configurable maximum items per page.
- Jira panels flip pages automatically instead of showing paging buttons.
- Panel headers show Jira filter name, filter ID, and the current auto-pager page when multiple pages exist.
- Jira items show issue type icon, key, assignee, priority, and status in the top row.
- Jira ticket cards show only the `Summary / Goal` section from the Jira description field.
- Unreadable or unsupported Jira description nodes are fully removed from the rendered Summary / Goal text, including leftover blank lines.
- Jira summary text is bold and 2px larger than the description text.
- Right-panel Jira cards keep the summary row and hide the description row.
- Jira item descriptions auto-scroll using native `scrollTop` with rounded pixel steps, a 2-second pause at the bottom, and a 1-second pause at the top.
- Startup loading failures are shown in red under `Loading...`.
- Bottom bar shows TeamCity build status items for configured build types.
- TeamCity lookups now request the latest finished `main` branch build through the TeamCity `builds` locator API.
- The app reads `distributedLatestMain`, parses `engine_revision` from the network JSON file, and appends a matched TeamCity build item when a `main` branch revision match is found.
- The appended distributed-main TeamCity card is labeled `Distributed Latest Main` after status in the top row.
- TeamCity build items show build type ID in the title row, success/failure text in the title row, and number, ID, finished time, and branch in the detail row.
- Pressing the refresh button reloads both Jira panels and the full TeamCity bottom-bar data flow.
- The app automatically runs the same full refresh flow every 5 minutes.
- TeamCity finished time now uses `finishDate`, with fallback to `finishOnAgentDate` when TeamCity omits `finishDate`.
- TeamCity finished time is displayed in Swedish local time using `Europe/Stockholm` timezone rules and the `SWE` suffix.
- Root batch helpers exist for starting and stopping the local dev server on port `4201`.
- Debug bar controls exist for `showDebugBar`, `textSizeMultiplier`, `leftPanelWidth`, `bottomBarHeight`, and `descriptionAutoScrollPixelsPerSecond`.
- A hidden 32x21 top-right reveal button can turn the browser-local debug bar setting back on and expands to show `Show debug bar` on hover.

## Current Settings

- Left panel filter ID: `18046`
- Right panel filter ID: `18048`
- Description auto-scroll speed: `12.5` pixels/second
- Left panel show description: `true`
- Right panel show description: `false`
- Jira panel max items per page: `4`
- Jira panel auto page flip seconds: `30`
- Show debug bar: `false`
- Text size multiplier: `1`
- Left panel width: `50%`
- Bottom bar height: `60px`
- Distributed latest main path: `\\filegw02\vault\stingray-binaries\main\latest\build_info.txt`
- TeamCity build type IDs: `Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite`

## Known Issues

- Jira filters can return 404 if the configured filter is unavailable to the Jira account.
- Jira dev proxy auth can break if `proxy.conf.js` loses the Jira `Authorization` header setup.
- TeamCity data depends on local `teamcity-auth.json` or TeamCity environment variables being present.
- Browser-visible behavior can depend on the dev proxy being active when running locally.
- TeamCity `builds` locator responses are collections, not single-build objects.
- If the distributed latest main match resolves to the same TeamCity build as the latest main card, the bottom-bar tracking key must include the label so both cards render.

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
- Refreshed `plan.md` to match the current Jira, TeamCity, distributed latest main, helper script, proxy, layout, paging, assignee, and browser-local settings behavior.
- Fixed TeamCity locator handling to read the `builds` collection response and keep only the latest finished default-branch build.
- Updated the TeamCity locator to return only the latest finished `main` branch build.
- Updated the TeamCity bottom-bar item UI to show the requested build fields with formatted finish time and clearer success/failure text.
- Added Jira priority field support and render priority icon/text before status in Jira item top rows.
- Added Jira assignee field support and render assignee text immediately to the right of the issue key.
- Renamed the runtime network path setting to `distributedLatestMain` and pointed it to the latest main build info file.
- Added a distributed latest main file reader/parser and a TeamCity revision-match lookup that appends a second bottom-bar build item when found.
- Moved the `Distributed Latest Main` label into the top row after status to keep the card more compact.
- Added explicit test coverage proving the refresh button reloads TeamCity bottom-bar data, including the distributed latest main lookup.
- Added browser-cookie-backed debug bar setting overrides that fall back to server settings when no local override exists.
- Limited Jira card descriptions to the `Summary / Goal` section and added a fallback message when that section is missing.
- Corrected the panel-specific Jira card behavior so only right-panel descriptions are hidden; summaries remain visible in both panels.
- Added a hidden top-right reveal hotspot that shows an orange border on hover and restores the browser-local debug bar override when clicked.
- Changed the hidden debug-bar reveal hotspot so the button itself expands to show `Show debug bar` on hover.
- Changed the server default so the debug bar is hidden unless enabled by server settings or a browser-local override.
- Added a shared 5-minute automatic refresh that reuses the same Jira and TeamCity reload flow as the refresh button.
- Added `start-server.bat` and `stop-server.bat` for the local Angular dev server workflow.
- Fixed bottom-bar card tracking so the latest main card and the labeled distributed-main match can both render even when they share the same TeamCity build ID.
- Adjusted the TeamCity bottom-bar detail row to remove duplicate build type/status text and show branch next to ID and finished time.
- Added TeamCity build `number` to the detail row before `ID`.
- Updated the TeamCity request fields so build completion time is returned consistently for the bottom bar.
- Converted TeamCity finished time display from raw UTC to Swedish local time in the bottom bar.
- Changed the Swedish time suffix from `svensk tid` to `SWE`.
- Merged the Angular dev proxy setup into `proxy.conf.js` so Jira and TeamCity both work from one config with route-specific auth.
- Added runtime layout settings for left panel width and bottom bar height in `UserSettings.json`.
- Added `leftPanelShowDescription` and `rightPanelShowDescription` to runtime settings, with defaults of left enabled and right disabled.
- Added `jiraPanelMaxItemsPerPage` to runtime settings with a default of `4`, plus Jira panel paging controls.
- Replaced visible Jira panel paging buttons with automatic page flipping and added `jiraPanelAutoPageFlipSeconds` with a default of `30`.
- Added a right-aligned `Page X / Y` indicator to Jira panel headers when auto-paging spans multiple pages.
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
- Verified the distributed latest main revision flow against the real network file and TeamCity revision locator, then re-ran `npm.cmd test -- --watch=false` and `npm.cmd run build`.
- Verified the merged dev proxy with live `localhost:4201/jira-api/...` and `localhost:4201/teamcity-api/...` requests plus `npm.cmd test -- --watch=false` and `npm.cmd run build`.
- Verified the new layout settings with `npm.cmd test -- --watch=false` and `npm.cmd run build`.
