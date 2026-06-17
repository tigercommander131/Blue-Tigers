# HANDOFF — indigo-sim-debrief

Repo: https://github.com/tigercommander131/indigo-sim-debrief (private)
Run: `npm install` then `npm run dev` → http://localhost:5173 (launch.json name `indigo` = port 5174)
Test: `npm test` (6 passing) · Build: `npm run build` (clean)

## CHANGED (2026-06-17)
- Built full prototype from scratch. React 19 + TS + Vite + Vitest.
- 3-layer architecture: source events (`src/data`), calculated facts (`src/lib/metrics.ts`),
  simulated AI (`src/lib/aiDebrief.ts`). AI only rephrases facts — cannot invent a number.
- Playback scrubber (`hooks/usePlayback.ts`) drives shared `currentTime`; timeline + AI moments
  click-to-seek. Instructor notes pinned to timestamp, persisted via `hooks/useNotes.ts` (localStorage).
- README has the deterministic-vs-AI-in-production table (the graded bit).

## PENDING
- Optional: add `docs/overview.png` screenshot (README references none now — clean).
- HANDOFF.md is untracked — commit if you want it in the repo.

## BUGS
- None known. No console errors. All verification passed (play, seek, notes-persist).
