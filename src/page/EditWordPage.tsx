import {
  Button,
  Checkbox,
  Classes,
  Code,
  ControlGroup,
  Divider,
  InputGroup,
  NonIdealState,
  Popover,
  Spinner,
  SpinnerSize,
  Tag,
  TextArea,
} from "@blueprintjs/core";
import {
  ApiBase,
  ApiSection,
  BaseData,
  EditWordPageContent,
  InfoSection,
  InfoTag,
  InterlinearData,
  InterlinearGloss,
  RichText,
  useEditContext,
  useTitle,
  WordSelect,
} from "conlang-web-components";
import { ReactElement, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Part } from "lang/extra";
import { Dictionary, FullEntry, FullMeaning, FullSection } from "providers/dictionary";
import { API, LANGUAGE } from "api";

export enum SectionTitle {
  TRANSLATION = "translation",
  USAGE = "usage",
  ETYMOLOGY = "etymology",
  INSTEAD = "instead",
  COORDINATE = "coordinate",
}

export const SIMPLE_SECTIONS = [
  [SectionTitle.USAGE, "Usage note", { icon: "info-sign" }],
  [SectionTitle.ETYMOLOGY, "Etymology", { icon: "book" }],
  [SectionTitle.INSTEAD, "Use instead", { icon: "flow-end", intent: "danger" }],
  [SectionTitle.COORDINATE, "Coordinate terms", { icon: "compass" }],
] as const;

function EntryData({ v }: { v: FullEntry }) {
  const edit = useEditContext();
  return <>
    <BaseData v={v} />
    <InfoTag left="sol" right={v.sol} onClick={() => edit.openDrawer(<EntryEditor existing={v} />)} />
    <InfoTag left="extra" right={v.extra} onClick={() => edit.openDrawer(<EntryEditor existing={v} />)} />
    <InfoTag left="tag" right={v.tag} onClick={() => edit.openDrawer(<EntryEditor existing={v} />)} />
    <InfoTag left="ex" right={v.ex} onClick={() => edit.openDrawer(<EntryEditor existing={v} />)} />
    <InfoSection title="meanings">
      {v.meanings.map((m, mi) => <InfoSection title={`[${mi}]`} key={m.hash}>
        <MeaningData v={m} />
      </InfoSection>)}
      <Divider />
      <Button
        intent="warning"
        text="Add new meaning"
        icon="add"
        onClick={() => edit.openDrawer(<MeaningEditor to={v.hash} />)}
      />
    </InfoSection>
    <SectionableData v={v} />
    <Divider />
    <InfoTag left="part" right={v.part === null ? null : Part[v.part]} generated />
    <InfoTag left="class" right={v.class} generated />
    <InfoTag left="script" right={<span lang="x-sol">{v.script}</span>} generated />
    <InfoTag left="ipa" right={v.ipa} generated />
  </>;
}

function MeaningData({ v }: { v: FullMeaning }) {
  const edit = useEditContext();
  return <>
    <BaseData v={v} />
    <InfoTag left="eng" right={v.eng} onClick={() => edit.openDrawer(<MeaningEditor existing={v} />)} />
    <SectionableData v={v} />
  </>;
}

function SectionData({ v }: { v: FullSection }) {
  const edit = useEditContext();
  const sectionDataEditorButton = useCallback((): readonly [ReactElement, () => void] => {
    const open = edit.openDrawer;
    const simple = SIMPLE_SECTIONS.find(([title]) => v.title === title);
    if (v.title === SectionTitle.TRANSLATION) {
      const data = JSON.parse(v.content) as InterlinearData;
      const handler = () => open(<TranslationSectionEditor as={v.hash} existing={data} />);
      const element = <Button intent="warning" text="Edit translation section" icon="arrow-right" onClick={handler} />;
      return [element, handler];
    } else if (simple !== undefined) {
      const [title, name] = simple;
      const handler = () => open(<TextSectionEditor as={v.hash} content={v.content} title={title} />);
      const element = <Button
        intent="warning"
        text={`Edit ${name.toLowerCase()} section`}
        icon="arrow-right"
        key={title}
        onClick={handler}
      />;
      return [element, handler];
    } else {
      const handler = () => {};
      const element = <Tag large intent="danger">
        Unknown section {v.title}.
      </Tag>;
      return [element, handler];
    }
  }, [edit.openDrawer, v.content, v.hash, v.title]);
  const [button, handler] = sectionDataEditorButton();
  useEffect(() => {
    if (edit.active === v.hash && !edit.drawerOpen) {
      handler();
    }
  }, [edit.active, v.hash, handler, edit.drawerOpen]);
  return <>
    <BaseData v={v} />
    <InfoTag left="title" right={v.title} fixed />
    <InfoTag left="content" right={v.content} fixed />
    {button}
  </>;
}

