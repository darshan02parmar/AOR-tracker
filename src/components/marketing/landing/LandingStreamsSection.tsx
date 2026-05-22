import Link from "next/link";
import { FaGraduationCap } from "react-icons/fa";
import { MdWaves } from "react-icons/md";
import {
  IconArrowRight,
  IconGlobe,
  IconMaple,
  IconMountain,
  IconPlus,
} from "@/components/marketing/landing-icons";

export function LandingStreamsSection() {
  return (
    <section className="section mkt-streams-section" id="streams">
      <div className="inner">
        <p className="section-eye reveal">Immigration Streams</p>
        <h2 className="section-h2 reveal">Track any Canadian PR pathway.</h2>
        <p className="section-sub reveal">
          Community data across all major Express Entry and provincial streams — updated in real time
          as applicants log milestones.
        </p>
        <div className="stream-grid">
          <Link href="/streams/cec" className="stream-card featured reveal">
            <div className="sc-head green-bg">
              <div>
                <div className="sc-title">CEC — Canadian Experience Class</div>
                <div className="sc-sub">General &amp; STEM streams</div>
              </div>
              <span className="sc-icon">
                <IconMaple size={22} aria-hidden />
              </span>
            </div>
            <div className="sc-body">
              <div className="sc-avg">
                Avg processing <strong>241</strong> days
              </div>
              <div className="sc-bar">
                <div className="sc-bar-fill" style={{ width: "76%" }} />
              </div>
              <div className="sc-facts">
                <div className="sc-fact"><IconArrowRight size={11} aria-hidden />{" "}Largest tracked Express Entry cohorts</div>
                <div className="sc-fact"><IconArrowRight size={11} aria-hidden />{" "}Cohort progress and P25–P75 windows</div>
                <div className="sc-fact"><IconArrowRight size={11} aria-hidden />{" "}Fastest PPR: Day 148 (illustrative)</div>
              </div>
            </div>
          </Link>

          <Link href="/streams/fsw" className="stream-card reveal">
            <div className="sc-head navy-bg">
              <div>
                <div className="sc-title">FSW — Federal Skilled Worker</div>
                <div className="sc-sub">International applicants</div>
              </div>
              <span className="sc-icon">
                <IconGlobe size={22} aria-hidden />
              </span>
            </div>
            <div className="sc-body">
              <div className="sc-avg">
                Avg processing <strong>267</strong> days
              </div>
              <div className="sc-bar">
                <div className="sc-bar-fill" style={{ width: "62%" }} />
              </div>
              <div className="sc-facts">
                <div className="sc-fact"><IconArrowRight size={11} aria-hidden />{" "}Applicants tracked across FSW keys</div>
                <div className="sc-fact"><IconArrowRight size={11} aria-hidden />{" "}Slightly longer median than CEC in sample data</div>
                <div className="sc-fact"><IconArrowRight size={11} aria-hidden />{" "}Biometrics typically Day 30–60</div>
              </div>
            </div>
          </Link>

          <Link href="/streams/pnp" className="stream-card reveal">
            <div className="sc-head blue-bg">
              <div>
                <div className="sc-title">PNP — Provincial Nominee</div>
                <div className="sc-sub">Province-backed nominees</div>
              </div>
              <span className="sc-icon">
                <IconMountain size={22} aria-hidden />
              </span>
            </div>
            <div className="sc-body">
              <div className="sc-avg">
                Avg processing <strong>312</strong> days
              </div>
              <div className="sc-bar">
                <div className="sc-bar-fill" style={{ width: "44%" }} />
              </div>
              <div className="sc-facts">
                <div className="sc-fact"><IconArrowRight size={11} aria-hidden />{" "}Higher variance by province</div>
                <div className="sc-fact"><IconArrowRight size={11} aria-hidden />{" "}Longer due to provincial verification</div>
                <div className="sc-fact"><IconArrowRight size={11} aria-hidden />{" "}Compare streams in the tracker</div>
              </div>
            </div>
          </Link>

          <Link href="/streams/fst" className="stream-card reveal">
            <div className="sc-head teal-bg">
              <div>
                <div className="sc-title">FST — Federal Skilled Trades</div>
                <div className="sc-sub">Skilled tradespeople</div>
              </div>
              <span className="sc-icon">
                <FaGraduationCap size={22} aria-hidden />
              </span>
            </div>
            <div className="sc-body">
              <div className="sc-avg">
                Avg processing <strong>284</strong> days
              </div>
              <div className="sc-bar">
                <div className="sc-bar-fill" style={{ width: "54%" }} />
              </div>
              <div className="sc-facts">
                <div className="sc-fact"><IconArrowRight size={11} aria-hidden />{" "}Medicals typically requested Day 90–140</div>
                <div className="sc-fact"><IconArrowRight size={11} aria-hidden />{" "}Similar profile to FSW in community data</div>
              </div>
            </div>
          </Link>

          <Link href="/streams/atlantic" className="stream-card reveal">
            <div className="sc-head amber-bg">
              <div>
                <div className="sc-title">Atlantic Immigration</div>
                <div className="sc-sub">Atlantic provinces</div>
              </div>
              <span className="sc-icon">
                <MdWaves size={24} aria-hidden />
              </span>
            </div>
            <div className="sc-body">
              <div className="sc-avg">
                Avg processing <strong>228</strong> days
              </div>
              <div className="sc-bar">
                <div className="sc-bar-fill" style={{ width: "84%" }} />
              </div>
              <div className="sc-facts">
                <div className="sc-fact"><IconArrowRight size={11} aria-hidden />{" "}Often faster than main streams</div>
                <div className="sc-fact"><IconArrowRight size={11} aria-hidden />{" "}NS, NB, NL, PEI cohort keys</div>
              </div>
            </div>
          </Link>

          <div className="stream-add reveal">
            <div className="stream-add-icon">
              <IconPlus size={28} strokeWidth={2.2} aria-hidden />
            </div>
            <div className="mkt-stream-add-title">More streams coming</div>
            <div className="mkt-stream-add-sub">
              Rural &amp; Northern, Agri-Food, RNIP — vote on our roadmap
            </div>
            <Link href="/roadmap" className="mkt-stream-add-link">
              View Roadmap
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
