# CGTShowcase - Current Application Overview

## Overview

CGTShowcase is an Angular 21 standalone TypeScript application intended for Windows TV/browser display use. It loads Jira issues from two configured Jira filters, renders them in two scrollable columns, and shows TeamCity build statuses in the bottom bar.

This document describes the current implemented application.

## Current Stack

- Angular 21 standalone application
- TypeScript
- Zoneless change detection via `provideZonelessChangeDetection()`
- Angular build system via `@angular/build`
- Unit tests via Vitest
- Windows-friendly local/prod runtime with Node.js

## Runtime Model

### Development

- `ng serve`
- Jira requests go through `proxy.conf.json`

### Production

- `node serve.js`
- `serve.js` serves the built Angular files and proxies Jira API requests

### Jira Auth

- Browser code calls `/jira-api/*`
- Jira credentials are not committed
- Production auth comes from either:
  - local ignored `jira-auth.json`
  - `JIRA_EMAIL` and `JIRA_TOKEN` environment variables
- `jira-auth.example.json` is the tracked template

### TeamCity Auth

- Browser code calls `/teamcity-api/*`
- TeamCity credentials are not committed
- Production auth comes from either:
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
│   │   │   └── user-settings.model.ts
│   │   ├── services/
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
├── proxy.conf.json
├── serve.js
├── teamcity-auth.example.json
└── status.md
```

## Current User Settings

`public/UserSettings.json` is runtime-editable and does not require a rebuild.

Current shape:

```json
{
  "showDebugBar": true,
  "leftPanelFilterId": "18046",
  "rightPanelFilterId": "18048",
  "descriptionAutoScrollPixelsPerSecond": 10,
  "textSizeMultiplier": 1,
  "teamCityBuildTypeIds": ["Live_DarktideEngineGameStingrayEngineEditorAndToolsComposite"]
}
```

Fields:

- `showDebugBar`: show or hide the top debug bar
- `leftPanelFilterId`: Jira filter for the left panel
- `rightPanelFilterId`: Jira filter for the right panel
- `descriptionAutoScrollPixelsPerSecond`: description scroll speed in pixels per second
- `textSizeMultiplier`: multiplies UI text sizes globally
- `teamCityBuildTypeIds`: TeamCity build type IDs to show in the bottom bar

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
- `description`
- `duedate`

Used Jira data in the UI:

- filter name
- issue type icon
- issue key
- status
- summary
- description

### Two Jira Panels

- Implemented
- Left and right panels use separate filter IDs from `UserSettings.json`
- Each panel loads independently

### Automatic Initial Load

- Implemented
- On startup:
  1. load `UserSettings.json`
  2. render the app layout
  3. each panel loads Jira data automatically

### Refresh Button

- Implemented in the top bar
- Reloads both Jira panels

### TeamCity Build Status

- Implemented in `teamcity.service.ts`
- Bottom bar renders TeamCity build status cards for configured build type IDs
- Current returned fields:
  - `id`
  - `number`
  - `status`
  - `statusText`
  - `buildTypeId`
  - `finishDate`

## Current UI Layout

### Top Bar (A)

- Optional via `showDebugBar`
- Contains debug label and refresh button

### Left Panel (B)

- Scrollable list of Jira issues from the left filter

### Right Panel (C)

- Scrollable list of Jira issues from the right filter

### Bottom Bar (D)

- TeamCity build status area

## Current Panel Header Layout

Each panel header shows:

- bold filter name
- non-bold filter id in parentheses

Example:

```text
My Filter (18046)
```

## Current Jira Item Layout

Each Jira item has 3 visual sections:

### Row 1

- issue type icon
- issue key
- status

### Row 2

- summary

### Row 3

- vertically scrolling description area

## Current Description Auto-Scroll Behavior

Descriptions currently:

- scroll at a consistent speed based on `descriptionAutoScrollPixelsPerSecond`
- use native `scrollTop`
- pause 2 seconds at the bottom
- jump back to the top
- pause 1 second at the top
- continue scrolling again

## Current Text Scaling Behavior

Text scaling is driven by `textSizeMultiplier` in `UserSettings.json`.

This multiplier is applied through a shared CSS variable and affects visible text in:

- loading screen
- top bar
- panel headers
- panel status/error/empty text
- Jira item content
- bottom bar

## Error Handling Behavior

### Startup Loading Screen

If startup loading fails, the loading screen stays visible and shows errors in red under `Loading...`.

This covers:

- settings load failures
- Jira panel initial load failures
- missing or inaccessible Jira filters

Example:

```text
Loading...
[18046] Failed to load issues: ...
[18048] Failed to load issues: ...
```

### Panel-Level Errors

Each Jira panel also shows its own error message when its Jira load fails.

## Styling Notes

### Theme

- Dark UI theme
- Gray/charcoal panels and cards

### Scrollbars

- Dark scrollbar styling is implemented globally
- Covers Chromium/WebKit and Firefox

## Technical Notes

### Zoneless Angular

The app uses zoneless Angular runtime behavior.

Configured in `app.config.ts` via:

```ts
provideZonelessChangeDetection();
```

### Signals

Signals are used for key runtime state, including:

- loaded/settings state
- startup error aggregation
- Jira panel loading and issue state

## Development and Production Commands

### Development

```bash
npm start
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
- Jira service
- Jenkins stub service
- top bar
- Jira panel
- Jira item
- bottom bar

Current verified state:

- tests passing
- production build succeeding

## Summary

The current application includes:

- runtime-editable user settings
- two Jira-backed issue panels
- Jira filter names in panel headers
- Jira issue type icons in item headers
- configurable text scaling via user settings
- configurable description auto-scroll speed
- TeamCity build status integration in the bottom bar
- startup error display under `Loading...`
- dark themed UI with styled scrollbars
- non-committed Jira and TeamCity auth for local/prod use
