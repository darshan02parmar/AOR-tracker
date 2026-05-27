"use client";

import { IconCheck } from "./track-icons";

type Props = {
  /** 1, 2, or 3   the currently-active step. */
  current: 1 | 2 | 3;
};

const NODES: { id: 1 | 2 | 3; label: string }[] = [
  { id: 1, label: "Application" },
  { id: 2, label: "Milestones" },
  { id: 3, label: "Review" },
];

const PROGRESS_PCT: Record<1 | 2 | 3, number> = { 1: 33, 2: 66, 3: 100 };

/**
 * Top progress bar + 3 step nodes. Owned by the orchestrator   receives
 * `current` and renders the cosmetic state (active / done / future).
 */
export function TrackStepsNav({ current }: Props) {
  return (
    <>
      <div className="tk-progress" aria-hidden="true">
        <div
          className="tk-progress-fill"
          style={{ width: `${PROGRESS_PCT[current]}%` }}
        />
      </div>

      <ol
        className="tk-steps"
        aria-label={`Step ${current} of 3`}
      >
        {NODES.map((n) => {
          const state =
            n.id < current ? "done" : n.id === current ? "active" : "";
          return (
            <li
              key={n.id}
              className={`tk-node ${state}`.trim()}
              aria-current={n.id === current ? "step" : undefined}
            >
              <div className="tk-node-circle">
                {n.id < current ? <IconCheck aria-hidden /> : n.id}
              </div>
              <div className="tk-node-label">{n.label}</div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
