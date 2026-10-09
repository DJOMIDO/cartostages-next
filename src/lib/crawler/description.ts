import { WAGA_OFFRES_URL } from "./parse";

export type DescField = { label: string; value: string };

export type DescBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export interface ParsedDescription {
  fields: DescField[];
  links: DescField[];
  blocks: DescBlock[];
}

// "Titre: value" / "Profil : value" (French spacing), label starts uppercase, <= 6 words
const FIELD_RE = /^[ \t]{0,2}([A-ZÀ-Ÿ][\p{L}0-9'()\- ]{1,44}?)\s*:\s*(\S.*)?$/u;
const BULLET_RE = /^\s*[-*•]\s+/;
// Short all-letters line like "Résumé" or "Votre profil" used as an inline section title
const INLINE_HEADING_RE = /^[A-ZÀ-Ÿ][\p{L}'’ -]{2,40}$/u;

const soft = (s: string) => s.replace(/[\s\u00a0]+/g, " ").trim();

export function normalizeForCompare(s: string) {
  return soft(s)
    .replace(/[‘’]/g, "'")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[.;:!?]+$/, "");
}

export function parseDescription(raw: string): ParsedDescription {
  const clean = raw
    .replace(/\r\n?/g, "\n")
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");
  const lines = clean.split("\n").map((l) => l.replace(/[\s\u00a0]+$/, ""));

  const consumed = new Set<number>();
  const fields: DescField[] = [];
  const links: DescField[] = [];

  const fieldLimit = Math.min(lines.length, 30);
  for (let i = 0; i < fieldLimit; i++) {
    const m = lines[i].match(FIELD_RE);
    if (!m) continue;
    const rawLabel = m[1];
    const value0 = m[2];
    if (!rawLabel || soft(rawLabel).split(" ").length > 6) continue;
    const label = soft(rawLabel);
    let value = (value0 ?? "").trim();
    let j = i;

    if (value === "") {
      const next = (lines[i + 1] ?? "").trim();
      if (!/^https?:\/\//.test(next)) continue;
      value = next;
      consumed.add(i + 1);
    } else {
      while (j + 1 < lines.length && j - i < 4) {
        const nxt = lines[j + 1];
        if (nxt === "" || FIELD_RE.test(nxt)) break;
        value = soft(`${value} ${nxt.trim()}`);
        j++;
        consumed.add(j);
      }
    }
    consumed.add(i);

    if (/^https?:\/\//.test(value) || /lien\s+pour|candidat|postuler/i.test(label)) {
      links.push({ label, value });
    } else {
      fields.push({ label, value });
    }
    i = j;
  }

  const rest: string[] = [];
  for (let j = 0; j < lines.length; j++) {
    if (!consumed.has(j)) rest.push(lines[j]);
  }

  const blocks: DescBlock[] = [];
  let group: string[] = [];

  const classify = (g: string[]) => {
    if (g.some((l) => BULLET_RE.test(l))) {
      const items: string[] = [];
      for (const l of g) {
        const t = l.trim();
        if (BULLET_RE.test(t)) items.push(soft(t.replace(BULLET_RE, "")));
        else if (items.length > 0) items[items.length - 1] = soft(`${items[items.length - 1]} ${t}`);
        else items.push(soft(t));
      }
      blocks.push({ type: "list", items });
      return;
    }
    if (g.length === 1) {
      const t = soft(g[0]);
      const isHeading =
        /^[A-ZÀ-Ÿ]/.test(t) &&
        t.length <= 64 &&
        !/[.:;!?]$/.test(t) &&
        !t.includes(":") &&
        !t.includes("@") &&
        !/\d/.test(t) &&
        !t.includes("/") &&
        !t.includes("http");
      blocks.push(isHeading ? { type: "heading", text: t } : { type: "paragraph", text: t });
      return;
    }
    blocks.push({ type: "paragraph", text: soft(g.map((l) => l.trim()).join(" ")) });
  };

  const flush = () => {
    if (group.length > 0) {
      classify(group);
      group = [];
    }
  };

  for (const line of rest) {
    if (line.trim() === "") {
      flush();
      continue;
    }
    if (INLINE_HEADING_RE.test(line.trim()) && !BULLET_RE.test(line)) {
      flush();
      group.push(line.trim());
      flush();
      continue;
    }
    group.push(line);
  }
  flush();

  // A lone "Label: https://..." paragraph belongs in the links section, not the body
  const finalBlocks: DescBlock[] = [];
  for (const b of blocks) {
    if (b.type === "paragraph") {
      const m = b.text.match(/^(?:([\p{L}][\p{L}0-9'()\-. ]{1,44}?)\s*:\s*)?(https?:\/\/\S+)$/u);
      if (m) {
        links.push({ label: m[1] ? soft(m[1]) : "En savoir plus", value: m[2] });
        continue;
      }
    }
    finalBlocks.push(b);
  }

  return { fields, links, blocks: finalBlocks };
}

export function stripTitleDuplicates(parsed: ParsedDescription, title: string) {
  const t = normalizeForCompare(title);
  parsed.fields = parsed.fields.filter(
    (f) => !(/^titre$/i.test(f.label) && normalizeForCompare(f.value) === t),
  );
  const first = parsed.blocks[0];
  if (first && first.type === "paragraph" && t.length > 10) {
    const n = normalizeForCompare(first.text);
    if (n === t) {
      parsed.blocks.shift();
    } else if (n.startsWith(t)) {
      const esc = title
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\s+/g, "\\s+");
      const rest = first.text.replace(new RegExp(`^${esc}\\s*`, "i"), "").trim();
      if (rest === "") parsed.blocks.shift();
      else parsed.blocks[0] = { ...first, text: rest };
    }
  }
}

function decodeText(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}

export async function fetchDescription(url: string): Promise<ParsedDescription | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return parseDescription(decodeText(await res.arrayBuffer()));
  } catch {
    return null;
  }
}

export function originalUrlFor(sourceId: string): string | null {
  // sourceId looks like "waga:offres/S1006.txt" or "waga:<url>"
  const ref = sourceId.replace(/^waga:/, "");
  if (/^https?:\/\//.test(ref)) return ref;
  return new URL(ref, WAGA_OFFRES_URL).href;
}
