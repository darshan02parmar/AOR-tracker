import { FaBolt, FaBullseye, FaChartBar, FaSync } from "react-icons/fa";

const HIST = [
  { h: 12, op: 0.65, bg: "var(--blue)", lb: "148" },
  { h: 20, op: 0.7, bg: "var(--blue)", lb: "160" },
  { h: 30, op: 0.75, bg: "var(--blue)", lb: "180" },
  { h: 46, op: 0.82, bg: "var(--blue)", lb: "200" },
  { h: 60, op: 1, bg: "var(--green)", lb: "220" },
  { h: 54, op: 0.9, bg: "var(--green)", lb: "241" },
  { h: 42, op: 1, bg: "var(--amber)", lb: "247", you: true, lbBold: true },
  { h: 32, op: 0.75, bg: "var(--amber)", lb: "260" },
  { h: 20, op: 0.6, bg: "var(--amber)", lb: "280" },
  { h: 12, op: 0.55, bg: "var(--red)", lb: "300+" },
];

export function LandingCohortSection() {
  return (
    <section className="cohort-section" id="cohort">
      <div className="cohort-inner">
        <div className="cohort-text">
          <p className="section-eye reveal" style={{ color: "rgba(255,255,255,.3)" }}>
            Cohort Analytics
          </p>
          <h2 className="section-h2 reveal" style={{ color: "#fff" }}>
            See exactly where you sit
            <br />
            <em style={{ fontStyle: "italic", color: "#4ade80" }}>in your cohort.</em>
          </h2>
          <p className="section-sub reveal" style={{ color: "rgba(255,255,255,.5)" }}>
            Don&apos;t just know your day count. Understand your position in the full distribution  
            who&apos;s ahead, who&apos;s behind, and what the real processing curve looks like for your
            stream and month.
          </p>
          <div className="cohort-points reveal">
            <div className="cp">
              <div className="cp-icon cp-icon--g">
                <FaChartBar size={16} aria-hidden />
              </div>
              <div className="cp-body">
                <div className="cp-title">Processing day histogram</div>
                <div className="cp-desc">
                  See the full bell curve of when people in your cohort got PPR. Spot the peak window
                  and understand where you fall on the distribution.
                </div>
              </div>
            </div>
            <div className="cp">
              <div className="cp-icon cp-icon--a">
                <FaBullseye size={16} aria-hidden />
              </div>
              <div className="cp-body">
                <div className="cp-title">Your percentile rank   visualised</div>
                <div className="cp-desc">
                  A colour-coded gradient bar from fastest to slowest, with your marker pinned to your
                  exact position. &quot;Top 28%&quot; becomes something you can see.
                </div>
              </div>
            </div>
            <div className="cp">
              <div className="cp-icon cp-icon--b">
                <FaBolt size={16} aria-hidden />
              </div>
              <div className="cp-body">
                <div className="cp-title">Stream-by-stream comparison</div>
                <div className="cp-desc">
                  How does CEC compare to FSW, PNP, and FST right now? See average processing days and
                  PPR completion rates side by side.
                </div>
              </div>
            </div>
            <div className="cp">
              <div className="cp-icon cp-icon--p">
                <FaSync size={16} aria-hidden />
              </div>
              <div className="cp-body">
                <div className="cp-title">Live KPIs   updated as data arrives</div>
                <div className="cp-desc">
                  Median PPR day, fastest PPR, cohort % complete, and your rank all update in real time
                  as community members log new milestones.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="cohort-card reveal">
          <div className="cc-nav">
            <span className="cc-nav-title">Cohort Deep Dive   CEC · Jan 2024</span>
            <span className="cc-tag cc-tag-cec">CEC</span>
            <span className="cc-tag cc-tag-cnt">14,847</span>
          </div>
          <div className="cc-body">
            <div className="cc-kpis">
              <div className="cc-kpi">
                <div className="cc-kval g">241</div>
                <div className="cc-klbl">Median PPR</div>
              </div>
              <div className="cc-kpi">
                <div className="cc-kval">148</div>
                <div className="cc-klbl">Fastest PPR</div>
              </div>
              <div className="cc-kpi">
                <div className="cc-kval a">39%</div>
                <div className="cc-klbl">PPR&apos;d</div>
              </div>
              <div className="cc-kpi">
                <div className="cc-kval a">Top 28%</div>
                <div className="cc-klbl">Your Rank</div>
              </div>
            </div>
            <div>
              <div className="cc-chart-hd">
                <strong>Processing day distribution</strong>
                <span>Jan 2024 · PPR&apos;d applicants</span>
              </div>
              <div className="cc-hist">
                {HIST.map((b) => (
                  <div key={b.lb} className="cc-hcol">
                    <div
                      className={`cc-hbar${b.you ? " you" : ""}`}
                      style={{
                        height: b.h,
                        background: b.bg,
                        opacity: b.op,
                      }}
                    />
                    <div
                      className="cc-hlbl"
                      style={
                        b.lbBold
                          ? { color: "var(--red)", fontWeight: 700 }
                          : undefined
                      }
                    >
                      {b.lb}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="cc-pct">
              <div className="cc-pct-hd">
                <span className="cc-pct-title">Your Percentile Rank   Jan 2024 Cohort</span>
                <span className="cc-pct-badge">Top 28%</span>
              </div>
              <div className="cc-rank-bar">
                <div className="cc-rank-dot" />
              </div>
              <div className="cc-rank-lbls">
                <span>Fastest</span>
                <span>Median (Day 241)</span>
                <span>Slowest</span>
              </div>
            </div>
            <div className="cc-compare">
              <div className="cc-cmp active">
                <div className="cc-cmp-dot" style={{ background: "var(--green)" }} />
                <div className="cc-cmp-info">
                  <div className="cc-cmp-name">CEC ← You</div>
                  <div className="cc-cmp-days">Avg 241 days</div>
                  <div className="cc-cmp-bar">
                    <div
                      className="cc-cmp-fill"
                      style={{ width: "76%", background: "var(--green)" }}
                    />
                  </div>
                </div>
              </div>
              <div className="cc-cmp">
                <div className="cc-cmp-dot" style={{ background: "var(--blue)" }} />
                <div className="cc-cmp-info">
                  <div className="cc-cmp-name">FSW</div>
                  <div className="cc-cmp-days">Avg 267 days</div>
                  <div className="cc-cmp-bar">
                    <div
                      className="cc-cmp-fill"
                      style={{ width: "60%", background: "var(--blue)" }}
                    />
                  </div>
                </div>
              </div>
              <div className="cc-cmp">
                <div className="cc-cmp-dot" style={{ background: "var(--amber)" }} />
                <div className="cc-cmp-info">
                  <div className="cc-cmp-name">PNP</div>
                  <div className="cc-cmp-days">Avg 312 days</div>
                  <div className="cc-cmp-bar">
                    <div
                      className="cc-cmp-fill"
                      style={{ width: "40%", background: "var(--amber)" }}
                    />
                  </div>
                </div>
              </div>
              <div className="cc-cmp">
                <div className="cc-cmp-dot" style={{ background: "var(--purple)" }} />
                <div className="cc-cmp-info">
                  <div className="cc-cmp-name">FST</div>
                  <div className="cc-cmp-days">Avg 284 days</div>
                  <div className="cc-cmp-bar">
                    <div
                      className="cc-cmp-fill"
                      style={{ width: "52%", background: "var(--purple)" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
