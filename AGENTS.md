# AGENTS.md

## Workflow

Before making any code, config, test, or documentation changes in this repository, always read `status.md`.

After completing any change, always update `status.md`.

## Purpose Of status.md

`status.md` is the short operational memory for this project.

It should capture:

- general project status
- current issues
- known workarounds
- recent important changes
- anything the next contributor should know before editing

## Required Process

1. Read `status.md` before making changes.
2. Make the requested change.
3. Run relevant verification when applicable.
4. Update `status.md` after the change.

## Testing Expectations

- Write tests for every new feature.
- Write tests for bug fixes.
- Update tests when existing behavior is intentionally changed.
- Add tests when new runtime settings are introduced.
- Add tests when UI rendering changes in a meaningful way.
- Add tests when service request or response handling changes.
- Add tests when timers, refresh logic, paging, or auto-scroll behavior changes.
- If a change adds or changes logic in a component or service, default to adding or updating a test.
- If a bug is fixed, add a regression test for that bug when practical.
- Small cosmetic CSS-only changes usually do not need a new test unless they change behavior.
- Always run tests after every build and reflect on any failures before considering the change complete.

## status.md Rules

- Keep it concise and practical.
- Prefer short bullet lists.
- Remove stale information.
- Do not turn it into a long changelog.
- Keep it under roughly 150 lines.

## If status.md Is Missing

Create it first, then continue working.
