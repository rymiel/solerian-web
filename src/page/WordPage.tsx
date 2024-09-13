import { useContext } from "react";
import { Dictionary, FullEntry } from "../dictionary";
import { useParams } from "react-router-dom";
import { App } from "../App";
import { H3, NonIdealState, Spinner, SpinnerSize, Tag } from "@blueprintjs/core";
import { Part } from "../lang/extra";
import { NounInfo } from "../components/nounComponents";
import { VerbInfo } from "../components/verbComponents";

const WORD_TYPES: Readonly<Record<string, string>> = {
  N: "Noun",
  V: "Verb",
  NAME: "Onomatonym",
  "N+NAME": "Name and onomatonym", // TODO: handle better
};

function WordPageContent({ entry }: { entry: FullEntry }) {
  const partName = WORD_TYPES[entry.extra] ?? entry.extra;
  const partHeader = entry.class ? `${partName} (type ${entry.class})` : partName;
  const part = entry.part;
  let table = null;

  if (part === Part.Noun) {
    table = <NounInfo entry={entry} />;
  } else if (part === Part.Verb) {
    table = <VerbInfo entry={entry} />;
  }

  return (
    <>
      <span className="sol">{entry.script}</span>
      <p>{entry.ipa}</p>
      <H3>{partHeader}</H3>
      {entry.tag && (
        <Tag large intent="danger">
          {entry.tag}
        </Tag>
      )}
      <ul>
        {entry.meanings.map((m, mi) => (
          <li key={mi}>
            <p>{m.eng}</p>
          </li>
        ))}
      </ul>
      {table}
    </>
  );
}

export default function WordPage() {
  const { entries } = useContext(Dictionary);
  const { word } = useParams() as { word: string };

  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  if (entries) {
    const entry = entries.find((e) => e.sol === word);

    if (entry) {
      content = (
        <div className="inter">
          <WordPageContent entry={entry} />
        </div>
      );
    } else {
      content = <NonIdealState icon="error" title="Unknown word" description={word} />; // TODO
    }
  }

  return App(content, word);
}
