import { Button, ControlGroup, InputGroup, NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { memo, useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { App } from "../App";
import { Dictionary, FullEntry } from "../dictionary";
import { Part } from "../lang/extra";
import { applyNormalize, FORM_NAMES } from "../lang/inflection";
import { uri } from "..";
import { InflEntry, useInflEntries } from "../lang/inflEntries";

function terminal(entry: FullEntry) {
  let meaning = entry.meanings[0].eng;
  if (entry.meanings.length > 1) {
    meaning += "; ...";
  }
  return (
    <>
      <a href={uri`#/w/${entry.sol}`}>
        <i>{entry.sol}</i>
      </a>
      : ({entry.extra}) "{meaning}"
    </>
  );
}

function inflNode(entry: InflEntry) {
  const formName = FORM_NAMES[entry.original.part!][entry.form].replaceAll("_", " ");
  const partName = Part[entry.original.part!].toLowerCase();
  const cls = entry.original.class;
  const className = entry.old ? `old type ${cls}` : `type ${cls}`; // TODO: actual old names

  return (
    <>
      <i>{entry.sol}</i>: {formName} of {className} {partName} <i>{entry.original.sol}</i>
      <ul>
        <li>{terminal(entry.original)}</li>
      </ul>
    </>
  );
}

function echo(original: string, cut: string, children: React.ReactNode[]) {
  return (
    <>
      <i>{original}</i>: echo prefixed form of <i>{cut}</i>
      <ul>
        {children.map((i, j) => (
          <li key={j}>{i}</li>
        ))}
      </ul>
    </>
  );
}

function poss(original: string, cut: string, form: string, children: React.ReactNode[]) {
  return (
    <>
      <i>{original}</i>: {form} possessive of <i>{cut}</i>
      <ul>
        {children.map((i, j) => (
          <li key={j}>{i}</li>
        ))}
      </ul>
    </>
  );
}

const POSS_SUFFIXES = {
  cur: ["àl", "it", "ys", "erd", "itar", "usd"],
  old: ["elm", "etr", "usd", "usan", "ys", "elmes", "etres", "usdes"],
} as const;
const POSS_FORMS = {
  cur: ["1sg", "2sg", "3sg", "1pl", "2pl", "3pl"],
  old: ["1sg", "2sg", "3sg masculine", "3sg feminine", "3sg neuter", "1pl", "2pl", "3pl"].map((i) => `old ${i}`),
} as const;

const ReverseContent = memo(function ReverseContent({
  infl,
  raw,
  query,
  includeOld,
}: {
  infl: InflEntry[];
  raw: FullEntry[];
  query: string;
  includeOld: boolean;
}) {
  const lookup = (q: string, { verbOnly = false, oldEquals }: { verbOnly?: boolean; oldEquals?: boolean } = {}) => {
    let inflMatches = infl.filter(
      (i) =>
        i.sol === q &&
        (!i.old || includeOld) &&
        i.form !== 0 &&
        (!verbOnly || i.original.part === Part.Verb) &&
        (oldEquals === undefined || oldEquals === i.old)
    );
    let rawMatches = raw.filter((i) => i.sol === q && (!verbOnly || i.part === Part.Verb));

    return rawMatches.map(terminal).concat(inflMatches.map(inflNode));
  };

  const r = lookup(query);

  if (applyNormalize(query) === query) {
    if (query.startsWith("fy") && query.length > 2 && !"aeiouyàáéíóúý".includes(query[2])) {
      const cut = applyNormalize(query.slice(2));
      const rc = lookup(cut, { verbOnly: true });
      if (rc.length > 0) {
        r.push(echo(query, cut, rc));
      }
    }

    if (query.startsWith("fyn") && query.length > 3 && "aeiouyàáéíóúý".includes(query[3])) {
      const cut = applyNormalize(query.slice(3));
      const rc = lookup(cut, { verbOnly: true });
      if (rc.length > 0) {
        r.push(echo(query, cut, rc));
      }
    }

    POSS_SUFFIXES.cur.forEach((suffix, i) => {
      if (query.endsWith(suffix)) {
        const cut = applyNormalize(query.slice(0, -suffix.length));
        const rc = lookup(cut, { oldEquals: false });
        if (rc.length > 0) {
          r.push(poss(query, cut, POSS_FORMS.cur[i], rc));
        }
      }
    });

    POSS_SUFFIXES.old.forEach((suffix, i) => {
      if (query.endsWith(suffix)) {
        const cut = applyNormalize(query.slice(0, -suffix.length));
        const rc = lookup(cut, { oldEquals: true });
        if (rc.length > 0) {
          r.push(poss(query, cut, POSS_FORMS.old[i], rc));
        }
      }
    });
  }

  if (r.length === 0) {
    return <NonIdealState icon="cross-circle" title="No results" />;
  } else {
    return (
      <ul>
        {r.map((i, j) => (
          <li key={j}>{i}</li>
        ))}
      </ul>
    );
  }
});

export default function ReversePage() {
  const { entries } = useContext(Dictionary);
  const { query } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState(query ?? "");
  const [includeOld, setIncludeOld] = useState(false);
  const infl = useInflEntries();

  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  if (query === undefined) {
    content = <NonIdealState icon="search" />;
  } else if (entries && infl) {
    // TODO: multiple words
    content = <ReverseContent key="content" infl={infl} raw={entries} query={query} includeOld={includeOld} />;
  }

  return App(
    <div className="inter">
      <form
        onSubmit={(e) => {
          navigate(uri`/reverse/${search}`);
          e.preventDefault();
        }}
      >
        <ControlGroup fill>
          <InputGroup
            placeholder={infl ? `Reverse search (${infl.length} forms)` : undefined}
            onValueChange={(s) => setSearch(s)}
            value={search}
            large
            fill
            rightElement={
              <Button
                icon={includeOld ? "eye-on" : "eye-off"}
                intent="warning"
                minimal={true}
                onClick={() => setIncludeOld((c) => !c)}
                title="Old forms"
              />
            }
          />
          <Button icon="arrow-right" intent="primary" type="submit" />
        </ControlGroup>
      </form>
      {content}
    </div>,
    "Reverse"
  );
}
