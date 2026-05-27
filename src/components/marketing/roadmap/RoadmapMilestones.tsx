import type { RoadmapMilestone } from "./data";

type Props = {
  milestones: RoadmapMilestone[];
};

/**
 * Vertical release-milestone timeline that sits below the kanban.
 *
 * Each node has a dot (reached = green, current = blue ring, planned =
 * empty cream) and a small block with version label, title, description,
 * and feature chips.
 */
export function RoadmapMilestones({ milestones }: Props) {
  return (
    <section className="rm-ms-section">
      <div className="rm-ms-head">
        <h2>Release Milestones</h2>
        <p>How we think about the next three months of development.</p>
      </div>

      <div className="rm-ms-tl">
        {milestones.map((m) => {
          const stateClass =
            m.state === "reached"
              ? "reached"
              : m.state === "current"
                ? "current"
                : "";
          return (
            <div
              className={`rm-ms-node ${stateClass}`.trim()}
              key={m.version}
            >
              <div className="rm-ms-lbl">
                {m.version}   {m.date} · {m.status}
              </div>
              <div className="rm-ms-title">{m.title}</div>
              <div className="rm-ms-desc">{m.description}</div>
              {m.chips.length > 0 && (
                <div className="rm-ms-chips">
                  {m.chips.map((chip) => (
                    <span className="rm-ms-chip" key={chip}>
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
