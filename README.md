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
| **1 · Source events** | Raw events straight from the simulator. Never altered. Each carries a stable `code` so logic never depends on the display text. | `src/data/` | slate |
| **2 · Calculated facts** | Deterministic metrics derived purely from event timestamps (time to CPR, time to defibrillation, CPR→shock, downtime…). Each shows its clinical target, a pass/warn status, the delta vs target, and **which source events it was derived from**. Also drives the outcome hero and timeline phases. | `src/lib/metrics.ts`, `src/lib/summary.ts` | teal |
| **3 · AI suggestions** | A debrief summary, suggested discussion points, and "moments worth reviewing." Fenced off behind a *Simulated · review before use* badge. | `src/lib/aiDebrief.ts` | amber |

The screen opens with an **outcome hero** — ROSC achieved / no ROSC, the headline
times (downtime, time-to-CPR, time-to-defib), and an ACLS *targets-met* score — so
an instructor knows the result before scanning a single card. The **calculated
facts** carry a compliance summary and, per card, a status word and the exact
delta vs the clinical target (e.g. `+0:07 over`).

On top of that sits a **playback scrubber**: a single `currentTime` cursor that
the timeline, the clock, and the markers all react to. The **timeline is grouped
into clinical phases** (pre-arrest → resuscitation → post-ROSC), shaded so the
shape of the case is visible at a glance. Press play and the events light up in
real time; click any event — or any AI "review moment" — to jump the playhead
there. Instructors can leave **notes pinned to a timestamp** (saved to
`localStorage`), switch a **light/dark clinical theme**, and **print** a clean
one-page debrief sheet (`@media print`).

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
- **Vitest** for unit tests on the deterministic layer (metrics, summary, phases,
  and that the AI uses real event times)
- No UI/runtime dependencies beyond React — icons are hand-rolled inline SVG;
  styling is plain CSS with light/dark design tokens.

## Robustness
The deterministic layer is hardened against messy input: events are sorted before
any calculation (no negative intervals), all lookups key off the stable `code`
(a renamed event can't silently drop a metric), missing events degrade gracefully
rather than crash, the AI narrative only asserts what the events support, and
notes from `localStorage` are shape-validated on load with a `crypto.randomUUID`
fallback for non-secure contexts. Keyboard focus is visible throughout and the
scrubber announces `mm:ss` to screen readers.

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
