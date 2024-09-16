import { createContext, useContext, useState } from "react";
import { Dictionary, FullEntry, FullMeaning, FullSection } from "../dictionary";
import { useParams } from "react-router-dom";
import { App } from "../App";
import {
  Button,
  Callout,
  Classes,
  CompoundTag,
  ControlGroup,
  Divider,
  Drawer,
  InputGroup,
  NonIdealState,
  Popover,
  Spinner,
  SpinnerSize,
  TextArea,
} from "@blueprintjs/core";
import { User } from "../user";
import { Part } from "../lang/extra";
import { ApiBase, apiFetch, ApiSection } from "../api";
import { InterlinearData, InterlinearGloss } from "../components/interlinear";
import { WordSelect } from "../components/wordSelect";
import { RichText } from "../components/richText";

export enum SectionTitle {
  TRANSLATION = "translation",
  USAGE = "usage",
  ETYMOLOGY = "etymology"
}

function InfoTag({
  left,
  right,
  onClick,
  fixed = false,
  generated = false,
}: {
  left: string;
  right: React.ReactNode;
  onClick?: () => void;
  fixed?: boolean;
  generated?: boolean;
}) {
  const editable = !fixed && !generated;
  return (
    <>
      <CompoundTag
        leftContent={left}
        intent={fixed ? "danger" : generated ? "success" : "primary"}
        icon={fixed ? "anchor" : generated ? "generate" : "draw"}
        interactive={editable}
        onClick={onClick}
        rightIcon={editable ? "edit" : undefined}
        large
      >
        {right === null ? <i>(null)</i> : right === undefined ? <i>(undefined)</i> : right}
      </CompoundTag>
      <br />
    </>
  );
}

function InfoSection({
  title,
  children,
  fixed = false,
  generated = false,
}: {
  title: string;
  children: React.ReactNode;
  fixed?: boolean;
  generated?: boolean;
}) {
  return (
    <Callout
      title={title}
      className="edit-section"
      intent={fixed ? "danger" : generated ? "success" : "primary"}
      icon={fixed ? "anchor" : generated ? "generate" : "draw"}
      compact
    >
      {children}
    </Callout>
  );
}

function EntryData({ v }: { v: FullEntry }) {
  const edit = useContext(EditContext);
  return (
    <>
      <BaseData v={v} />
      <InfoTag left="sol" right={v.sol} />
      <InfoTag left="extra" right={v.extra} />
      <InfoTag left="tag" right={v.tag} />
      <InfoSection title="meanings">
        {v.meanings.map((m, mi) => (
          <InfoSection title={`[${mi}]`} key={m.hash}>
            <MeaningData v={m} />
          </InfoSection>
        ))}
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
      <InfoTag left="script" right={<span className="sol">{v.script}</span>} generated />
      <InfoTag left="ipa" right={v.ipa} generated />
    </>
  );
}

function MeaningData({ v }: { v: FullMeaning }) {
  const edit = useContext(EditContext);
  return (
    <>
      <BaseData v={v} />
      <InfoTag left="eng" right={v.eng} onClick={() => edit.openDrawer(<MeaningEditor existing={v} />)} />
      <SectionableData v={v} />
    </>
  );
}

function SectionData({ v }: { v: FullSection }) {
  const edit = useContext(EditContext);
  return (
    <>
      <BaseData v={v} />
      <InfoTag left="title" right={v.title} fixed />
      <InfoTag left="content" right={v.content} />
      {v.title === SectionTitle.TRANSLATION && (
        <Button
          intent="warning"
          text="Edit translation section"
          icon="arrow-right"
          onClick={() =>
            edit.openDrawer(
              <TranslationSectionEditor as={v.hash} existing={JSON.parse(v.content) as InterlinearData} />
            )
          }
        />
      )}
      {v.title === SectionTitle.USAGE && (
        <Button
          intent="warning"
          text="Edit usage note section"
          icon="arrow-right"
          onClick={() => edit.openDrawer(<TextSectionEditor as={v.hash} content={v.content} title={v.title} />)}
        />
      )}
      {v.title === SectionTitle.ETYMOLOGY && (
        <Button
          intent="warning"
          text="Edit etymology section"
          icon="arrow-right"
          onClick={() => edit.openDrawer(<TextSectionEditor as={v.hash} content={v.content} title={v.title} />)}
        />
      )}
    </>
  );
}

interface Sectionable extends ApiBase {
  sections: ApiSection[];
}
function SectionableData({ v }: { v: Sectionable }) {
  const edit = useContext(EditContext);
  return (
    <>
      <InfoSection title="sections">
        {v.sections.map((s, si) => (
          <InfoSection title={`[${si}]`} key={s.hash}>
            <SectionData v={s} />
          </InfoSection>
        ))}
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
                <Button
                  intent="warning"
                  text="Usage note section"
                  onClick={() => edit.openDrawer(<TextSectionEditor to={v.hash} title={SectionTitle.USAGE} />)}
                />
                <Button
                  intent="warning"
                  text="Etymology section"
                  onClick={() => edit.openDrawer(<TextSectionEditor to={v.hash} title={SectionTitle.ETYMOLOGY} />)}
                />
              </ControlGroup>
            </div>
          }
          renderTarget={({ isOpen, ...targetProps }) => (
            <Button intent="warning" text="Create section" icon="add" {...targetProps} />
          )}
        />
      </InfoSection>
    </>
  );
}

function BaseData({ v }: { v: ApiBase }) {
  return (
    <>
      <InfoTag left="hash" right={v.hash} fixed />
      <InfoTag left="created at" right={v.created_at} fixed />
      <InfoTag left="updated at" right={v.updated_at} fixed />
    </>
  );
}

