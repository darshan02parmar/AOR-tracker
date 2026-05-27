export function LandingHowItWorksSection() {
  return (
    <section className="hiw-section" id="how">
      <div className="hiw-inner">
        <p className="section-eye">How It Works</p>
        <h2 className="section-h2">From AOR to PPR   tracked every step.</h2>
        <p className="section-sub">
          No account needed. 30 seconds to set up. Your anonymised data automatically improves
          estimates for your whole cohort.
        </p>
        <div className="hiw-steps">
          <div className="hiw-step active">
            <div className="hs-num">01</div>
            <div className="hs-title">Enter your AOR date</div>
            <div className="hs-body">
              Input your Acknowledgement of Receipt date and immigration stream. No account, no
              email, no password   30 seconds flat.
            </div>
            <span className="hs-tag hs-free">Free · No account</span>
          </div>
          <div className="hiw-step">
            <div className="hs-num">02</div>
            <div className="hs-title">See your cohort position</div>
            <div className="hs-body">
              Instantly compare against everyone who applied in the same month and stream. See your
              percentile rank in the queue.
            </div>
            <span className="hs-tag hs-free">Real data · Not IRCC averages</span>
          </div>
          <div className="hiw-step">
            <div className="hs-num">03</div>
            <div className="hs-title">Log your milestones</div>
            <div className="hs-body">
              Update biometrics, medicals, background checks, and PPR as they happen. Each entry
              sharpens the model for your whole cohort.
            </div>
            <span className="hs-tag hs-oss">Contributes to community</span>
          </div>
          <div className="hiw-step">
            <div className="hs-num">04</div>
            <div className="hs-title">Get smart alerts</div>
            <div className="hs-body">
              Receive notifications when your cohort hits milestones, when processing times shift,
              or when your PPR window updates.
            </div>
            <span className="hs-tag hs-tag-purple">Email · Discord · In-app</span>
          </div>
        </div>
      </div>
    </section>
  );
}
