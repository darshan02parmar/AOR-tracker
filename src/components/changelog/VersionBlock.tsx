import { FaGithub } from "react-icons/fa";
import { ChangeSection } from "./ChangeSection";
import { ContribRow } from "./ContribRow";
import { WhatsNextBox } from "./WhatsNextBox";
import type { Version } from "./data";

type Props = {
  version: Version;
};

/**
 * Single version block   header (badge, title, GitHub release link) followed
 * by its change sections, contributor row, and optional "What came next"
 * inline box.
 *
 * TODO(github-integration): when GitHub becomes the source, this component
 * stays the same   it only consumes the `Version` shape. The work moves to
 * `data.ts`' loader, which will map a GitHub release into this shape.
 */
export function VersionBlock({ version }: Props) {
  const badgeModifier = version.isLatest ? "is-latest" : "is-old";

  return (
    <div className="cl-version" id={version.id}>
      <div className="cl-version-head">
        <div className="cl-vbadge-col">
          <div className={`cl-vbadge ${badgeModifier}`}>{version.version}</div>
          <span className="cl-vdate">{version.date}</span>
        </div>
        <div className="cl-vtitle">
          <h2>{version.title}</h2>
          <p>{version.description}</p>
        </div>
        <a
          href={version.releaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cl-vgh"
        >
          <FaGithub aria-hidden />
          Release
        </a>
      </div>

      <div className="cl-sections">
        {version.sections.map((section, idx) => (
          <ChangeSection section={section} key={`${section.type}-${idx}`} />
        ))}

        {version.contribRow ? <ContribRow row={version.contribRow} /> : null}

        {version.whatsNext ? <WhatsNextBox data={version.whatsNext} /> : null}
      </div>
    </div>
  );
}
