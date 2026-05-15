import Link from "next/link";
import { WebsiteLogo } from "@/components/WebsiteLogo";
import {
  STREAM_PAGE_SLUGS,
  streamLabelFromSitemapSlug,
} from "@/lib/streams-sitemap-slugs";
import { IconGitHub } from "./landing-icons";
import {
  FaCheck,
  FaComment,
  FaDiscord,
  FaHeart,
  FaInstagram,
  FaLinkedin,
  FaNewspaper,
  FaTwitter,
  FaUsers,
  FaYoutube,
} from "react-icons/fa";

const GH = "https://github.com/Get-North-Path/AOR-tracker";
const DISCORD = "https://discord.gg/aortrack";
/** Official profiles — update if GetNorthPath changes handles. */
const SOCIAL = {
  linkedin: "https://www.linkedin.com/company/getnorthpath",
  x: "https://x.com/GetNorthPath",
  youtube: "https://www.youtube.com/@GetNorthPath",
  instagram: "https://www.instagram.com/getnorthpath",
} as const;

/** Short labels for footer; full option name in `title` for accessibility. */
function streamFooterLabel(slug: string): string {
  if (slug === "cec") return "CEC";
  if (slug === "fsw") return "FSW";
  if (slug === "pnp") return "PNP";
  return slug.toUpperCase();
}

