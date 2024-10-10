import { Button, ControlGroup, InputGroup, NonIdealState, Spinner, SpinnerSize, Tag } from "@blueprintjs/core";
import { memo, useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { App } from "../App";
import { Abbr } from "../components/interlinear";
import { Part } from "../lang/extra";
import { applyNormalize, FORM_NAMES, POSS_FORMS, POSS_SUFFIXES } from "../lang/inflection";
import { InflEntry, useInflEntries } from "../lang/inflEntries";
import { uri } from "../lang/util";
import { Dictionary, FullEntry } from "../providers/dictionary";

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
  const formName = FORM_NAMES[entry.original.part!][entry.form].replaceAll("_", " ").toUpperCase();
  const partName = Part[entry.original.part!].toLowerCase();
  const cls = entry.original.class;
  const className = entry.old ? `type ${cls}` : `type ${cls}`; // TODO: actual old names

  return (
    <>
      <i>{entry.sol}</i>: {entry.old && <Tag intent="warning">old</Tag>} <Abbr>{formName}</Abbr> of {className}{" "}
      {partName} <i>{entry.original.sol}</i>
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

function poss(original: string, cut: string, form: string, old: boolean, children: React.ReactNode[]) {
  return (
    <>
      <i>{original}</i>: {old && <Tag intent="warning">old</Tag>} <Abbr>{form}</Abbr> possessive of <i>{cut}</i>
      <ul>
        {children.map((i, j) => (
          <li key={j}>{i}</li>
        ))}
      </ul>
    </>
  );
}

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
  const lookup = (q: string, { only, old }: { only?: Part; old?: boolean } = {}) => {
    const inflMatches = infl.filter(
      (i) =>
        i.sol === q &&
        (!i.old || includeOld) &&
        i.form !== 0 &&
        (only === undefined || i.original.part === only) &&
        (old === undefined || old === i.old),
    );
    const rawMatches = raw.filter((i) => i.sol === q && (only === undefined || i.part === only));

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
    "Reverse",
  );
}
