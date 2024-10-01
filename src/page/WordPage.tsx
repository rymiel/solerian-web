import { useContext } from "react";
import { Dictionary, FullEntry, FullSection } from "../providers/dictionary";
import { useParams } from "react-router-dom";
import { App } from "../App";
import { AnchorButton, H2, H3, H4, Icon, IconSize, NonIdealState, Spinner, SpinnerSize, Tag } from "@blueprintjs/core";
import { Part, PARTS_OF_SPEECH } from "../lang/extra";
import { NounInfo } from "../components/nounComponents";
import { VerbInfo } from "../components/verbComponents";
import { User } from "../providers/user";
import { InterlinearData, InterlinearGloss } from "../components/interlinear";
import { SectionTitle, SIMPLE_SECTIONS } from "./EditWordPage";
import { uri } from "..";
import { RichText } from "../components/richText";

function SectionContent({ section, on }: { section: FullSection; on: string }) {
  const simple = SIMPLE_SECTIONS.find(([title]) => section.title === title);
  if (section.title === SectionTitle.TRANSLATION) {
    const data = JSON.parse(section.content) as InterlinearData;
    return <InterlinearGloss data={data} asterisk link indent />;
  } else if (simple !== undefined) {
    const [, name, iconProps] = simple;
    return (
      <>
        <H4>
          {name} <Icon {...iconProps} size={IconSize.LARGE} />
        </H4>
        <RichText text={section.content} on={on} />
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

  const partHeader = (PARTS_OF_SPEECH[entry.extra] ?? entry.extra).replace("%", entry.class ?? "?");
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
      {user && <AnchorButton intent="primary" text="Edit" icon="edit" href={uri`#/edit/${entry.hash}`} />}
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
                    <SectionContent section={s} on={entry.hash} />
                  </dd>
                ))}
              </dl>
            )}
          </li>
        ))}
      </ul>
      {entry.sections.map((s) => (
        <SectionContent key={s.hash} section={s} on={entry.hash} />
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
        <div className="inter word">
          <WordPageContent entry={entry} />
        </div>
      );
    } else {
      content = <NonIdealState icon="error" title="Unknown word" description={word} />; // TODO
    }
  }

  return App(content, word);
}
