import { Dialog, EntityTitle, HTMLTable, NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { App } from "../App";
import { PropsWithChildren, useContext, useState } from "react";
import { RawEntry } from "../api";
import { Part, separateRoot } from "../lang/extra";
import { scriptMultiUnicode } from "../lang/script";
import { soundChange } from "../lang/soundChange";
import { useNavigate, useParams } from "react-router";
import { applyFromSeparatedRoot, FORM_NAMES, FormNames } from "../lang/inflection";
import { Dictionary } from "../dictionary";

interface FullEntry extends RawEntry {
  part: Part | null;
  script: string;
  ipa: string;
}

const SLUGS: { [P in Part]: string } = {
  [Part.Noun]: "noun",
  [Part.Verb]: "verb",
};

function InflectionLink({ entry, children }: PropsWithChildren<{ entry: FullEntry }>) {
  return entry.part === null ? children : <a href={`#/${SLUGS[entry.part]}/${entry.sol}`}>{children}</a>;
}

interface DualInfo {
  sol: string;
  script: string;
  ipa: string;
}

function populateDualInfo(word: string): DualInfo {
  return {
    sol: word,
    script: scriptMultiUnicode(word),
    ipa: soundChange({ sol: word, extra: "" }), // TODO
  };
}

function NounTableEntry({ word }: { word: DualInfo }) {
  return (
    <td>
      <span className="dual">
        <a href={`#/poss/${word.sol}`}>
          <i>{word.sol}</i>
        </a>
        <span className="sol">{word.script}</span>
      </span>
      <p>{word.ipa}</p>
    </td>
  );
}

function NounTable({ forms }: { forms: readonly string[] }) {
  const infos = forms.map((i) => populateDualInfo(i)); // TODO (mark stress)
  const map = Object.fromEntries(FORM_NAMES[Part.Noun].map((k, i) => [k, infos[i]])) as Record<
    FormNames<Part.Noun>,
    DualInfo
  >;

  return (
    <HTMLTable compact bordered className="inflection">
      <tbody>
        <tr>
          <td className="rb"></td>
          <th className="hl db">sg</th>
          <th className="hl db">pl</th>
        </tr>
        <tr>
          <td className="hl rb">nom</td>
          <NounTableEntry word={map.nom_sg} />
          <NounTableEntry word={map.nom_pl} />
        </tr>
        <tr>
          <td className="hl rb">acc</td>
          <NounTableEntry word={map.acc_sg} />
          <NounTableEntry word={map.acc_pl} />
        </tr>
        <tr>
          <td className="hl rb">gen</td>
          <NounTableEntry word={map.gen_sg} />
          <NounTableEntry word={map.gen_pl} />
        </tr>
      </tbody>
    </HTMLTable>
  );
}

function NounDialog({ dictionary, noun }: { dictionary: FullEntry[] | null; noun: string }) {
  const navigate = useNavigate();
  const [isOpen, setOpen] = useState(true);

  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  let title = noun;

  const leave = () => navigate("/");
  const close = () => setOpen(false);

  const s = separateRoot(noun, Part.Noun);
  if (s === null) {
    content = <NonIdealState icon="error" />; // TODO
  } else {
    const forms = applyFromSeparatedRoot(s, true);
    title = `${title} | pattern ${s[2]} ${Part[s[1]].toLowerCase()}`;

    content = (
      <>
        <NounTable forms={forms.cur} />
        <NounTable forms={forms.old} />
      </>
    );
  }

  return (
    <Dialog isOpen={isOpen} onClosed={leave} onClose={close} title={<EntityTitle title={title} />}>
      {content}
    </Dialog>
  );
}

export default function HomePage() {
  const { entries } = useContext(Dictionary);
  const { noun, verb } = useParams() as { noun?: string; verb?: string };
  const navigate = useNavigate();

  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  let overlay = null;

  if (entries) {
    content = (
      <div className="inter">
        <HTMLTable className="margin-auto dictionary" compact striped interactive>
          <thead>
            <tr>
              <th>#</th>
              <th>English</th>
              <th>Solerian</th>
              <th>Extra</th>
              <th>Pronunciation</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.hash} onClick={() => navigate(`/w/${e.sol}`)}>
                <td>{i + 1}</td>
                <td>{e.eng}</td>
                <td className="dual">
                  <i>{e.sol}</i>
                  <span className="sol">{e.script}</span>
                </td>
                <td>{e.extra}</td>
                <td>{e.ipa}</td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </div>
    );
  }

  if (noun) {
    overlay = <NounDialog dictionary={entries} noun={noun} />;
  }

  return App(
    <>
      {overlay}
      {content}
    </>,
    "Home"
  );
}
