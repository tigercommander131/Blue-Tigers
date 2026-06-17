# HANDOFF — indigo-sim-debrief

Repo: https://github.com/tigercommander131/indigo-sim-debrief (private)
Run: `npm install` then `npm run dev` → http://localhost:5173 (launch.json name `indigo` = port 5174)
Test: `npm test` (12 passing) · Build: `npm run build` (clean)

## Architecture
- 3 layers, visually distinct + always-on legend:
  1. Source events — `src/data/` (typed, each event has a stable `code`).
  2. Calculated facts — `src/lib/metrics.ts` (pure) + `src/lib/summary.ts` (hero/outcome/phases).
  3. Simulated AI — `src/lib/aiDebrief.ts` (rule engine; only rephrases facts, real event times).
- State hooks: `usePlayback` (shared currentTime cursor), `useNotes` (localStorage + validation),
  `useTheme` (light default / dark, persisted).
- UI in `src/components/`: Header, Hero (outcome+KPI+targets score), Legend, Playback scrubber,
  Timeline (phase-grouped), MetricsPanel (status word + delta + compliance), AiDebriefPanel, NotesPanel.

## CHANGED — polish pass (2026-06-17, commit 0dc5dd4)
- Logic hardening: stable event codes + shared lookup; sort events (no negative gaps); fixed
  hardcoded ROSC clock offset (now reads the real event time); ROSC status no longer hardcoded
  'good'; div-by-zero guard in scrubber; uuid fallback; notes shape-validation; AI narrative
  gated on actual events.
- Clinical UI: light theme default + dark toggle; outcome hero w/ ACLS targets-met score;
  timeline grouped into shaded phases (pre-arrest/resuscitation/post-ROSC); metric cards with
  status word + delta-vs-target + compliance bar; AI panel reframed (no gradient); m:ss
  formatting everywhere; print/export stylesheet (`@media print`).
- A11y: global focus-visible, scrubber aria-valuetext, aria-pressed/aria-current, textarea label,
  overflow guards, higher-contrast playhead.
- Tests 6 → 12 (metrics, summary, phases, out-of-order ordering, AI uses real times).

## VERIFIED
Build clean · 12/12 tests · light+dark render · play advances · click-to-seek (timeline + AI) ·
notes persist across reload · mobile 375px no horizontal overflow.

## PENDING / NEXT
- Optional `docs/overview.png` for the README.
- Future: file-upload/live session, real Claude API behind `generateDebrief()`, the future data
  streams (CPR quality, vitals, comms, movement).

## BUGS
- None known. (Stale `mmss` errors in the Vite HMR console buffer are historical — from mid-edit;
  production build compiles clean and app renders/interacts fully.)
