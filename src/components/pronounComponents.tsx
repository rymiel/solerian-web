import { HTMLTable } from "@blueprintjs/core";
import { Abbr, zip } from "conlang-web-components";

import { DisplayWord, usePopulateDualInfo } from "lang/display";
import { Part } from "lang/extra";
import { FORM_NAMES, formsFromEntry, InflectableEntry } from "lang/inflection";

function PronounTableEntry({ word }: { word: DisplayWord }) {
  return <td>
    <span className="dual">
      <i>{word.sol}</i>
      <span lang="x-sol">{word.script}</span>
    </span>
    <p>{word.ipa}</p>
  </td>;
}

function PronounTable({ forms }: { forms: readonly string[] }) {
  const populate = usePopulateDualInfo();
  const infos = forms.map((i) => populate(i));
  const map = zip(FORM_NAMES[Part.Pronoun], infos);

  return <HTMLTable compact bordered className="inflection">
    <tbody>
      <tr>
        <td className="hl rb">
          <Abbr>NOM</Abbr>
        </td>
        <PronounTableEntry word={map.nom} />
      </tr>
      <tr>
        <td className="hl rb">
          <Abbr>ACC</Abbr>
        </td>
        <PronounTableEntry word={map.acc} />
      </tr>
      <tr>
        <td className="hl rb">
          <Abbr>GEN</Abbr>
        </td>
        <PronounTableEntry word={map.gen} />
      </tr>
    </tbody>
  </HTMLTable>;
}

export function PronounInfo({ entry }: { entry: InflectableEntry }) {
  const [forms] = formsFromEntry(entry, Part.Pronoun);

  return <>
    <PronounTable forms={forms.cur} />
    <details>
      <summary>Old forms for this pronoun</summary>
      <PronounTable forms={forms.old} />
    </details>
  </>;
}
