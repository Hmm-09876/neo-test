# Edge Cases Handling - Interview Recording System

## Network Interruption Mid-Recording

* **Chunked Recording**
  * Record/capture data in small chunks (e.g., 30–120 seconds) and **save locally** immediately.
  * When network is lost, display clear notification and allow **retry connection**; when reconnected, automatically upload saved chunks.
  * Mark interruption timestamps in logs and inform user which parts might be missing; allow **resume recording from interruption point** to avoid re-recording the entire session.

## Late-Joining Participants

* **Late Entry Handling**
  * Start recording immediately when they join and assign **"late entry" tag + timestamp**.
  * Automatically save a **2–3 sentence summary** of what they missed (use existing transcript to extract key points).
  * In UI, show "late entry" badge on timeline, and allow separate export of pre/post-join segments.

## Multiple People Speaking Simultaneously

* **Multi-Channel Recording**
  * When possible, use **multi-channel recording** (one mic per channel) — easiest for voice separation. If only single channel available, enable **speaker diarization** to attempt speaker differentiation.
  * When system detects overlapping speech, **mark as "overlap"** and record confidence level. In editor, allow users to focus on overlapping sections and **manually assign** who said what if model is incorrect.
  * If voice separation fails, provide simulated "multi-track" mode: display overlapping segments and allow cutting/marking for quick editing.

## Efficient Long Interview Processing

* **Chunking Strategy**
  * Split large files into small segments (1–5 minutes) for parallel processing (transcribe → summarize → index).
  * Implement **streaming transcription**: gradually return transcript and summary for each chunk so users get quick results without waiting for entire file.
  * Save topic/timestamp index for easy searching (e.g., tag "question X", "conclusion"), and create a **final comprehensive summary** by combining chunk summaries.
  * Cost optimization: use lightweight model for real-time + stronger model when high quality needed (batch post-processing).