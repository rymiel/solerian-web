import { NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { useContext } from "react";
import { Link } from "react-router-dom";

import { InterlinearData, InterlinearGloss } from "components/interlinear";
import { Dictionary, FullEntry } from "providers/dictionary";
import { App } from "App";

import { SectionTitle } from "./EditWordPage";

function Content({ entries }: { entries: FullEntry[] }) {
  const examples = entries.flatMap((e) =>
    e.meanings
      .map((m, mi) => {
        const s = m.sections
          .filter((s) => s.title === SectionTitle.TRANSLATION)
          .map((s) => JSON.parse(s.content) as InterlinearData);
        if (s.length === 0) return null;
        return [e, mi + 1, s] as const;
      })
      .filter((i) => i !== null),
  );

  return (
    <>
      <p>This page lists all translations from all words with examples sentences in the dictionary.</p>
      <ul>
        {examples.map(([entry, nth, sentences]) => (
          <li key={`${entry.hash}-${nth}`}>
            <p>
              <Link to={entry.link}>{entry.sol}</Link> ({nth})
            </p>
            <dl>
              {sentences.map((sentence, i) => (
                <dd key={i}>
                  <InterlinearGloss data={sentence} asterisk link indent />
                </dd>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function TranslationsPage() {
  const { entries } = useContext(Dictionary);

  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  if (entries) {
    content = (
      <div className="inter">
        <Content entries={entries} />
      </div>
    );
  }

  return App(content, "Translations");
}
