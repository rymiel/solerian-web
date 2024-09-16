import { useContext } from "react";
import { Dictionary, FullEntry, FullSection } from "../dictionary";
import { useNavigate, useParams } from "react-router-dom";
import { App } from "../App";
import { Button, H2, H3, H4, Icon, IconSize, NonIdealState, Spinner, SpinnerSize, Tag } from "@blueprintjs/core";
import { Part } from "../lang/extra";
import { NounInfo } from "../components/nounComponents";
import { VerbInfo } from "../components/verbComponents";
import { User } from "../user";
import { InterlinearData, InterlinearGloss } from "../components/interlinear";
import { SectionTitle } from "./EditWordPage";
import { uri } from "..";
import { RichText } from "../components/richText";

const WORD_TYPES: Readonly<Record<string, string>> = {
  N: "Noun",
  V: "Verb",
  NAME: "Onomatonym",
  "N+NAME": "Name and onomatonym", // TODO: handle better
};

function SectionContent({ section }: { section: FullSection }) {
  if (section.title === SectionTitle.TRANSLATION) {
    const data = JSON.parse(section.content) as InterlinearData;
    return <InterlinearGloss data={data} asterisk link indent />;
  } else if (section.title === SectionTitle.USAGE) {
    return (
      <>
        <H4>
          Usage notes <Icon icon="info-sign" size={IconSize.LARGE} />
        </H4>
        <RichText text={section.content} />
      </>
    );
  } else if (section.title === SectionTitle.ETYMOLOGY) {
    return (
      <>
        <H4>
          Etymology <Icon icon="book" size={IconSize.LARGE} />
        </H4>
        <RichText text={section.content} />
      </>
    );
  } else if (section.title === SectionTitle.INSTEAD) {
    return (
      <>
        <H4>
          Use instead <Icon icon="flow-end" size={IconSize.LARGE} intent="danger" />
        </H4>
        <RichText text={section.content} />
      </>
    );
  } else {
    return (
      <Tag large intent="danger">
        Unknown section {section.title}.
      </Tag>
    );
  }
}

function WordPageContent({ entry }: { entry: FullEntry }) {
  const { user } = useContext(User);
  const navigate = useNavigate();

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
      <H2>{entry.sol}</H2>
      <p className="sol space-right">{entry.script}</p>
      <span className="space-right">{entry.ipa}</span>
      {user && <Button intent="primary" text="Edit" icon="edit" onClick={() => navigate(uri`/edit/${entry.sol}`)} />}
      <H3>{partHeader}</H3>
      {entry.tag && (
        <Tag large intent="danger">
          {entry.tag}
        </Tag>
      )}
      <ul>
        {entry.meanings.map((m) => (
          <li key={m.hash}>
            <p>{m.eng}</p>
            {m.sections.length > 0 && (
              <dl>
                {m.sections.map((s) => (
                  <dd key={s.hash}>
                    <SectionContent section={s} />
                  </dd>
                ))}
              </dl>
            )}
          </li>
        ))}
      </ul>
      {entry.sections.map((s) => (
        <SectionContent section={s} key={s.hash} />
      ))}
      {table !== null && <H4>Inflection tables</H4>}
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