export function MarketingFooter() {
  const year = new Date().getFullYear();
  const streamSlugs = [...STREAM_PAGE_SLUGS].sort((a, b) => a.localeCompare(b));

  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <WebsiteLogo
            layout="inline"
            href="/"
            className="fg-brand"
            aria-label="AORTrack — home"
          />
          <p className="fg-desc">
            Free, open-source Canadian PR processing time tracker. Community-powered data from real
            applicants. Built with care by GetNorthPath.
          </p>
          <div className="fg-badges">
            <a
              href={GH}
              target="_blank"
              rel="noopener noreferrer"
              className="fg-b oss"
            >
              <IconGitHub />
              Open Source · MIT
            </a>
            <span className="fg-b free"><FaHeart />
            Free Forever · No Ads</span>
            <span className="fg-b"><FaCheck />
            No Signup Required</span>
          </div>
          <div className="fg-social">
            <a
              className="fg-soc-link"
              href={GH}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="AORTrack on GitHub"
              title="GitHub"
            >
              <IconGitHub />
            </a>
            <a
              className="fg-soc-link"
              href={DISCORD}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="AORTrack Discord"
              title="Discord"
            >
              <FaDiscord />
            </a>
            <a
              className="fg-soc-link"
              href={SOCIAL.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GetNorthPath on LinkedIn"
              title="LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a
              className="fg-soc-link"
              href={SOCIAL.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GetNorthPath on X"
              title="X"
            >
              <FaTwitter />
            </a>
            <a
              className="fg-soc-link"
              href={SOCIAL.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GetNorthPath on YouTube"
              title="YouTube"
            >
              <FaYoutube />
            </a>
            <a
              className="fg-soc-link"
              href={SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GetNorthPath on Instagram"
              title="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              className="fg-soc-link"
              href="https://www.getnorthpath.com/blog"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GetNorthPath blog"
              title="Blog"
            >
              <FaNewspaper />
            </a>
          </div>
          <p className="not-affiliated">
            Not affiliated with or endorsed by IRCC (Immigration, Refugees and Citizenship Canada).
            Data is crowd-sourced from community members and not official government data.
          </p>
        </div>

        <div>
          <div className="fg-col-head">Tracker</div>
          <Link href="/track" className="fg-link">
            Start Tracking <span className="fg-link-badge lb-free">Free</span>
          </Link>
          <Link href="/dashboard" className="fg-link">
            My Dashboard
          </Link>
          <Link href="/dashboard/stats" className="fg-link">
            Processing Stats
          </Link>
          <Link href="/#timeline" className="fg-link">
            Milestone Tracking <span className="fg-link-badge lb-new">Live</span>
          </Link>
          <Link href="/community" className="fg-link">
            Community <span className="fg-link-badge lb-new">Hub</span>
          </Link>
        </div>

        <div>
          <div className="fg-col-head">Streams</div>
          {streamSlugs.map((slug) => {
            const optionLabel = streamLabelFromSitemapSlug(slug);
            return (
              <Link
                key={slug}
                href={`/streams/${slug}`}
                className="fg-link"
                title={optionLabel ?? undefined}
              >
                {streamFooterLabel(slug)}
              </Link>
            );
          })}
          <Link href="/#streams" className="fg-link">
            All streams on home
          </Link>
        </div>

        <div>
          <div className="fg-col-head">Community</div>
          <a
            href={DISCORD}
            target="_blank"
            rel="noopener noreferrer"
            className="fg-link"
          >
            <FaDiscord /> Discord Server
          </a>
          <a href={`${GH}/issues`} target="_blank" rel="noopener noreferrer" className="fg-link">
            <FaComment /> Give Feedback
          </a>
          <a href={`${GH}/graphs/contributors`} target="_blank" rel="noopener noreferrer" className="fg-link">
            <FaUsers /> Contributors
          </a>
          <a href={GH} target="_blank" rel="noopener noreferrer" className="fg-link">
            GitHub <span className="fg-link-badge lb-oss">OSS</span>
          </a>
          <Link href="/roadmap" className="fg-link">
            Public Roadmap
          </Link>
          <Link href="/changelog" className="fg-link">
            Changelog
          </Link>
        </div>

        <div>
          <div className="fg-col-head">Resources</div>
          <Link href="/wiki" className="fg-link">
            Dev wiki<span className="fg-link-badge lb-oss">OSS</span>
          </Link>
          <Link href="/aor-to-ppr" className="fg-link">
            AOR → PPR timeline
          </Link>
          <Link href="/cohort" className="fg-link">
            Cohort analytics
          </Link>
          <Link href="/vs-ircc" className="fg-link">
            Real times vs IRCC
          </Link>
          <a
            href="https://www.getnorthpath.com/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="fg-link"
          >
            Blog
          </a>
          <a
            href="https://www.getnorthpath.com/pathways"
            target="_blank"
            rel="noopener noreferrer"
            className="fg-link"
          >
            PR Pathways Guide
          </a>
          <Link href="/dashboard/stats" className="fg-link">
            Processing insights
          </Link>
          <a
            href="https://www.canada.ca/en/immigration-refugees-citizenship/news.html"
            target="_blank"
            rel="noopener noreferrer"
            className="fg-link"
          >
            IRCC news
          </a>
          <Link href="/sitemap.xml" className="fg-link">
            Sitemap
          </Link>
          <a
            href="https://www.getnorthpath.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="fg-link"
          >
            Privacy Policy
          </a>
          <a
            href="https://www.getnorthpath.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="fg-link"
          >
            Terms of Use
          </a>
        </div>

        <div>
          <div className="fg-col-head">GetNorthPath</div>
          <a
            href="https://www.getnorthpath.com"
            target="_blank"
            rel="noopener noreferrer"
            className="fg-link"
          >
            Main Site
          </a>
          <a
            href="https://www.getnorthpath.com/contact?utm_source=aortrack"
            target="_blank"
            rel="noopener noreferrer"
            className="fg-link"
          >
            Book a Consultation
          </a>
          <a
            href="https://www.getnorthpath.com/pathways"
            target="_blank"
            rel="noopener noreferrer"
            className="fg-link"
          >
            All PR Pathways
          </a>
          <a
            href="https://www.getnorthpath.com/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="fg-link"
          >
            Immigration Blog
          </a>
          <a
            href="https://www.getnorthpath.com/about"
            target="_blank"
            rel="noopener noreferrer"
            className="fg-link"
          >
            About Us
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          <div className="fb-left">
            © {year} GetNorthPath Inc. · AORTrack is free &amp; open source (MIT License)
          </div>
          <div className="fb-disclaimer">
            Not affiliated with IRCC. Community data only. Processing times are estimates based on
            crowd-sourced reports — not official government data.
          </div>
        </div>
        <div className="fb-links">
          <a href="https://www.getnorthpath.com/privacy" className="fb-link" target="_blank" rel="noopener noreferrer">
            Privacy
          </a>
          <a href="https://www.getnorthpath.com/terms" className="fb-link" target="_blank" rel="noopener noreferrer">
            Terms
          </a>
          <a href="https://www.getnorthpath.com/cookies" className="fb-link" target="_blank" rel="noopener noreferrer">
            Cookies
          </a>
          <a href="mailto:hello@getnorthpath.com" className="fb-link">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