interface Sectionable extends ApiBase {
  sections: ApiSection[];
}
function SectionableData({ v }: { v: Sectionable }) {
  const edit = useEditContext();
  return <>
    <InfoSection title="sections">
      {v.sections.map((s, si) => <InfoSection title={`[${si}]`} key={s.hash}>
        <SectionData v={s} />
      </InfoSection>)}
      <Divider />
      <Popover
        popoverClassName={Classes.POPOVER_CONTENT_SIZING}
        content={
          <div>
            <ControlGroup vertical>
              <Button
                intent="warning"
                text="Translation section"
                onClick={() => edit.openDrawer(<TranslationSectionEditor to={v.hash} />)}
              />
              {SIMPLE_SECTIONS.map(([title, name]) => <Button
                intent="warning"
                text={`${name} section`}
                key={title}
                onClick={() => edit.openDrawer(<TextSectionEditor to={v.hash} title={title} />)}
              />)}
            </ControlGroup>
          </div>
        }
        renderTarget={({ isOpen, ...targetProps }) => <Button
          intent="warning"
          text="Create section"
          icon="add"
          {...targetProps}
        />}
      />
    </InfoSection>
  </>;
}

type SectionEditorProps = {
  to?: string;
  as?: string;
  name: string;
  form: ReactNode;
  preview: ReactNode;
  data: () => { title: string; content: string };
};
function SectionEditor({ to, as, name, form, preview, data }: SectionEditorProps) {
  const edit = useEditContext();
  const dict = useContext(Dictionary);

  if (to === undefined && as === undefined) {
    throw new Error("One of `as` or `to` must be provided");
  }

  const doSubmit = () => {
    API.lang("/section", "POST", { to, as, ...data() }).then(() => {
      dict.refresh();
      edit.closeDrawer();
    });
  };

  const doDelete = () => {
    if (as === undefined) {
      throw new Error("Cannot delete nonexistent section");
    }
    API.lang(`/section/${as}`, "DELETE").then(() => {
      dict.refresh();
      edit.closeDrawer();
    });
  };

  return <div className="inter sidebar">
    {to && <p>
      Adding new {name} section to <Code>{to}</Code>.
    </p>}
    {as && <p>
      Editing {name} section <Code>{as}</Code>.
    </p>}
    {form}
    <Button fill intent="success" text="Submit" onClick={doSubmit} />
    <Divider />
    {preview}
    {as && <Button fill className="bottom" intent="danger" icon="trash" text="Delete entry" onClick={doDelete} />}
  </div>;
}

function TranslationSectionEditor({ to, as, existing }: { to?: string; as?: string; existing?: InterlinearData }) {
  const [sol, setSol] = useState(existing?.sol ?? "");
  const [solSep, setSolSep] = useState(existing?.solSep ?? "");
  const [engSep, setEngSep] = useState(existing?.engSep ?? "");
  const [eng, setEng] = useState(existing?.eng ?? "“”");
  const data: InterlinearData = {
    sol,
    solSep,
    engSep,
    eng,
  };

  const createData = () => ({
    title: SectionTitle.TRANSLATION,
    content: JSON.stringify(data),
  });
  const form = <>
    <InputGroup onValueChange={setSol} defaultValue={sol} placeholder="Sentence" />
    <InputGroup onValueChange={setSolSep} defaultValue={solSep} placeholder="Interlinearised sentence" />
    <InputGroup onValueChange={setEngSep} defaultValue={engSep} placeholder="Interlinearised translation" />
    <InputGroup onValueChange={setEng} defaultValue={eng} placeholder="Translation" />
  </>;
  const preview = <InterlinearGloss data={data} asterisk script />;

  return <SectionEditor to={to} as={as} name="translation" form={form} preview={preview} data={createData} />;
}

