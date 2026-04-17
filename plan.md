# CGTShowcase - Current Solution Overview

## Overview

CGTShowcase is an Angular 21 standalone TypeScript application intended for Windows TV display use in a browser. It loads Jira issues from two configured Jira filters, displays them in two side-by-side scrollable panels, and includes a stubbed Jenkins area for future build status integration.

This file describes the current implemented solution, not the original proposal.

## Current Architecture

### Frontend

- Angular 21 standalone application
- TypeScript
- Built with `@angular/build`
- Unit tests run with Vitest
- Uses explicit zoneless change detection via `provideZonelessChangeDetection()`

### Runtime / Hosting

- Development: `ng serve` with `proxy.conf.json`
- Production: `serve.js` serves the built app and proxies Jira API requests
- Designed to run on Windows with Node.js installed

### Jira Connectivity

- Browser code calls `/jira-api/...`
- Dev and production both proxy `/jira-api/*` to:
  - `https://fatshark.atlassian.net/rest/api/3/*`
- Jira credentials remain outside browser code

## Current Project Structure

```text
CGTShowcase/
├── public/
│   └── UserSettings.json              # Runtime-editable config
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   ├── jira.models.ts
│   │   │   └── user-settings.model.ts
│   │   ├── services/
│   │   │   ├── jira.service.ts
│   │   │   ├── jira.service.spec.ts
│   │   │   ├── jenkins.service.ts
│   │   │   ├── jenkins.service.spec.ts
│   │   │   ├── settings.service.ts
│   │   │   └── settings.service.spec.ts
│   │   ├── components/
│   │   │   ├── top-bar/
│   │   │   ├── jira-panel/
│   │   │   ├── jira-item/
│   │   │   └── bottom-bar/
│   │   ├── app.ts
│   │   ├── app.html
│   │   ├── app.css
│   │   ├── app.spec.ts
│   │   └── app.config.ts
│   ├── main.ts
│   ├── styles.css
│   └── index.html
├── proxy.conf.json
├── serve.js
├── plan.md
└── .gitignore
```

## Current User Settings

`public/UserSettings.json` is loaded at runtime and can be edited without rebuilding.

Current content:

```json
{
  "showDebugBar": true,
  "leftPanelFilterId": "18046",
  "rightPanelFilterId": "18048"
}
```

Fields:

- `showDebugBar`: shows or hides the top debug bar
- `leftPanelFilterId`: Jira filter for left panel
- `rightPanelFilterId`: Jira filter for right panel

## Current Implemented Features

### 1. Settings File

- Implemented as `public/UserSettings.json`
- Loaded by `SettingsService`
- Runtime-editable

### 2. Jira Filter Search

- Implemented in `jira.service.ts`
- Based on the provided `getFilterResults()` pattern
- Flow:
  1. request filter details from `/jira-api/filter/{filterId}`
  2. read the returned JQL and filter name
  3. request issue results from `/jira-api/search/jql?...`

Requested Jira fields:

- `summary`
- `status`
- `issuetype`
- `description`
- `duedate`

The current UI uses:

- filter name
- issue type icon
- issue key
- status
- summary
- description

### 3. Two Jira Panels

- Implemented
- Left and right panels each use a separate filter ID from `UserSettings.json`
- Each panel loads independently

### 4. Automatic Initial Load

- Implemented
- On startup:
  1. app loads `UserSettings.json`
  2. renders the two Jira panels
  3. each panel loads its Jira filter results automatically

### 5. Refresh Button

- Implemented in top bar
- Calls `loadIssues()` on both panels

### 6. Jenkins Stub

- Implemented as a stub service
- Bottom bar remains a placeholder for now

## Current UI Layout

### Top Bar (A)

- Optional via `showDebugBar`
- Contains debug label and `Refresh` button

### Left Panel (B)

- Scrollable list of Jira items from left filter

### Right Panel (C)

- Scrollable list of Jira items from right filter

### Bottom Bar (D)

- Placeholder Jenkins area

## Current Jira Item Layout

Each Jira item has 3 sections:

### Row 1

- issue type icon
- issue key
- status

### Row 2

- summary

### Row 3

- scrollable description text area

## Current Panel Header Layout

Each panel header now shows:

- bold filter name
- non-bold filter id in parentheses

Example:

```text
My Filter (18046)
```

## Error Handling Behavior

### Startup / Loading Screen

If startup loading fails, the app now keeps the loading screen visible and shows load errors in red underneath `Loading...`.

This covers:

- settings file load failures
- Jira filter failures during initial panel load
- invalid or inaccessible Jira filter IDs

Example style of messages:

```text
Loading...
[18046] Failed to load issues: ...
[18048] Failed to load issues: ...
```

### Panel-Level Errors

Each Jira panel also shows its own error inside the panel content area if a load fails.

## Styling Notes

### Scrollbars

- Global dark scrollbar styling is implemented
- Matches the dark application theme
- Covers Chromium/WebKit and Firefox

### Theme

- Dark UI throughout
- Panels and cards use gray/charcoal backgrounds

## Current Technical Notes

### Zoneless Change Detection

This app does not use `zone.js`.

To ensure async UI updates work correctly, `app.config.ts` explicitly uses:

```ts
provideZonelessChangeDetection();
```

### Signals

Runtime UI state uses Angular signals in key places, including:

- app settings/loading state
- panel issues/loading/error state
- startup error aggregation

## Development and Production Execution

### Development

```bash
npm start
```

Uses:

- Angular dev server
- `proxy.conf.json`

### Production Build

```bash
npm run build
```

### Production Serve

```bash
node serve.js
```

Default production port:

- `4200`

## Dependencies

Current package dependencies remain minimal.

Main runtime dependencies:

- `@angular/common`
- `@angular/compiler`
- `@angular/core`
- `@angular/forms`
- `@angular/platform-browser`
- `@angular/router`
- `rxjs`
- `tslib`

Main dev dependencies:

- `@angular/build`
- `@angular/cli`
- `@angular/compiler-cli`
- `typescript`
- `vitest`
- `jsdom`
- `prettier`

## Current Test Status

The project includes unit tests for:

- app bootstrap and startup error behavior
- settings service
- Jira service
- Jenkins stub service
- top bar
- Jira panel
- Jira item
- bottom bar

Recent verified state:

- tests passing
- production build succeeding

## Summary

The current solution now includes:

- runtime-editable `UserSettings.json`
- two Jira-backed panels
- Jira filter names in panel headers
- issue type icons in Jira item top rows
- startup loading error display in red under `Loading...`
- dark scrollbar styling
- zoneless Angular runtime configured correctly
- Jenkins placeholder service and UI area
