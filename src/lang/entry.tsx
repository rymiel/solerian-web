import { H4 } from "@blueprintjs/core";

import { EditField, EntryStatus, GeneratedField } from "common/types";
import { NounInfo } from "components/nounComponents";
import { PronounInfo } from "components/pronounComponents";
import { VerbInfo } from "components/verbComponents";
import { FullEntry } from "providers/dictionary";

import { Part } from "./extra";

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
