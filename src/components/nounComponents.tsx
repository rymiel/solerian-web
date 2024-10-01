import { Dialog, DialogBody, HTMLTable, Tag } from "@blueprintjs/core";
import { Part } from "../lang/extra";
import { applyNormalize, FORM_NAMES, formsFromEntry, POSS_FORMS, POSS_SUFFIXES } from "../lang/inflection";
import { FullEntry } from "../dictionary";
import { DisplayWord, populateDualInfo } from "../lang/display";
import { useState } from "react";
import { zip } from "../lang/util";
import { convertAbbr } from "./interlinear";

function PossTableEntry({ word }: { word: DisplayWord }) {
  return (
    <td>
      <span className="dual">
        <i>{word.sol}</i>
        <span className="sol">{word.script}</span>
      </span>
      <p>{word.ipa}</p>
    </td>
  );
}

// note: only stressable nouns can have possessive suffixes
const buildInflMap = (key: "old" | "cur", sol: string) =>
  zip(
    POSS_FORMS[key],
    POSS_SUFFIXES[key].map((suffix) => populateDualInfo(applyNormalize(`${sol}${suffix}`), true))
  );

function NounTableEntry({ word, stress, old }: { word: DisplayWord; stress: boolean; old: boolean }) {
  const [isOpen, setOpen] = useState(false);

  const map = buildInflMap(old ? "old" : "cur", word.sol);

  return (
    <td>
      <span className="dual">
        {stress ? (
          <a onClick={() => setOpen(true)}>
            <i>{word.sol}</i>
          </a>
        ) : (
          <i>{word.sol}</i>
        )}
        <span className="sol">{word.script}</span>
      </span>
      <p>{word.ipa}</p>
      {stress && (
        <Dialog
          isOpen={isOpen}
          onClose={() => setOpen(false)}
          title={
            <>
              Possessive forms of <i>{word.sol}</i> {old && <Tag intent="warning">old forms</Tag>}
            </>
          }
        >
          <DialogBody>
            <HTMLTable compact striped className="inflection">
              <tbody>
                {Object.entries(map).map(([name, form]) => (
                  <tr key={name}>
                    <td>{convertAbbr(name)}</td>
                    <PossTableEntry word={form} />
                  </tr>
                ))}
              </tbody>
            </HTMLTable>
          </DialogBody>
        </Dialog>
      )}
    </td>
  );
}

export function NounTable({ forms, stress, old }: { forms: readonly string[]; stress: boolean; old: boolean }) {
  const infos = forms.map((i) => populateDualInfo(i, stress));
  const map = zip(FORM_NAMES[Part.Noun], infos);

  return (
    <HTMLTable compact bordered className="inflection">
      <thead>
        <tr>
          <th className="rb"></th>
          <th className="db">{convertAbbr("SG")}</th>
          <th className="db">{convertAbbr("PL")}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="hl rb">{convertAbbr("NOM")}</td>
          <NounTableEntry word={map.nom_sg} stress={stress} old={old} />
          <NounTableEntry word={map.nom_pl} stress={stress} old={old} />
        </tr>
        <tr>
          <td className="hl rb">{convertAbbr("ACC")}</td>
          <NounTableEntry word={map.acc_sg} stress={stress} old={old} />
          <NounTableEntry word={map.acc_pl} stress={stress} old={old} />
        </tr>
        <tr>
          <td className="hl rb">{convertAbbr("GEN")}</td>
          <NounTableEntry word={map.gen_sg} stress={stress} old={old} />
          <NounTableEntry word={map.gen_pl} stress={stress} old={old} />
        </tr>
      </tbody>
    </HTMLTable>
  );
}

export function NounInfo({ entry }: { entry: FullEntry }) {
  const [forms, stress] = formsFromEntry(entry, Part.Noun);

  return (
    <>
      <NounTable forms={forms.cur} stress={stress} old={false} />
      <details>
        <summary>Old forms for this noun</summary>
        <NounTable forms={forms.old} stress={stress} old={true} />
      </details>
    </>
  );
}
