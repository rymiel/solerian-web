import { Button, ControlGroup, InputGroup, NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { App } from "../App";
import { Dictionary, FullEntry } from "../dictionary";
import { Part } from "../lang/extra";
import { FORM_NAMES } from "../lang/inflection";
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
    // TODO: posessive forms
    const lookup = (q: string) => {
      const inflMatches = infl.filter((i) => i.sol === q && (!i.old || includeOld) && i.form !== 0);
      const rawMatches = entries.filter((i) => i.sol === q);

      return rawMatches.map(terminal).concat(inflMatches.map(inflNode));
    };

    // TODO: multiple words
    const r = lookup(query);

    if (r.length === 0) {
      content = <NonIdealState icon="cross-circle" title="No results" />;
    } else {
      content = (
        <ul>
          {r.map((i, j) => (
            <li key={j}>{i}</li>
          ))}
        </ul>
      );
    }
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
