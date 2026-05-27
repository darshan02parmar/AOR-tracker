import { IconStar } from "./roadmap-icons";
import type { RoadmapData } from "./data";

type Props = {
  hero: RoadmapData["hero"];
};

/**
 * The dark hero band   eyebrow pill, headline w/ italic emphasis, sub-copy,
 * and a row of inline status pills.
 *
 * The "GitHub stars" pill is special: it appends a star icon after the count
 * (the sample HTML did the same with the unicode "⭐"   we use FaStar).
 */
export function RoadmapHero({ hero }: Props) {
  return (
    <section className="rm-hero">
      <div className="rm-hero-inner">
        <div className="rm-eyebrow">
          <span className="rm-eyebrow-dot" aria-hidden="true" />
          {hero.eyebrow}
        </div>

        <h1>
          {hero.headlineLead} <em>{hero.headlineEmphasis}</em>
        </h1>
        <p className="rm-hero-sub">{hero.sub}</p>

        <div className="rm-hero-pills">
          {hero.pills.map((pill) => {
            const isStars = pill.label.toLowerCase().includes("star");
            return (
              <div className="rm-hp" key={pill.label}>
                {pill.label}{" "}
                <b>
                  {pill.value}
                  {isStars ? <IconStar aria-hidden /> : null}
                </b>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
