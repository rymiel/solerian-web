import { Dialog, DialogBody, HTMLTable } from "@blueprintjs/core";
import { Part } from "../lang/extra";
import { applyNormalize, FORM_NAMES, formsFromEntry, POSS_FORMS, POSS_SUFFIXES } from "../lang/inflection";
import { FullEntry } from "../dictionary";
import { DisplayWord, populateDualInfo } from "../lang/display";
import { useState } from "react";
import { zip } from "../lang/util";

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

function NounTableEntry({ word, stress }: { word: DisplayWord; stress: boolean }) {
  const [isOpen, setOpen] = useState(false);
  const buildMap = <T extends "cur" | "old">(kind: T) =>
    zip(
      POSS_FORMS[kind],
      POSS_SUFFIXES[kind].map((suffix) => populateDualInfo(applyNormalize(`${word.sol}${suffix}`), stress))
    );
  const curMap = buildMap("cur");
  const oldMap = buildMap("old");

  return (
    <td>
      <span className="dual">
        <a onClick={() => setOpen(true)}>
          <i>{word.sol}</i>
        </a>
        <span className="sol">{word.script}</span>
      </span>
      <p>{word.ipa}</p>
      {stress && (
        <Dialog
          isOpen={isOpen}
          onClose={() => setOpen(false)}
          title={
            <>
              Possessive forms of <i>{word.sol}</i>
            </>
          }
        >
          <DialogBody>
            <div className="flex-row">
              <HTMLTable compact striped className="inflection fit-h margin-2-right">
                <tbody>
                  {POSS_FORMS.cur.map((form) => (
                    <tr key={form}>
                      <td>{form}</td>
                      <PossTableEntry word={curMap[form]} />
                    </tr>
                  ))}
                </tbody>
              </HTMLTable>
              <details>
                <summary>Old forms for this possessive</summary>
                <HTMLTable compact striped className="inflection">
                  <tbody>
                    {POSS_FORMS.old.map((form) => (
                      <tr key={form}>
                        <td>{form}</td>
                        <PossTableEntry word={oldMap[form]} />
                      </tr>
                    ))}
                  </tbody>
                </HTMLTable>
              </details>
            </div>
          </DialogBody>
        </Dialog>
      )}
    </td>
  );
}

export function NounTable({ forms, stress }: { forms: readonly string[]; stress: boolean }) {
  const infos = forms.map((i) => populateDualInfo(i, stress));
  const map = zip(FORM_NAMES[Part.Noun], infos);

  return (
    <HTMLTable compact bordered className="inflection">
      <thead>
        <tr>
          <th className="rb"></th>
          <th className="hl db">sg</th>
          <th className="hl db">pl</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="hl rb">nom</td>
          <NounTableEntry word={map.nom_sg} stress={stress} />
          <NounTableEntry word={map.nom_pl} stress={stress} />
        </tr>
        <tr>
          <td className="hl rb">acc</td>
          <NounTableEntry word={map.acc_sg} stress={stress} />
          <NounTableEntry word={map.acc_pl} stress={stress} />
        </tr>
        <tr>
          <td className="hl rb">gen</td>
          <NounTableEntry word={map.gen_sg} stress={stress} />
          <NounTableEntry word={map.gen_pl} stress={stress} />
        </tr>
      </tbody>
    </HTMLTable>
  );
}

export function NounInfo({ entry }: { entry: FullEntry }) {
  const [forms, stress] = formsFromEntry(entry, Part.Noun);

  return (
    <>
      <NounTable forms={forms.cur} stress={stress} />
      <details>
        <summary>Old forms for this noun</summary>
        <NounTable forms={forms.old} stress={stress} />
      </details>
    </>
  );
}
