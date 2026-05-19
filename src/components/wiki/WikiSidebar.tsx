"use client";

import { useEffect, useState } from "react";
import { WIKI_NAV, allWikiSectionIds } from "@/components/wiki/wiki-nav";

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Sticky left rail with scroll-spy highlighting for wiki sections.
 */
export function WikiSidebar() {
  const [activeId, setActiveId] = useState<string>(WIKI_NAV[0]?.id ?? "");

  useEffect(() => {
    const ids = allWikiSectionIds();
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null);

    if (elements.length === 0) return;

    const visible = new Map<string, IntersectionObserverEntry>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) visible.set(id, entry);
          else visible.delete(id);
        }

        if (visible.size === 0) return;

        const sorted = [...visible.values()].sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
        );
        const top = sorted[0]?.target.id;
        if (top) setActiveId(top);
      },
      { rootMargin: "-72px 0px -55% 0px", threshold: [0, 0.1, 0.5] },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const activeGroupId =
    WIKI_NAV.find(
      (g) =>
        g.id === activeId || g.children?.some((c) => c.id === activeId),
    )?.id ?? activeId;

  return (
    <nav className="wiki-sidebar" aria-label="Wiki table of contents">
      <p className="wiki-sidebar-label">On this page</p>
      <ul className="wiki-sidebar-groups">
        {WIKI_NAV.map((group) => {
          const groupActive = activeGroupId === group.id;
          return (
            <li key={group.id} className="wiki-sidebar-group">
              <a
                href={`#${group.id}`}
                className={`wiki-sidebar-link wiki-sidebar-link--major${groupActive ? " is-active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId(group.id);
                }}
                aria-current={activeId === group.id ? "location" : undefined}
              >
                {group.label}
              </a>
              {group.children && group.children.length > 0 && (
                <ul className="wiki-sidebar-children">
                  {group.children.map((child) => (
                    <li key={child.id}>
                      <a
                        href={`#${child.id}`}
                        className={`wiki-sidebar-link wiki-sidebar-link--minor${activeId === child.id ? " is-active" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToId(child.id);
                        }}
                        aria-current={
                          activeId === child.id ? "location" : undefined
                        }
                      >
                        {child.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
      <div className="wiki-sidebar-footer">
        <a href="/cohort" className="wiki-sidebar-meta-link">
          Public cohort guide
        </a>
        <a
          href="https://github.com/Get-North-Path/AOR-tracker"
          className="wiki-sidebar-meta-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub repo
        </a>
      </div>
    </nav>
  );
}
