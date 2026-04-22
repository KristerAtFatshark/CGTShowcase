# CGTShowcase - Current Application Overview

## Overview

CGTShowcase is an Angular 21 standalone TypeScript application intended for Windows TV/browser display use. It loads Jira issues from two configured Jira filters, renders them in two side-by-side panels, and shows TeamCity build status cards in the bottom bar.

This document reflects the current implemented application.

## Current Stack

- Angular 21 standalone application
- TypeScript
- Zoneless change detection via `provideZonelessChangeDetection()`
- Angular build system via `@angular/build`
- Unit tests via Vitest
- Windows-friendly local and production runtime with Node.js

## Runtime Model

### Development

- `ng serve`
- Local helper: `start-server.bat`
- Local helper: `stop-server.bat`
- Jira, TeamCity, and app-local file access all go through `proxy.conf.js`
- `proxy.conf.js` uses separate per-route auth handling for Jira and TeamCity
- `proxy.conf.js` also exposes a local `/app-api/*` path for reading the distributed latest main file during dev

### Production

- `node serve.js`
- `serve.js` serves the built Angular files
- `serve.js` proxies Jira and TeamCity API requests
- `serve.js` also exposes `/app-api/distributed-latest-main` for reading the distributed latest main file

## Auth Model

### Jira Auth

- Browser code calls `/jira-api/*`
- Jira credentials are not committed
- Dev and production auth come from either:
  - local ignored `jira-auth.json`
  - `JIRA_EMAIL`, `JIRA_TOKEN`, and optional `JIRA_BASE` environment variables
- `jira-auth.example.json` is the tracked template

### TeamCity Auth

- Browser code calls `/teamcity-api/*`
- TeamCity credentials are not committed
- Dev and production auth come from either:
  - local ignored `teamcity-auth.json`
  - `TEAMCITY_BEARER_TOKEN` and optional `TEAMCITY_BASE` environment variables
- `teamcity-auth.example.json` is the tracked template

## Current Project Structure

```text
CGTShowcase/
├── public/
│   ├── UserSettings.json
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── bottom-bar/
│   │   │   ├── jira-item/
│   │   │   ├── jira-panel/
│   │   │   └── top-bar/
│   │   ├── models/
│   │   │   ├── jira.models.ts
│   │   │   ├── teamcity.models.ts
│   │   │   └── user-settings.model.ts
│   │   ├── services/
│   │   │   ├── browser-settings.service.ts
│   │   │   ├── distributed-latest-main.service.ts
│   │   │   ├── jira.service.ts
│   │   │   ├── settings.service.ts
│   │   │   └── teamcity.service.ts
│   │   ├── app.config.ts
│   │   ├── app.css
│   │   ├── app.html
│   │   ├── app.spec.ts
│   │   └── app.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── AGENTS.md
├── jira-auth.example.json
├── plan.md
├── proxy.conf.js
├── serve.js
├── start-server.bat
├── status.md
├── stop-server.bat
└── teamcity-auth.example.json
```

## Current User Settings

`public/UserSettings.json` is runtime-editable and does not require a rebuild.

Current shape:

```json
{
  "showDebugBar": true,
  "leftPanelFilterId": "22787",
  "rightPanelFilterId": "22788",
  "leftPanelShowDescription": true,
  "rightPanelShowDescription": false,
  "jiraPanelMaxItemsPerPage": 4,
  "jiraPanelAutoPageFlipSeconds": 30,
  "descriptionAutoScrollPixelsPerSecond": 10,
  "textSizeMultiplier": 1,
  "leftPanelWidth": "50%",
  "bottomBarHeight": "80px",
  "distributedLatestMain": "\\\\filegw02\\vault\\stingray-binaries\\main\\latest\\build_info.txt",
  "teamCityBuildTypeIds": ["Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite"]
}
```

Fields:

- `showDebugBar`: show or hide the top debug bar
- `leftPanelFilterId`: Jira filter for the left panel
- `rightPanelFilterId`: Jira filter for the right panel
- `leftPanelShowDescription`: show or hide Jira card descriptions in the left panel
- `rightPanelShowDescription`: show or hide Jira card descriptions in the right panel
- `jiraPanelMaxItemsPerPage`: maximum Jira items shown per page
- `jiraPanelAutoPageFlipSeconds`: automatic page flip interval for Jira panels
- `descriptionAutoScrollPixelsPerSecond`: description scroll speed in pixels per second
- `textSizeMultiplier`: multiplies UI text sizes globally
- `leftPanelWidth`: CSS width value for the left Jira panel
- `bottomBarHeight`: CSS height value for the bottom bar
- `distributedLatestMain`: network path to the latest distributed main build info file
- `teamCityBuildTypeIds`: TeamCity build type IDs to show in the bottom bar

