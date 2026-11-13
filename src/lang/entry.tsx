import { Checkbox, Classes, FormGroup, H4, InputGroup, Tag } from "@blueprintjs/core";
import { useEffect, useState } from "react";

import { EditField, EntryStatus, GeneratedField, NewWordExtra } from "common/types";
import { NounInfo } from "components/nounComponents";
import { PronounInfo } from "components/pronounComponents";
import { VerbInfo } from "components/verbComponents";
import { FullEntry } from "providers/dictionary";

import { determinePattern, Part, partOfExtra, patternNames, separateRoot } from "./extra";
import { FORM_NAMES, InflectableEntry } from "./inflection";

export function generatedFields(entry: FullEntry): readonly GeneratedField[] {
  return [["part", entry.part === null ? null : Part[entry.part]]];
}

export const EXTRA_EDIT_FIELDS: readonly EditField[] = [];

export function entryStatus(_entry: FullEntry): readonly EntryStatus[] {
  return [];
}

export function EntryContent({ entry }: { entry: FullEntry }) {
  let table;
  if (entry.part === Part.Noun) {
    table = <NounInfo entry={entry} />;
  } else if (entry.part === Part.Verb) {
    table = <VerbInfo entry={entry} />;
  } else if (entry.part === Part.Pronoun) {
    table = <PronounInfo entry={entry} />;
  } else {
    return null;
  }

  return <>
    <H4>Inflection tables</H4>
    {table}
  </>;
}

export function draftClass(sol: string, extra: string): string | null {
  return determinePattern(sol, partOfExtra(extra));
}

export function useNewWordExtra(sol: string, extra: string): NewWordExtra {
  const [showEx, setShowEx] = useState(false);
  const [exForms, setExForms] = useState<string[]>([]);
  const part = partOfExtra(extra);
  const pattern = determinePattern(sol, part);
  const names = patternNames(part, pattern);

  const entry: InflectableEntry = {
    part,
    extra,
    sol,
    ex: exForms.length === 0 ? undefined : exForms.join(","),
  };
  const valid = (part === null ? false : separateRoot(sol, part) !== null) || exForms.length > 0;

  useEffect(() => {
    if (showEx) {
      setExForms(part === null ? [] : Array(FORM_NAMES[part].length * 2).fill(""));
    } else {
      setExForms([]);
    }
  }, [part, showEx]);

  const content = <>
    {names !== null && part !== null && <p>
      Pattern {names[0]} {Part[part].toLowerCase()}
      <br />
      Old class {names[1]} {Part[part].toLowerCase()}
      <br />
      {names[2]}
    </p>}
    {showEx && part === null && <p className={Classes.TEXT_MUTED}>
      <i>This "Extra" value can't be exceptional.</i>
    </p>}
    {showEx && part !== null && <div className="flex-row">
      <div>
        {FORM_NAMES[part].map((i, j) => <FormGroup key={i} label={i} inline className="compact">
          <InputGroup placeholder={i} onValueChange={(v) => setExForms((e) => e.map((f, fi) => (fi === j ? v : f)))} />
        </FormGroup>)}
      </div>
      <div>
        {FORM_NAMES[part].map((i, j) => <FormGroup key={i} label={`old ${i}`} inline className="compact">
          <InputGroup
            placeholder={`old ${i}`}
            onValueChange={(v) => setExForms((e) => e.map((f, fi) => (fi === j + FORM_NAMES[part].length ? v : f)))}
          />
        </FormGroup>)}
      </div>
    </div>}
    {valid && part === Part.Noun && <NounInfo entry={entry} />}
    {valid && part === Part.Verb && <VerbInfo entry={entry} />}
    {valid && part === Part.Pronoun && <PronounInfo entry={entry} />}
    {!valid && part !== null && <Tag size="large" intent="danger">
      Invalid form
    </Tag>}
  </>;

  return {
    fields: <Checkbox onChange={(e) => setShowEx(e.currentTarget.checked)} label="Exceptional" />,
    content,
    data: { ex: entry.ex },
  };
}
