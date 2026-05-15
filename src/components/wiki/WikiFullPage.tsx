/**
 * Single-page contributor wiki: session model, Community, Track, Dashboard.
 */
export function WikiFullPage() {
  return (
    <article className="mkt-wiki-page">
      <header className="wiki-hero">
        <div className="wiki-hero-inner">
          <h1>
            Contributor <em>wiki</em>
          </h1>
          <p className="wiki-hero-sub">
            Backend data flow for each major surface: how server actions, MongoDB,
            and the browser session line up. Everything lives on this one page —
            use the table of contents to jump.
          </p>
        </div>
      </header>

      <div className="wiki-main">
        <p className="wiki-lead">
          These notes describe the <strong>actual code paths</strong> in this
          repo (not a product roadmap). Terms like &ldquo;viewer email&rdquo; mean
          the normalized string in{" "}
          <code style={{ fontFamily: "var(--fm)", fontSize: "0.9em" }}>
            sessionStorage[&quot;aortrack_session_email&quot;]
          </code>
          , unless stated otherwise.
        </p>

        <nav className="wiki-toc" aria-label="Page sections">
          <div className="wiki-toc-title">On this page</div>
          <ul className="wiki-toc-list">
            <li>
              <a href="#session-identity">Session &amp; identity</a>
            </li>
            <li>
              <a href="#community-backend">Community backend</a>
            </li>
            <li>
              <a href="#track-backend">Track backend</a>
            </li>
            <li>
              <a href="#dashboard-backend">Dashboard backend</a>
            </li>
          </ul>
        </nav>

        {/* ─── Session & identity ───────────────────────────────────── */}
        <section id="session-identity" className="wiki-major-section">
          <h2 className="wiki-block-title">Session &amp; identity</h2>
          <p className="wiki-lead">
            If you are wiring new UI or API routes, assume: the browser may hold{" "}
            <code style={{ fontFamily: "var(--fm)", fontSize: "0.9em" }}>
              sessionStorage[&quot;aortrack_session_email&quot;]
            </code>{" "}
            (normalized email). Server actions trust the <em>string</em> the client
            passes for mutations — there is no signed session cookie for end-users
            today.
          </p>

          <section className="wiki-section" id="sess-not-included">
            <h2>What this app does not do (yet)</h2>
            <ul>
              <li>No NextAuth, Clerk, or similar IdP integration in-tree.</li>
              <li>No password, magic link, or email OTP verification on the server.</li>
              <li>No HttpOnly cookie that proves the caller owns an email.</li>
            </ul>
            <p>
              The product is intentionally lightweight: users identify by email
              after completing <code>/track</code> (or resuming from the landing
              demo). Treat that as product scope, not a missed import.
            </p>
          </section>

          <section className="wiki-section" id="sess-client-session">
            <h2>Client: &ldquo;session&rdquo; = sessionStorage</h2>
            <p>
              All helpers live in{" "}
              <code style={{ fontFamily: "var(--fm)" }}>src/lib/session-client.ts</code>
              :
            </p>
            <pre className="wiki-code">{`const KEY = "aortrack_session_email";

readSessionEmail()  // → string | null
writeSessionEmail(email)  // normalize trim + toLowerCase
clearSessionEmail()`}</pre>
            <h3>When the email gets written</h3>
            <ul>
              <li>
                After a successful profile save on <strong>/track</strong> (
                <code>TrackPageClient</code> → <code>writeSessionEmail</code>).
              </li>
              <li>
                When <strong>TrackGate</strong> finds an existing profile for the
                typed email (so /dashboard can load without retyping).
              </li>
              <li>
                Landing &ldquo;resume&rdquo; and demo flows that call{" "}
                <code>writeSessionEmail</code> before navigating to /dashboard.
              </li>
            </ul>
            <h3>Who reads it</h3>
            <ul>
              <li>
                <strong>Dashboard shells</strong> (
                <code>DashboardShell</code>, <code>DashboardShellV2</code>): on mount,
                if <code>readSessionEmail()</code> is empty, the user is redirected to{" "}
                <code>/</code>.
              </li>
              <li>
                <strong>Community</strong> (<code>CommunityShell</code>): hydrates{" "}
                <code>viewerEmail</code> from sessionStorage for feed personalization
                and gated actions (post / helpful / reply).
              </li>
            </ul>
            <p>
              <code>sessionStorage</code> is per tab and cleared when the tab closes;
              it is not shared across subdomains unless you configure that yourself.
            </p>
          </section>

          <section className="wiki-section" id="sess-server">
            <h2>Server: profiles in MongoDB</h2>
            <p>
              Primary persistence is the <code>profiles</code> collection. Documents
              are keyed by normalized email, e.g. <code>emailNorm</code>, built via{" "}
              <code>normalizeEmail</code> in <code>src/lib/profile.ts</code>.
            </p>
            <p>
              <strong>Read profile:</strong> <code>getProfileAction(email)</code> in{" "}
              <code>src/app/actions/profile.ts</code> — validates format,{" "}
              <code>{`findOne({ emailNorm })`}</code>, returns typed{" "}
              <code>UserProfile</code> or <code>not_found</code>.
            </p>
            <p>
              <strong>Upsert / save:</strong> <code>saveProfileAction</code>,{" "}
              <code>createDraftProfileAction</code>, milestone updates in the same
              module — all operate on <code>emailNorm</code> and cohort fields derived
              from the profile.
            </p>
          </section>

          <section className="wiki-section" id="sess-community-actions">
            <h2>Community server actions (overview)</h2>
            <p>
              <code>src/app/actions/community.ts</code> exposes{" "}
              <code>getCommunityFeedAction(viewerEmail?, opts)</code> for reads and
              mutations like <code>createCommunityPostAction(email, input)</code> and{" "}
              <code>markCommunityHelpfulAction(email, postId)</code>.
            </p>
            <p>
              The <strong>email argument is supplied by the client</strong> (from the
              same sessionStorage value). The server checks that a profile exists for
              that email before inserting posts — but it does not prove the HTTP
              caller owns the inbox. See the{" "}
              <a href="#community-backend">Community backend</a> section for the full
              feed pipeline.
            </p>
          </section>

          <div className="wiki-callout wiki-callout--warn" id="sess-trust-model">
            <strong>Security / trust model (important for contributors)</strong>
            <p style={{ margin: 0, color: "var(--muted)" }}>
              Today&apos;s model is suitable for a community MVP and transparent data:
              anyone who can guess or supply another user&apos;s email string could
              invoke server actions as that user from their browser. Hardening would
              mean real auth (signed cookies, magic links, OAuth, etc.) and tying
              mutations to verified identity. Document this when reviewing PRs that
              touch actions under <code>src/app/actions/</code>.
            </p>
          </div>

          <section className="wiki-section" id="sess-flow">
            <h2>Typical happy path</h2>
            <div className="wiki-flow">
              {`User completes /track (or resume) → writeSessionEmail
→ User opens /dashboard → readSessionEmail
→ getProfileAction(email) loads Mongo profile
→ Community: same email passed into getCommunityFeedAction / createCommunityPostAction`}
            </div>
          </section>

          <section className="wiki-section" id="sess-files">
            <h2>Key files (session &amp; profile)</h2>
            <div className="wiki-table-wrap">
              <table className="wiki-table">
                <thead>
                  <tr>
                    <th>Path</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>src/lib/session-client.ts</code>
                    </td>
                    <td>sessionStorage read/write/clear for viewer email</td>
                  </tr>
                  <tr>
                    <td>
                      <code>src/app/actions/profile.ts</code>
                    </td>
                    <td>getProfileAction, saveProfileAction, drafts, milestones</td>
                  </tr>
                  <tr>
                    <td>
                      <code>src/app/actions/community.ts</code>
                    </td>
                    <td>Feed + post/helpful actions (email from client)</td>
                  </tr>
                  <tr>
                    <td>
                      <code>src/components/track/TrackGate.tsx</code>
                    </td>
                    <td>Email lookup gate; writes session when profile exists</td>
                  </tr>
                  <tr>
                    <td>
                      <code>src/components/marketing/community/SignInPromptModal.tsx</code>
                    </td>
                    <td>Redirects anonymous users to /track to obtain a profile</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="wiki-section" id="sess-cron">
            <h2>Other auth you might see</h2>
            <p>
              Cron / dev API routes (e.g. under <code>src/app/api/</code>) may use a
              shared secret header such as <code>Authorization: Bearer …</code> —
              that pattern is for <strong>infrastructure</strong>, not browser users.
            </p>
          </section>
        </section>

        {/* ─── Community ─────────────────────────────────────────────── */}
        <section id="community-backend" className="wiki-major-section">
          <h2 className="wiki-block-title">Community backend</h2>
          <p className="wiki-lead">
            Public marketing feed at <code>/community</code> plus the signed-in
            dashboard panel — both backed by the same MongoDB collection and server
            actions in <code>src/app/actions/community.ts</code>. Reads are mostly
            anonymous (approved posts only). Writes pass a normalized email from the
            client; see <a href="#session-identity">Session &amp; identity</a> for the
            trust model.
          </p>

          <section className="wiki-section" id="comm-surfaces">
            <h2>Two surfaces, one backend</h2>
            <div className="wiki-table-wrap">
              <table className="wiki-table">
                <thead>
                  <tr>
                    <th>Route / component</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>src/app/community/page.tsx</code>
                    </td>
                    <td>
                      Server Component. Calls{" "}
                      <code>getCommunityFeedAction(null, …)</code> (no viewer on first
                      paint) and <code>getCommunityMsCountsAction()</code> in parallel.
                      Exports <code>dynamic = &quot;force-dynamic&quot;</code> so every
                      request hits MongoDB.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>CommunityShell</code>
                    </td>
                    <td>
                      Client wrapper: hydrates <code>readSessionEmail()</code>,
                      optionally refetches the feed with the viewer email for per-user
                      fields (e.g. helpful state), owns Socket.IO, paging, filters, and
                      modals that call mutations.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>src/app/dashboard/community/page.tsx</code> →{" "}
                      <code>CommunityFeedClient</code>
                    </td>
                    <td>
                      Renders <code>CommunityFeedPanel</code> with <code>email</code> and{" "}
                      <code>profile</code> from <code>DashboardContext</code> (already
                      loaded in the shell). Feed fetches always pass the real viewer
                      email.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="wiki-section" id="comm-mongo">
            <h2>
              MongoDB: <code>community_posts</code>
            </h2>
            <p>
              Approved public posts match <code>{`{ approved: true }`}</code>.{" "}
              <code>getCommunityFeedAction</code> sorts by <code>createdAt: -1</code>,
              applies optional <code>ms</code> filter (PPR / BIL / BGC / Med), clamps
              page to <code>totalPages</code>, and maps rows through{" "}
              <code>serializePost</code> in <code>src/lib/seed.ts</code> so the wire
              shape matches <code>CommunityPost</code>.
            </p>
            <p>
              <code>getCommunityMsCountsAction</code> runs a single aggregation: match
              approved, <code>$group</code> by <code>ms</code>. That powers filter chip
              badges on the public page without loading the full feed.
            </p>
          </section>

          <section className="wiki-section" id="comm-adapter">
            <h2>
              Marketing types: <code>communityPostToApproved</code>
            </h2>
            <p>
              The public UI consumes <code>ApprovedPost</code> from{" "}
              <code>components/marketing/community/data.ts</code>. The adapter in{" "}
              <code>adapter.ts</code> maps DB <code>CommunityPost</code> → marketing card
              shape (cohort rows from <code>meta</code>, timeline dots from{" "}
              <code>tl</code>, safe HTML for user bodies). User content uses{" "}
              <code>bodyIsHtml: false</code> and escaped plain text; seeded posts may
              set trusted HTML — documented in the adapter file.
            </p>
          </section>

          <section className="wiki-section" id="comm-actions">
            <h2>
              Server actions (<code>community.ts</code>)
            </h2>
            <ul>
              <li>
                <strong>getCommunityFeedAction(viewerEmail?, opts)</strong> — page size
                is clamped 1–100 (default <code>COMMUNITY_FEED_PAGE_SIZE</code>). When{" "}
                <code>viewerEmail</code> is a valid email, <code>serializePost</code>{" "}
                can mark whether that viewer already voted helpful.
              </li>
              <li>
                <strong>
                  createCommunityPostAction(email, {"{"} body, ms, replyToId? {"}"})
                </strong>{" "}
                — validates email and body length, loads profile via{" "}
                <code>getProfileAction</code> (posting requires a stored profile). Builds{" "}
                <code>meta</code> / <code>tl</code> from profile milestones. Optional{" "}
                <code>replyToId</code> must reference an approved parent; stores{" "}
                <code>replyToPreview</code>. New rows are inserted with{" "}
                <code>approved: true</code> today (no moderation queue in this path).
                Calls <code>broadcastCommunityFeedRefresh()</code>.
              </li>
              <li>
                <strong>markCommunityHelpfulAction(email, postId)</strong> —{" "}
                <code>$addToSet</code> on <code>helpfulVoters</code> keyed by normalized
                email; idempotent for repeat votes. Broadcasts refresh on success.
              </li>
            </ul>
          </section>

          <section className="wiki-section" id="comm-socket">
            <h2>
              Socket.IO: <code>feed:refresh</code>
            </h2>
            <p>
              <code>src/lib/community-broadcast.ts</code> grabs{" "}
              <code>globalThis.__communityIO</code> (the Socket.IO server instance) and
              emits <code>feed:refresh</code> to the <code>community</code> room after
              post/helpful mutations. Both <code>CommunityShell</code> and{" "}
              <code>CommunityFeedPanel</code> subscribe with <code>socket.io-client</code>{" "}
              and refetch the current page when they see that event.
            </p>
          </section>

          <section className="wiki-section" id="comm-client-flow">
            <h2>Public shell behaviour (summary)</h2>
            <p className="wiki-flow">
              SSR: anonymous feed page 1 + ms counts → build seed + live approved list
              → CommunityShell mounts → sessionStorage email → optional refetch with
              viewer → filter/page changes call getCommunityFeedAction again → gated
              actions open sign-in modal → Track for email if needed.
            </p>
          </section>

          <section className="wiki-section" id="comm-dashboard-panel">
            <h2>Dashboard panel extras</h2>
            <p>
              <code>CommunityFeedPanel</code> uses the same three actions for fetch /
              post / helpful. It additionally persists &ldquo;saved&rdquo; post ids in{" "}
              <code>localStorage</code> under <code>aortrack.community.savedIds</code>{" "}
              — that is purely client UI state, not the shared MongoDB model.
            </p>
          </section>

          <div className="wiki-callout wiki-callout--warn">
            <strong>Security note</strong>
            Any caller can invoke server actions with arbitrary email strings until real
            authentication exists. Treat community mutations as{" "}
            <em>convenience-gated</em>, not cryptographically proven.
          </div>
        </section>

        {/* ─── Track ─────────────────────────────────────────────────── */}
        <section id="track-backend" className="wiki-major-section">
          <h2 className="wiki-block-title">Track backend</h2>
          <p className="wiki-lead">
            Single client entry at <code>/track</code> (<code>TrackPageClient</code>):
            email gate, three-step onboarding, then MongoDB profile save via{" "}
            <code>src/app/actions/profile.ts</code>. Track does <strong>not</strong>{" "}
            hydrate the form from <code>sessionStorage</code> on load. The gate is the
            canonical entry: the user types an email, and the app branches on whether a
            profile already exists.
          </p>

          <section className="wiki-section" id="trk-phases">
            <h2>
              Three phases (<code>TrackPageClient</code>)
            </h2>
            <ol>
              <li>
                <strong>gate</strong> — <code>TrackGate</code> collects email and calls{" "}
                <code>getProfileAction(trimmed)</code>. If found: show return UI and
                call <code>writeSessionEmail</code> so <code>/dashboard</code> can load
                without re-prompting. If not found: user enters onboarding (email carried
                to step 3).
              </li>
              <li>
                <strong>onboarding</strong> — Steps 1–3 collect AOR date, stream, type,
                optional PNP province, milestone checkboxes + dates, then review +
                consent + email. All client-side until submit.
              </li>
              <li>
                <strong>success</strong> — After a successful save, CTA navigates to{" "}
                <code>/dashboard</code>.
              </li>
            </ol>
          </section>

          <section className="wiki-section" id="trk-submit-chain">
            <h2>Submit chain (step 3)</h2>
            <p className="wiki-flow">
              createDraftProfileAction(email, demographic hints from the wizard) →
              build UserProfile client-side from form state → getProfileAction (preserve
              createdAt if doc existed) →
              saveProfileAction(full profile) → writeSessionEmail → phase success
            </p>
            <ul>
              <li>
                <code>createDraftProfileAction</code> ensures a minimal MongoDB row
                exists so the subsequent save can upsert cleanly. Optional hints (AOR,
                stream, type, province) match the wizard so the draft row is not stuck on{" "}
                <code>newProfile()</code> defaults.
              </li>
              <li>
                <code>saveProfileAction</code> persists the full milestone map and
                demographic fields; this is the same action family the dashboard uses
                for profile-shaped updates.
              </li>
              <li>
                <code>writeSessionEmail</code> (<code>src/lib/session-client.ts</code>)
                stores the normalized email in <code>sessionStorage</code> under{" "}
                <code>aortrack_session_email</code>.
              </li>
            </ul>
          </section>

          <section className="wiki-section" id="trk-live-counter">
            <h2>Hero &ldquo;live&rdquo; counter</h2>
            <p>
              The incrementing number beside the hero is a{" "}
              <strong>client-only simulation</strong> in <code>TrackPageClient</code>{" "}
              (interval + random walk). It is not wired to{" "}
              <code>getLandingHomeAction</code> or Mongo counts in the current code
              path.
            </p>
          </section>

          <section className="wiki-section" id="trk-files">
            <h2>Key files</h2>
            <div className="wiki-table-wrap">
              <table className="wiki-table">
                <thead>
                  <tr>
                    <th>Path</th>
                    <th>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>src/app/track/page.tsx</code>
                    </td>
                    <td>RSC shell: metadata + renders <code>TrackPageClient</code>.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>src/components/track/TrackGate.tsx</code>
                    </td>
                    <td>Email lookup + session write when profile exists.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>src/app/actions/profile.ts</code>
                    </td>
                    <td>
                      <code>getProfileAction</code>,{" "}
                      <code>createDraftProfileAction</code>,{" "}
                      <code>saveProfileAction</code>, milestone helpers consumed
                      elsewhere.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className="wiki-callout wiki-callout--warn">
            <strong>Reminder</strong>
            Server actions trust the email argument from the browser. Track is honest
            about that: there is no password proof step in-tree. After Track, the{" "}
            <a href="#dashboard-backend">Dashboard</a> section describes how the shell
            reuses the same session and profile actions.
          </div>
        </section>

        {/* ─── Dashboard ─────────────────────────────────────────────── */}
        <section id="dashboard-backend" className="wiki-major-section">
          <h2 className="wiki-block-title">Dashboard backend</h2>
          <p className="wiki-lead">
            Every dashboard URL is wrapped by <code>DashboardShellV2</code> (
            <code>src/app/dashboard/layout.tsx</code>). The shell owns session read,
            profile load, cohort hydration, share token, and context for all child tabs.
            On mount the shell reads <code>readSessionEmail()</code>. Missing email →{" "}
            <code>router.replace(&quot;/&quot;)</code>. Valid email →{" "}
            <code>getProfileAction</code>; failure → same redirect. Only after profile{" "}
            <em>and</em> cohort payloads resolve does the chrome render children
            (otherwise <code>DashboardLoadingSkeleton</code>).
          </p>

          <section className="wiki-section" id="dash-shell-load">
            <h2>Initial server-action bundle</h2>
            <p>For the signed-in email, the shell typically runs:</p>
            <ul>
              <li>
                <code>getProfileAction(email)</code> — source of truth for{" "}
                <code>UserProfile</code> in React state.
              </li>
              <li>
                <code>hydrateCohortView(viewKey, peerRootKey)</code> — parallel{" "}
                <code>Promise.all</code> of <code>getCohortStatsByKeyAction(viewKey)</code>
                , <code>getLiveCohortAggregateAction(viewKey)</code>, and{" "}
                <code>listRelatedCohortSummariesAction(peerRootKey, 8)</code>. The default{" "}
                <code>viewKey</code> is derived from the profile via{" "}
                <code>cohortKeyFromProfile</code>.
              </li>
              <li>
                <code>ensureShareTokenForEmailAction(email)</code> — lazy-creates a
                36-char hex <code>shareToken</code> on the profile document if missing;
                exposes <code>shareUrl</code> as{" "}
                <code>{`\${origin}/s/\${token}`}</code> on the client.
              </li>
            </ul>
          </section>

          <section className="wiki-section" id="dash-live-vs-static">
            <h2>Cohort stats: static row vs live aggregate</h2>
            <p>
              <code>cohort_stats</code> documents feed <code>cohort</code> /{" "}
              <code>cohortDisplay</code> baselines (medians, verified counts). When{" "}
              <code>liveAggregate.profileCount &gt;= 2</code>, the UI prefers live
              per-milestone filled counts from <code>profiles</code> aggregation (
              <code>getLiveCohortAggregateAction</code>) for richer charts; fewer than
              two profiles falls back to the static cohort doc so the UI does not
              over-promise precision.
            </p>
          </section>

          <section className="wiki-section" id="dash-mutations">
            <h2>Mutations from the shell</h2>
            <ul>
              <li>
                <strong>Milestone picker</strong> —{" "}
                <code>updateMilestoneAction(email, key, isoDate)</code>. On success the
                shell updates local profile state and re-runs{" "}
                <code>hydrateCohortView</code> for the active cohort view (profile cohort
                or overridden cohort key).
              </li>
              <li>
                <strong>Sync cohort stats</strong> —{" "}
                <code>syncCohortStatsFromProfilesAction(email)</code> (maintenance /
                backfill helper) then refreshes the current cohort view.
              </li>
              <li>
                <strong>Switch profile</strong> — clears session via{" "}
                <code>clearSessionEmail()</code> and sends the user home.
              </li>
            </ul>
          </section>

          <section className="wiki-section" id="dash-routes">
            <h2>
              App routes under <code>/dashboard</code>
            </h2>
            <div className="wiki-table-wrap">
              <table className="wiki-table">
                <thead>
                  <tr>
                    <th>Path</th>
                    <th>Component</th>
                    <th>Backend notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>/dashboard</code>
                    </td>
                    <td>
                      <code>DashboardTimelineTabV2</code>
                    </td>
                    <td>
                      Consumes <code>DashboardContext</code> only — milestones, ring,
                      PPR estimate, etc. all preloaded by the shell.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>/dashboard/stats</code>
                    </td>
                    <td>
                      <code>DashboardStatsTabV2</code>
                    </td>
                    <td>
                      Same context; renders processing stats derived from shell state (no
                      extra profile fetch in the page file).
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>/dashboard/share</code>
                    </td>
                    <td>
                      <code>DashboardShareTabV2</code>
                    </td>
                    <td>
                      Uses <code>shareUrl</code> / error strings prepared by{" "}
                      <code>ensureShareTokenForEmailAction</code> in the shell. Public read
                      path for visitors is <code>/s/[token]</code> (
                      <code>getPublicSharePayloadAction</code> in <code>share.ts</code>),
                      not part of the dashboard layout.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>/dashboard/community</code>
                    </td>
                    <td>
                      <code>CommunityFeedPanel</code>
                    </td>
                    <td>
                      Passes shell <code>email</code> + <code>profile</code> into the
                      panel; see <a href="#community-backend">Community backend</a> for
                      feed actions and Socket.IO.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="wiki-section" id="dash-scroll-spy">
            <h2>Sidebar scroll spy (timeline route only)</h2>
            <p>
              When <code>pathname === &quot;/dashboard&quot;</code>, a{" "}
              <code>useLayoutEffect</code> attaches scroll + resize listeners to the{" "}
              <code>.dmain</code> element to drive <code>activeScrollKey</code> for
              in-page anchors (overview, milestones, share link, etc.). Other sub-routes
              skip that logic but still reuse the same chrome layout.
            </p>
          </section>

          <section className="wiki-section" id="dash-context">
            <h2>Contexts</h2>
            <p>
              <code>DashboardProvider</code> exposes profile, cohort, share URL,
              milestone save handler, cohort switchers, and related analytics VM fields.{" "}
              <code>DashboardV2UiProvider</code> is the v2 UI-specific layer (toasts,
              compact chrome flags). Child tabs should read data via hooks, not duplicate
              fetches, unless a feature truly needs an isolated query.
            </p>
          </section>

          <div className="wiki-callout wiki-callout--warn">
            <strong>Auth gap</strong>
            Because identification is only the client-stored email string, any dashboard
            server action that accepts <code>email</code> must be treated as publicly
            callable with arbitrary addresses until hardened.
          </div>
        </section>
      </div>
    </article>
  );
}