## Browser-Local Debug Settings

The debug bar supports browser-specific overrides stored in a cookie. These override server settings only for the current browser.

Cookie-backed overrideable settings:

- `showDebugBar`
- `textSizeMultiplier`
- `leftPanelWidth`
- `bottomBarHeight`
- `descriptionAutoScrollPixelsPerSecond`

Behavior:

- If a browser cookie override exists, it wins for that browser
- If not, the app uses the server-provided `UserSettings.json` value
- A hidden 32x21 top-right reveal button can restore the debug bar by setting the browser-local `showDebugBar` override back to `true`

## Current Implemented Features

### Settings File

- Implemented as `public/UserSettings.json`
- Loaded by `SettingsService`
- Used at startup to configure layout and behavior

### Jira Filter Search

- Implemented in `jira.service.ts`
- Flow:
  1. request filter details from `/jira-api/filter/{filterId}`
  2. read Jira filter JQL and filter name
  3. request issues from `/jira-api/search/jql?...`

Requested Jira fields:

- `summary`
- `status`
- `issuetype`
- `priority`
- `assignee`
- `description`
- `duedate`

Used Jira data in the UI:

- filter name
- issue type icon
- issue key
- assignee display name
- priority icon and text
- status
- summary
- `Summary / Goal` description text

### Two Jira Panels

- Left and right panels use separate filter IDs from `UserSettings.json`
- Each panel loads independently
- Left panel width is runtime-configurable
- Description visibility is configurable separately for left and right panels
- Panels page their issue lists using the configured maximum items per page
- Panels automatically flip pages on a timer instead of showing visible paging buttons

### Automatic Initial Load

- On startup:
  1. load `UserSettings.json`
  2. load browser-local debug setting overrides
  3. render the app layout
  4. each panel loads Jira data automatically
  5. TeamCity build cards load automatically
  6. the distributed latest main file is read and matched against TeamCity if configured

### Refresh Behavior

- Implemented in the top bar
- Manual refresh button reloads both Jira panels and the full TeamCity bottom-bar flow
- Automatic refresh runs the same full refresh flow every 5 minutes
- Refresh also reruns the distributed latest main file read and TeamCity revision match

### TeamCity Build Status

- Implemented in `teamcity.service.ts`
- Bottom bar renders TeamCity build status cards for configured build type IDs
- TeamCity query returns the latest finished `main` branch build for each configured build type
- Current requested TeamCity fields:
  - `id`
  - `number`
  - `status`
  - `statusText`
  - `buildTypeId`
  - `branchName`
  - `defaultBranch`
  - `finishDate`
  - `finishOnAgentDate`
- UI uses `finishDate` and falls back to `finishOnAgentDate`

### Distributed Latest Main Match

- Implemented through `distributed-latest-main.service.ts`
- Reads `distributedLatestMain`
- Loads the file contents through `/app-api/distributed-latest-main`
- Parses JSON from the file
- Reads `engine_revision`
- Uses the TeamCity revision locator to find a matching finished `main` branch build for:
  - `Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite`
- When a match is found, appends another TeamCity card to the right in the bottom bar
- That appended card is labeled `Distributed Latest Main`

Important note:

- The current distributed main match is based on the git revision hash from `engine_revision`
- It is not using a numeric `build.vcs.number`
- If the distributed match resolves to the same build as the latest main card, both cards still render because the bottom-bar tracking key includes the optional label

## Current UI Layout

### Top Bar

- Optional via `showDebugBar`
- Contains debug label, browser-local setting controls, and refresh button

### Left Panel

- Scrollable Jira issue list from the left filter
- Width controlled by `leftPanelWidth`
- Description visibility controlled by `leftPanelShowDescription`
- Uses automatic page flipping when more than one page exists

### Right Panel

- Scrollable Jira issue list from the right filter
- Fills the remaining horizontal space
- Description visibility controlled by `rightPanelShowDescription`
- Uses automatic page flipping when more than one page exists

### Bottom Bar

- TeamCity build status area
- Height controlled by `bottomBarHeight`

## Current Panel Header Layout

Each panel header shows:

