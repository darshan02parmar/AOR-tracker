export type ParsedStandaloneHtml = {
  styles: string;
  bodyInnerHtml: string;
  scripts: string[];
};

/** Avoid leaking `html` / `body` rules onto other App Router pages after client navigation. */
export function scopeStandaloneRootSelectors(css: string): string {
  return css
    .replace(/html\{/g, "html.aortrack-standalone-page{")
    .replace(/body\{/g, "body.aortrack-standalone-page{");
}

/** Marketing HTML fragments (streams, guides)   `<style>` + body markup + optional `<script>`. */
export function parseMarketingHtmlFragment(fragment: string): ParsedStandaloneHtml {
  const styleBlocks: string[] = [];
  const reStyle = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let sm: RegExpExecArray | null;
  while ((sm = reStyle.exec(fragment)) !== null) {
    styleBlocks.push(sm[1]);
  }

  let chunk = fragment.replace(reStyle, "");

  const scripts: string[] = [];
  const reScript = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch: RegExpExecArray | null;
  while ((scriptMatch = reScript.exec(chunk)) !== null) {
    scripts.push(scriptMatch[1]);
  }
  chunk = chunk.replace(reScript, "");

  const rawStyles = styleBlocks.join("\n\n");
  return {
    styles: scopeStandaloneRootSelectors(rawStyles),
    bodyInnerHtml: chunk.trim(),
    scripts,
  };
}

export function parseStandaloneHtml(fullHtml: string): ParsedStandaloneHtml {
  const styleBlocks: string[] = [];
  const reStyle = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let sm: RegExpExecArray | null;
  while ((sm = reStyle.exec(fullHtml)) !== null) {
    styleBlocks.push(sm[1]);
  }

  const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let bodyChunk = bodyMatch?.[1] ?? "";

  const scripts: string[] = [];
  const reScript = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch: RegExpExecArray | null;
  while ((scriptMatch = reScript.exec(bodyChunk)) !== null) {
    scripts.push(scriptMatch[1]);
  }
  bodyChunk = bodyChunk.replace(reScript, "");

  const rawStyles = styleBlocks.join("\n\n");
  return {
    styles: scopeStandaloneRootSelectors(rawStyles),
    bodyInnerHtml: bodyChunk.trim(),
    scripts,
  };
}

export function parseMetaFromStandaloneHtml(fullHtml: string): {
  title?: string;
  description?: string;
  robots?: { index: boolean; follow: boolean };
} {
  const title = fullHtml.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim();
  const description = fullHtml
    .match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1]
    ?.trim();
  const robots = fullHtml.match(/<meta\s+name="robots"\s+content="([^"]*)"/i)?.[1];
  let robotsMeta: { index: boolean; follow: boolean } | undefined;
  if (robots?.toLowerCase().includes("noindex")) {
    robotsMeta = { index: false, follow: false };
  }
  return { title, description, robots: robotsMeta };
}