function TranslationSectionEditor({ to, as, existing }: { to?: string; as?: string; existing?: InterlinearData }) {
  const edit = useContext(EditContext);
  const dict = useContext(Dictionary);
  const [sol, setSol] = useState(existing?.sol ?? "");
  const [solSep, setSolSep] = useState(existing?.solSep ?? "");
  const [engSep, setEngSep] = useState(existing?.engSep ?? "");
  const [eng, setEng] = useState(existing?.eng ?? "");
  const data: InterlinearData = {
    sol,
    solSep,
    engSep,
    eng,
  };

  if (to === undefined && as === undefined) {
    throw new Error("One of `as` or `to` must be provided");
  }

  const submit = () => {
    apiFetch("/section", "POST", { to, as, title: SectionTitle.TRANSLATION, content: JSON.stringify(data) }).then(
      () => {
        dict.refresh();
        edit.closeDrawer();
      }
    );
  };

  return (
    <div className="inter">
      {to && (
        <p>
          Adding new translation section to <code>{to}</code>.
        </p>
      )}
      {as && (
        <p>
          Editing translation section <code>{as}</code>.
        </p>
      )}
      <InputGroup onValueChange={setSol} defaultValue={sol} placeholder="Sentence" />
      <InputGroup onValueChange={setSolSep} defaultValue={solSep} placeholder="Interlinearised sentence" />
      <InputGroup onValueChange={setEngSep} defaultValue={engSep} placeholder="Interlinearised translation" />
      <InputGroup onValueChange={setEng} defaultValue={eng} placeholder="Translation" />
      <Button fill intent="success" text="Submit" onClick={submit} />
      <Divider />
      <InterlinearGloss data={data} asterisk />
    </div>
  );
}

function TextSectionEditor({
  to,
  as,
  title,
  content: existingContent,
}: {
  to?: string;
  as?: string;
  title: string;
  content?: string;
}) {
  const edit = useContext(EditContext);
  const dict = useContext(Dictionary);
  const [content, setContent] = useState(existingContent ?? "");

  if (to === undefined && as === undefined) {
    throw new Error("One of `as` or `to` must be provided");
  }

  const submit = () => {
    apiFetch("/section", "POST", { to, as, title, content }).then(() => {
      dict.refresh();
      edit.closeDrawer();
    });
  };

  return (
    <div className="inter">
      {to && (
        <p>
          Adding new {title} text section to <code>{to}</code>.
        </p>
      )}
      {as && (
        <p>
          Editing {title} text section <code>{as}</code>.
        </p>
      )}
      {/* TODO: links */}
      <ControlGroup fill>
        <TextArea
          onChange={(e) => setContent(e.currentTarget.value)}
          value={content}
          placeholder={`Content for ${title}`}
          fill
        />
        <WordSelect onSelect={(t) => setContent((c) => `${c}[${t.hash}] (“${t.meanings[0].eng}”)`)} />
      </ControlGroup>
      <Button fill intent="success" text="Submit" onClick={submit} />
      <Divider />
      <RichText text={content} />
    </div>
  );
}

function MeaningEditor({ to, existing }: { to?: string; existing?: FullMeaning }) {
  const edit = useContext(EditContext);
  const dict = useContext(Dictionary);
  const [eng, setEng] = useState(existing?.eng ?? "");
  const as = existing?.hash;

  if (to === undefined && as === undefined) {
    throw new Error("One of `as` or `to` must be provided");
  }

  const submit = () => {
    apiFetch("/meaning", "POST", { to, as, eng }).then(() => {
      dict.refresh();
      edit.closeDrawer();
    });
  };

  return (
    <div className="inter">
      {to && (
        <p>
          Adding new meaning to <code>{to}</code>.
        </p>
      )}
      {as && (
        <p>
          Editing meaning <code>{as}</code>.
        </p>
      )}
      <InputGroup onValueChange={setEng} defaultValue={eng} placeholder="English" />
      <Button fill intent="success" text="Submit" onClick={submit} />
    </div>
  );
}

interface EditContextData {
  openDrawer: (element: React.ReactNode) => void;
  closeDrawer: () => void;
}

const EditContext = createContext<EditContextData>({
  openDrawer: () => {
    throw new Error("No edit drawer context provided");
  },
  closeDrawer: () => {
    throw new Error("No edit drawer context provided");
  },
});

function EditWordPageContent({ entry }: { entry: FullEntry }) {
  const [isOpen, setOpen] = useState(false);
  const [element, setElement] = useState<React.ReactNode>(null);

  const openDrawer = (element: React.ReactNode) => {
    setElement(element);
    setOpen(true);
  };

  const closeDrawer = () => setOpen(false);

  return (
    <EditContext.Provider value={{ openDrawer, closeDrawer }}>
      <EntryData v={entry} />
      <Drawer isOpen={isOpen} onClose={() => setOpen(false)}>
        {element}
      </Drawer>
    </EditContext.Provider>
  );
}

export default function EditWordPage() {
  const { entries } = useContext(Dictionary);
  const { word } = useParams() as { word: string };
  const { user } = useContext(User);

  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  if (!user) {
    content = <NonIdealState icon="error" title="You cannot access this page" />;
  } else if (entries) {
    const entry = entries.find((e) => e.sol === word);

    if (entry) {
      content = (
        <div className="inter">
          <EditWordPageContent entry={entry} />
        </div>
      );
    } else {
      content = <NonIdealState icon="error" title="Unknown word" description={word} />; // TODO
    }
  }

  return App(content, "Edit");
}