function TextSectionEditor({
  to,
  as,
  title,
  content: existingContent,
}: {
  to?: string;
  as?: string;
  title: SectionTitle;
  content?: string;
}) {
  const edit = useEditContext();
  const [content, setContent] = useState(existingContent ?? "");

  const createData = () => ({ title, content });
  const form = <ControlGroup fill>
    <TextArea
      onChange={(e) => setContent(e.currentTarget.value)}
      value={content}
      placeholder={`Content for ${title}`}
      fill
    />
    <WordSelect onSelect={(t) => setContent((c) => `${c}[${t.hash}] (“${t.meanings[0]?.eng}”)`)} />
  </ControlGroup>;
  const preview = <RichText text={content} on={edit.page} />;

  return <SectionEditor to={to} as={as} name={`${title} text`} form={form} preview={preview} data={createData} />;
}

function EntryEditor({ existing }: { existing: FullEntry }) {
  const edit = useEditContext();
  const dict = useContext(Dictionary);
  const [sol, setSol] = useState(existing.sol);
  const [extra, setExtra] = useState(existing.extra);
  const [isObsolete, setObsolete] = useState(existing.tag === "obsolete");
  const as = existing.hash;

  const submit = () => {
    API.lang("/entry", "POST", { as, sol, extra, tag: isObsolete ? "obsolete" : undefined }).then(() => {
      dict.refresh();
      edit.closeDrawer();
    });
  };

  return <div className="inter">
    <p>
      Editing entry <Code>{as}</Code>.
    </p>
    <InputGroup onValueChange={setSol} defaultValue={sol} placeholder={LANGUAGE} />
    <InputGroup onValueChange={setExtra} defaultValue={extra} placeholder="Extra" />
    <Checkbox onChange={(e) => setObsolete(e.currentTarget.checked)} defaultValue={extra} label="Obsolete" />
    <Button fill intent="success" text="Submit" onClick={submit} />
  </div>;
}

function MeaningEditor({ to, existing }: { to?: string; existing?: FullMeaning }) {
  const edit = useEditContext();
  const dict = useContext(Dictionary);
  const [eng, setEng] = useState(existing?.eng ?? "");
  const as = existing?.hash;

  if (to === undefined && as === undefined) {
    throw new Error("One of `as` or `to` must be provided");
  }

  const submit = () => {
    API.lang("/meaning", "POST", { to, as, eng }).then(() => {
      dict.refresh();
      edit.closeDrawer();
    });
  };

  return <div className="inter">
    {to && <p>
      Adding new meaning to <Code>{to}</Code>.
    </p>}
    {as && <p>
      Editing meaning <Code>{as}</Code>.
    </p>}
    <InputGroup onValueChange={setEng} defaultValue={eng} placeholder="English" />
    <Button fill intent="success" text="Submit" onClick={submit} />
  </div>;
}

export default function EditWordPage() {
  const { entries } = useContext(Dictionary);
  const { hash, edit } = useParams() as { hash: string; edit?: string };
  useTitle("Edit");

  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  if (entries) {
    const entry = entries.find((e) => e.hash === hash);

    if (entry) {
      content = <div className="inter">
        <EditWordPageContent entry={entry} active={edit}>
          <EntryData v={entry} />
        </EditWordPageContent>
      </div>;
    } else {
      content = <NonIdealState icon="error" title="Unknown word" description={hash} />; // TODO
    }
  }

  return content;
}
