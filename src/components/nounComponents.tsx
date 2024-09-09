import { HTMLTable } from "@blueprintjs/core";
import { markStress, Part, separateRoot } from "../lang/extra";
import { FORM_NAMES, FormNames, applyFromSeparatedRoot } from "../lang/inflection";
import { FullEntry } from "../dictionary";
import { DisplayWord, populateDualInfo } from "../lang/display";

function NounTableEntry({ word }: { word: DisplayWord }) {
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

export function NounTable({ forms, extra }: { forms: readonly string[]; extra: string }) {
  const infos = forms.map((i) => populateDualInfo({ sol: i, extra }));
  const map = Object.fromEntries(FORM_NAMES[Part.Noun].map((k, i) => [k, infos[i]])) as Record<
    FormNames<Part.Noun>,
    DisplayWord
  >;

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

export function NounInfo({ entry }: { entry: FullEntry }) {
  if (entry.part !== Part.Noun) {
    throw new Error("Passed entry is not a noun");
  }
  const s = separateRoot(entry.sol, Part.Noun);
  if (s === null) {
    throw new Error("Noun failed to separate root");
  }

  const forms = applyFromSeparatedRoot(s, markStress(entry));

  return (
    <>
      <NounTable forms={forms.cur} extra={entry.extra} />
      <details>
        <summary>Old forms for this noun</summary>
        <NounTable forms={forms.old} extra={entry.extra} />
      </details>
    </>
  );
}