- bold filter name
- non-bold filter id in parentheses

Example:

```text
My Filter (18046)
```

## Current Jira Item Layout

Each Jira item has up to 3 visual sections:

### Row 1

- issue type icon
- issue key
- assignee
- priority icon and priority text
- status

### Row 2

- summary

### Row 3

- vertically scrolling description area
- this row is hidden when the panel’s description visibility setting is disabled

## Jira Description Behavior

- Jira ticket cards show only the `Summary / Goal` section from the Jira description field
- If the Jira ticket does not contain a `Summary / Goal` section, the card shows:
  - `Summary / Goal section is missing from this ticket`
- Unsupported or unreadable Jira description nodes are fully removed from the rendered text, including blank lines they would otherwise leave behind

## Current TeamCity Build Item Layout

Each TeamCity build item has 2 visual sections:

### Title Row

- `buildTypeId`
- success or failure text
- optional `Distributed Latest Main` label after status for the appended distributed-main match card

### Detail Row

- `number`
- `id`
- finished time in Swedish local time with `SWE` suffix
- `branchName`

## Current Jira Panel Paging Behavior

- Each panel shows up to `jiraPanelMaxItemsPerPage` items at once
- If a panel has more than one page, it automatically flips pages every `jiraPanelAutoPageFlipSeconds`
- The page index wraps back to the first page after the last one
- There are no visible paging buttons

## Current Description Auto-Scroll Behavior

Descriptions currently:

- scroll at a consistent speed based on `descriptionAutoScrollPixelsPerSecond`
- use native `scrollTop`
- pause 2 seconds at the bottom
- jump back to the top
- pause 1 second at the top
- continue scrolling again

## Current Text Scaling Behavior

Text scaling is driven by `textSizeMultiplier` in `UserSettings.json` or the browser-local debug override cookie.

This multiplier is applied through a shared CSS variable and affects visible text in:

- loading screen
- top bar
- panel headers
- panel status, error, and empty text
- Jira item content
- bottom bar

## Error Handling Behavior

### Startup Loading Screen

If startup loading fails, the loading screen stays visible and shows errors in red under `Loading...`.

This covers:

- settings load failures
- Jira panel initial load failures
- missing or inaccessible Jira filters

### Panel-Level Errors

Each Jira panel also shows its own error message when its Jira load fails.

### TeamCity and Distributed Main Errors

- TeamCity load errors are logged to the console
- Distributed latest main read or parse errors are logged to the console and do not block the app
- If no distributed-main revision match is found, the extra bottom-bar card is simply omitted

## Styling Notes

- Dark UI theme
- Gray and charcoal panels and cards
- Dark scrollbar styling implemented globally

## Technical Notes

### Zoneless Angular

Configured in `app.config.ts` via:

```ts
provideZonelessChangeDetection();
```

### Signals

Signals are used for key runtime state, including:

- loaded and effective settings state
- browser-local override state
- startup error aggregation
- Jira panel loading and issue state
- TeamCity build state

## Development and Production Commands

### Development

```bash
npm start
```

### Helper Scripts

```bat
start-server.bat
stop-server.bat
```

### Production Build

```bash
npm run build
```

### Production Server

```bash
node serve.js
```

Default production port:

- `4200`

## Testing Status

The test suite currently covers:

- app startup and error overlay behavior
- settings service
- browser settings service
- distributed latest main service
- Jira service
- TeamCity service
- top bar
- Jira panel
- Jira item
- bottom bar
- refresh-button TeamCity reload behavior
- automatic Jira page flipping behavior

Current verified state:

- tests passing
- production build succeeding

## Summary

The current application includes:

- runtime-editable user settings
- browser-local debug setting overrides via cookie
- two Jira-backed issue panels
- configurable left panel width and bottom bar height
- configurable per-panel description visibility
- configurable Jira page size and auto page-flip timing
- Jira filter names in panel headers
- Jira issue type, assignee, and priority data in item headers
- Jira `Summary / Goal` extraction with fallback text
- configurable text scaling via settings and browser-local overrides
- configurable description auto-scroll speed
- TeamCity build status integration in the bottom bar
- TeamCity `main` branch build filtering
- distributed latest main file parsing and TeamCity revision matching
- Swedish-local TeamCity completion time formatting
- startup error display under `Loading...`
- dark themed UI with styled scrollbars
- non-committed Jira and TeamCity auth for local and production use
- batch helpers for starting and stopping the local dev server
