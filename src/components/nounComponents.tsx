import { HTMLTable } from "@blueprintjs/core";
import { Part } from "../lang/extra";
import { FORM_NAMES, FormNames, formsFromEntry } from "../lang/inflection";
import { FullEntry } from "../dictionary";
import { DisplayWord, populateDualInfo } from "../lang/display";
import { zip } from "../lang/util";

function NounTableEntry({ word }: { word: DisplayWord }) {
  return (
    <td>
      <span className="dual">
        {/* <a href={`#/poss/${word.sol}`}> */}
        <i>{word.sol}</i>
        {/* </a> */}
        <span className="sol">{word.script}</span>
      </span>
      <p>{word.ipa}</p>
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
