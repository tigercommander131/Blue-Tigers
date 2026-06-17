# Simulation Debrief — a "flight recorder" for healthcare simulation

A prototype tool that helps an instructor review a completed simulation session.
It takes the structured event stream from the simulator (timestamps + event
types — no video, audio, or images) and turns it into something you can actually
debrief from.

The sample session is an **ACLS cardiac arrest** (VF → CPR → shock → adrenaline → ROSC).

## Overall approach

The whole design hangs on one idea from the brief: **clearly separate what was
recorded, what was calculated, and what a machine suggested.** In a clinical
setting that distinction is a safety property — an instructor (and ultimately a
clinician) needs to know which numbers they can trust and which are just
prompts to think about. So the app is built as three explicit layers, each with
its own visual treatment and a permanent on-screen legend:

| Layer | What it is | Where it lives | Colour |
|-------|-----------|----------------|--------|
| **1 · Source events** | Raw events straight from the simulator. Never altered. | `src/data/` | slate |
| **2 · Calculated facts** | Deterministic metrics derived purely from timestamps (time to CPR, time to first shock, time to ROSC, pre-CPR no-flow…). Each one shows its clinical target, a pass/warn status, and **which source events it was derived from**. | `src/lib/metrics.ts` | teal |
| **3 · AI suggestions** | A debrief summary, suggested discussion points, and "moments worth reviewing." Fenced off behind a *Simulated AI* badge and disclaimer. | `src/lib/aiDebrief.ts` | amber |

On top of that sits a **playback scrubber**: a single `currentTime` cursor that
the timeline, the clock, and the markers all react to. Press play and the events
light up in real time; click any event — or any AI "review moment" — to jump the
playhead there. Instructors can also leave **notes pinned to a timestamp**, saved
to `localStorage` so they survive a refresh.

### Why the "AI" can't lie about a number
The simulated AI layer only ever *phrases and prioritises* the Layer-2 facts —
it never computes its own metrics. That mirrors how I'd constrain a real LLM in
production: give it the deterministic facts and let it write prose, so it can't
hallucinate a clinical value.

## Deterministic vs AI-assisted in production

| Should stay deterministic (always) | Could be AI-assisted (in production) |
|---|---|
| Event ingestion & ordering | The narrative debrief summary |
| All time calculations & metric values | Which discussion points to surface, and their wording |
| Target / threshold pass-fail logic | Spotting anomalies across many signals (CPR quality, vitals, comms) |
| Anything a clinician acts on numerically | Synthesising free-text instructor notes into themes |

Rule of thumb: **numbers are computed, language is generated.** The prototype's
`generateDebrief()` already has the exact shape a real model call would slot
into — swap the rule engine for an LLM behind the same interface and nothing
else changes.

## Technologies
- **React 19 + TypeScript + Vite**
- **Vitest** for unit tests on the deterministic metrics layer
- No UI/runtime dependencies beyond React — icons are hand-rolled inline SVG,
  styling is plain CSS with a small design-token system.

## AI tools used
Built with **Claude Code (Claude Opus)** — used for scaffolding, the metrics/AI
logic, the React components, and driving the in-browser verification.

## Assumptions
- One scenario (the brief's exact `SIM001` payload), loaded statically. The
  data shape is the seam where a file upload / live feed would plug in.
- Single instructor, single session, reviewed after the fact.
- The clinical targets (e.g. "CPR < 10s") are illustrative references for the
  prototype, not a validated clinical ruleset.
- Notes persist locally only (no backend).
- Time budget was ~1–2 hrs; I spent a little over that to include the scrubber
  and notes, since they're the most demonstrable parts.

## If I had another day
- **Real data in:** drag-and-drop / paste a session JSON, or subscribe to a live
  session feed; support multiple scenario types (not just cardiac arrest).
- **Real AI behind the same interface:** a Claude API call that receives the
  calculated facts and returns the debrief — keeping numbers deterministic.
- **The future streams the brief lists:** CPR quality, simulator vitals,
  communication frequency, participant movement — overlaid on the same timeline.
- **Export:** generate a shareable PDF debrief from the session.
- **Tests:** extend coverage to the AI rule engine and add a component test for
  the scrubber.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # deterministic metrics tests
npm run build    # type-check + production build
```

## Project map
```
src/
  data/        types.ts (the 3 layers, typed) · sampleSession.ts (source data)
  lib/         metrics.ts (Layer 2, pure) · aiDebrief.ts (Layer 3, simulated)
               metrics.test.ts · format.ts
  hooks/       usePlayback.ts (the cursor) · useNotes.ts (localStorage)
  components/  Header · Legend · Playback · Timeline · MetricsPanel
               AiDebriefPanel · NotesPanel · icons · eventMeta
```
