import { createContext, useContext, useState } from "react";
import { Dictionary, FullEntry, FullMeaning, FullSection } from "../dictionary";
import { useNavigate, useParams } from "react-router-dom";
import { App } from "../App";
import {
  Button,
  Callout,
  Card,
  Classes,
  CompoundTag,
  Divider,
  Drawer,
  H3,
  InputGroup,
  NonIdealState,
  Popover,
  Spinner,
  SpinnerSize,
  Tag,
} from "@blueprintjs/core";
import { User } from "../user";
import { Part } from "../lang/extra";
import { ApiBase, apiFetch, ApiMeaning, ApiSection } from "../api";
import { InterlinearData, InterlinearGloss } from "../components/interlinear";

function InfoTag({
  left,
  right,
  fixed = false,
  generated = false,
}: {
  left: string;
  right: React.ReactNode;
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
  return (
    <>
      <BaseData v={v} />
      <InfoTag left="eng" right={v.eng} />
      <SectionableData v={v} />
    </>
  );
}

function SectionData({ v }: { v: FullSection }) {
  return (
    <>
      <BaseData v={v} />
      <InfoTag left="title" right={v.title} fixed />
      <InfoTag left="content" right={v.content} />
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
              <Button
                intent="warning"
                text="Translation section"
                onClick={() => edit.openDrawer(<CreateTranslationSection to={v.hash} />)}
              />
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

function CreateTranslationSection({ to }: { to: string }) {
  const dict = useContext(Dictionary);
  const [sol, setSol] = useState("");
  const [solSep, setSolSep] = useState("");
  const [engSep, setEngSep] = useState("");
  const [eng, setEng] = useState("");
  const data: InterlinearData = {
    sol,
    solSep,
    engSep,
    eng,
  };

  const submit = () => {
    apiFetch("/section", "POST", { to, title: "translation", content: JSON.stringify(data) }).then(() =>
      dict.refresh()
    );
  };

  return (
    <div className="inter">
      <p>
        Adding new translation section to <code>{to}</code>.
      </p>
      <InputGroup onValueChange={setSol} placeholder="Sentence" />
      <InputGroup onValueChange={setSolSep} placeholder="Interlinearised sentence" />
      <InputGroup onValueChange={setEngSep} placeholder="Interlinearised translation" />
      <InputGroup onValueChange={setEng} placeholder="Translation" />
      <Button fill intent="success" text="Submit" onClick={submit} />
      <Divider />
      <InterlinearGloss data={data} />
    </div>
  );
}

interface EditContextData {
  openDrawer: (element: React.ReactNode) => void;
}

const EditContext = createContext<EditContextData>({
  openDrawer: () => {
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

  return (
    <EditContext.Provider value={{ openDrawer }}>
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
