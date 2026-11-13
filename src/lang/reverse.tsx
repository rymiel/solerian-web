import { Button, Tag } from "@blueprintjs/core";
import { Abbr } from "conlang-web-components";
import { ReactNode, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ReverseLookup, ReverseResult } from "common/types";
import { FullEntry } from "providers/dictionary";

import { Part, patternNames } from "./extra";
import { applyNormalize, FORM_NAMES, POSS_FORMS, POSS_SUFFIXES } from "./inflection";
import { InflEntry, useInflEntries } from "./inflEntries";

function terminal(entry: FullEntry) {
  let meaning = entry.meanings[0].eng;
  if (entry.meanings.length > 1) {
    meaning += "; ...";
  }
  const tag = entry.tag === undefined ? undefined : <Tag intent="danger">{entry.tag}</Tag>;
  return <>
    <Link to={entry.link}>
      <i>{entry.sol}</i>
    </Link>
    : {tag} ({entry.extra}) "{meaning}"
  </>;
}

function inflNode(entry: InflEntry) {
  const part = entry.original.part!;
  const formName = FORM_NAMES[part][entry.form].replaceAll("_", " ").toUpperCase();
  const partName = Part[part].toLowerCase();
  const pattern = entry.original.class!;
  const names = patternNames(part, pattern);
  const className = entry.old ? `old class ${names[1]}` : `pattern ${names[0]}`;

  return <>
    <i>{entry.sol}</i>: {entry.old && <Tag intent="warning">old</Tag>} <Abbr>{formName}</Abbr> of{" "}
    <span title={names[2]}>
      {className} {partName}
    </span>{" "}
    <i>{entry.original.sol}</i>
    <ul>
      <li>{terminal(entry.original)}</li>
    </ul>
  </>;
}

function echo(original: string, cut: string, children: React.ReactNode[]) {
  return <>
    <i>{original}</i>: echo prefixed form of <i>{cut}</i>
    <ul>{children.map((i, j) => <li key={j}>{i}</li>)}</ul>
  </>;
}

function poss(original: string, cut: string, form: string, old: boolean, children: React.ReactNode[]) {
  return <>
    <i>{original}</i>: {old && <Tag intent="warning">old</Tag>} <Abbr>{form}</Abbr> possessive of <i>{cut}</i>
    <ul>{children.map((i, j) => <li key={j}>{i}</li>)}</ul>
  </>;
}

function solerianLookup(
  infl: readonly InflEntry[],
  raw: readonly FullEntry[],
  includeOld: boolean,
  query: string,
): ReverseResult {
  const found: FullEntry[] = [];
  const particles = raw.filter((i) => i.extra === "particle");
  const lookup = (q: string, { only, old }: { only?: Part; old?: boolean } = {}): ReactNode[] => {
    const inflMatches = infl.filter(
      (i) =>
        i.sol === q &&
        (!i.old || includeOld) &&
        i.form !== 0 &&
        (only === undefined || i.original.part === only) &&
        (old === undefined || old === i.old),
    );
    const rawMatches = raw.filter((i) => i.sol === q && (only === undefined || i.part === only));
    found.push(...rawMatches, ...inflMatches.map((i) => i.original));

    return rawMatches.map(terminal).concat(inflMatches.map(inflNode));
  };

  const r = lookup(query);

  if (applyNormalize(query) === query) {
    if (query.startsWith("fy") && query.length > 2 && !"aeiouyàáéíóúý".includes(query[2])) {
      const cut = applyNormalize(query.slice(2));
      const rc = lookup(cut, { only: Part.Verb });
      if (rc.length > 0) {
        r.push(echo(query, cut, rc));
      }
    }

    if (query.startsWith("fyn") && query.length > 3 && "aeiouyàáéíóúý".includes(query[3])) {
      const cut = applyNormalize(query.slice(3));
      const rc = lookup(cut, { only: Part.Verb });
      if (rc.length > 0) {
        r.push(echo(query, cut, rc));
      }
    }

    POSS_SUFFIXES.cur.forEach((suffix, i) => {
      if (query.endsWith(suffix)) {
        const cut = applyNormalize(query.slice(0, -suffix.length));
        const rc = lookup(cut, { old: false, only: Part.Noun });
        if (rc.length > 0) {
          r.push(poss(query, cut, POSS_FORMS.cur[i], false, rc));
        }
      }
    });

    if (includeOld) {
      POSS_SUFFIXES.old.forEach((suffix, i) => {
        if (query.endsWith(suffix)) {
          const cut = applyNormalize(query.slice(0, -suffix.length));
          const rc = lookup(cut, { old: true, only: Part.Noun });
          if (rc.length > 0) {
            r.push(poss(query, cut, POSS_FORMS.old[i], true, rc));
          }
        }
      });
    }
  }

  for (const p of particles) {
    if (p.sol.endsWith("-")) {
      if (query === p.sol.slice(0, -1)) {
        r.push(terminal(p));
        found.push(p);
      }
    }
  }

  return { items: r, entries: found };
}

function calculateFormsCount(infl: readonly InflEntry[] | null): string {
  if (infl === null) {
    return "...";
  }

  let oldNouns = 0;
  let curNouns = 0;
  let verbs = 0;
  for (const e of infl) {
    if (e.original.part === Part.Noun && e.old) {
      oldNouns++;
    } else if (e.original.part === Part.Noun && !e.old) {
      curNouns++;
    } else if (e.original.part === Part.Verb) {
      verbs++;
    }
  }
  // raw forms + echo prefix + possessive suffixes
  const estimate = infl.length + verbs + curNouns * POSS_SUFFIXES.cur.length + oldNouns * POSS_SUFFIXES.old.length;
  return `${infl.length} forms, ${estimate} estimated`;
}

export function useReverseLookup(entries: readonly FullEntry[] | null): ReverseLookup {
  const [includeOld, setIncludeOld] = useState(false);
  const infl = useInflEntries();
  const lookup = useMemo(() => {
    if (entries === null || infl === null) return null;
    return (query: string) => solerianLookup(infl, entries, includeOld, query);
  }, [entries, infl, includeOld]);
  const controls = <Button
    icon={includeOld ? "eye-on" : "eye-off"}
    intent="warning"
    minimal={true}
    onClick={() => setIncludeOld((c) => !c)}
    title="Old forms"
  />;

  return { formsCount: calculateFormsCount(infl), controls, lookup };
}
