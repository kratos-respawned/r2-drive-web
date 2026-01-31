# Global File Upload Manager — Requirements & Architecture

## Goal

Build a **global, route-independent file upload system** similar to Google Drive that:

- Allows selecting files from **any page**
- Supports **multiple parallel uploads**
- Keeps uploads running while navigating between routes
- Shows **global upload progress**
- Supports **cancel / retry**
- Is **type-safe** and **event-driven**
- Uses **XState v5** for workflow logic
- Uses **Zustand** only as a lightweight registry
- Uses **React Query** for file/folder syncing (out of scope for upload logic)

---

## Core Requirements

### Functional

- Users can select one or more files from any route
- File selection dispatches an event to a global upload manager
- Uploads continue even if the initiating component unmounts
- Multiple uploads can run in parallel
- Each upload tracks:
  - progress (0–100)
  - status (pending / uploading / success / error)
  - error message (if any)
- Each upload can be cancelled or retried independently
- Upload completion triggers React Query invalidation

### Non-Functional

- Uploads must not depend on React component lifecycle
- Route changes must not cancel uploads
- Progress updates must not cause global re-renders
- Architecture must scale to many concurrent uploads
- No `any`, no unsafe casts, no ad-hoc state

---

## High-Level Architecture

```text
React App Root (never unmounts)
│
├── UploadManager (XState v5)
│     ├── UploadItem #1 (actor)
│     ├── UploadItem #2 (actor)
│     └── UploadItem #N (actor)
│
├── Zustand Upload Store
│     └── stores ActorRef references only
│
├── Routes (mount / unmount freely)
│
└── Global Upload UI (subscribes to actors)
```

## Responsibilities by Layer

### XState (Behavior / Workflow)

- Owns upload lifecycle
- Handles async upload logic
- Emits progress updates
- Handles cancel / retry
- Enforces valid state transitions
- Uses one machine per file (actor)

### Zustand (Registry Only)

- Stores references to running upload actors
- Provides stable lookup for UI
- Does **NOT** store progress or status
- Does **NOT** contain upload logic

### React Components

- Dispatch events (file selection)
- Subscribe to upload actors
- Render progress UI
- Never create upload machines

---

## Upload Item State Machine

### One machine per file

#### States

- `pending`
- `uploading`
- `success`
- `error`

#### Events

- `START`
- `PROGRESS`
- `CANCEL`
- `RETRY`

#### Guarantees

- Each upload has its own `AbortController`
- Cancellation affects only that upload
- Invalid transitions are impossible at compile time

---

## Upload Manager State Machine

### Purpose

- Global orchestrator
- Spawns upload item machines
- Never owns upload progress
- Never cancels uploads implicitly

### Events

```ts
FILES_SELECTED {
  files: File[]
  parentPath: string
  docType: string
}
```

Behavior
Receives files from any route
Spawns one upload machine per file
Registers actor refs in Zustand
Does not depend on React lifecycle
Zustand Upload Store
Purpose
Global registry of running uploads
Stored Data
Record<string, ActorRefFrom<UploadMachine>>
Explicit Non-Goals
No progress tracking
No upload logic
No side effects
React Integration Rules
Creation vs Consumption
useMachine → create root machines only
spawn → create upload actors
useActor → consume existing actors
Components must never create upload machines
File Selection
Any component may dispatch FILES_SELECTED
Component may unmount immediately afterward
Upload continues independently
Rendering Upload Progress
Global upload panel is always mounted
Panel subscribes to Zustand store
Each upload row subscribes to its own actor
Progress updates re-render only that row
React Query Integration
Upload machines do NOT manage file lists
On upload success:
Invalidate relevant queries
Server state remains authoritative
Performance Characteristics
No global re-render on progress updates
Localized updates via useActor
Upload manager state rarely changes
Scales to many concurrent uploads
Design Principles
Event-driven, not state-driven UI
Long-running processes are global
UI components are disposable
Behavior lives outside React
State ownership is explicit
Explicitly Avoided Anti-Patterns
Upload logic inside components
React state for upload progress
Using Zustand/Jotai for async workflows
Cancelling uploads on route change
Storing upload progress globally
Summary
This architecture provides:
Google Drive–like upload behavior
Strong correctness guarantees
Predictable lifecycle management
Excellent performance
Clear separation of concerns
It is designed to grow into:
Upload queues
Concurrency limits
Background uploads
Persistence across reloads
