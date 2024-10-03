import { HTMLTable } from "@blueprintjs/core";
import { DisplayWord, usePopulateDualInfo } from "../lang/display";
import { Part } from "../lang/extra";
import { FORM_NAMES, formsFromEntry } from "../lang/inflection";
import { zip } from "../lang/util";
import { FullEntry } from "../providers/dictionary";
import { convertAbbr } from "./interlinear";

function VerbTableEntry({ word }: { word: DisplayWord }) {
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

export function VerbTable({ forms }: { forms: readonly string[] }) {
  const populate = usePopulateDualInfo();
  const infos = forms.map((i) => populate(i));
  const map = zip(FORM_NAMES[Part.Verb], infos);

  return (
    <>
      <HTMLTable compact bordered className="inflection">
        <tbody>
          <tr>
            <td>infinitive</td>
            <VerbTableEntry word={map["inf"]} />
            <td>imperative</td>
            <VerbTableEntry word={map["imp"]} />
          </tr>
          <tr>
            <td>gerund</td>
            <VerbTableEntry word={map["ger"]} />
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </HTMLTable>
      <HTMLTable compact bordered className="inflection">
        <thead>
          <tr>
            <th colSpan={2} className="rb db"></th>
            <th className="db">non-past</th>
            <th className="db">past</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="hl">{convertAbbr("SG")}</td>
            <td className="rb">{convertAbbr("1")}</td>
            <VerbTableEntry word={map["1sg_prs"]} />
            <VerbTableEntry word={map["1sg_pst"]} />
          </tr>
          <tr>
            <th></th>
            <td className="rb">{convertAbbr("2")}</td>
            <VerbTableEntry word={map["2sg_prs"]} />
            <VerbTableEntry word={map["2sg_pst"]} />
          </tr>
          <tr>
            <th></th>
            <td className="rb">{convertAbbr("3")}</td>
            <VerbTableEntry word={map["3sg_prs"]} />
            <VerbTableEntry word={map["3sg_pst"]} />
          </tr>
          <tr>
            <td className="hl">{convertAbbr("PL")}</td>
            <td className="rb">{convertAbbr("1")}</td>
            <VerbTableEntry word={map["1pl_prs"]} />
            <VerbTableEntry word={map["1pl_pst"]} />
          </tr>
          <tr>
            <th></th>
            <td className="rb">{convertAbbr("2")}</td>
            <VerbTableEntry word={map["2pl_prs"]} />
            <VerbTableEntry word={map["2pl_pst"]} />
          </tr>
          <tr>
            <th></th>
            <td className="rb">{convertAbbr("3")}</td>
            <VerbTableEntry word={map["3pl_prs"]} />
            <VerbTableEntry word={map["3pl_pst"]} />
          </tr>
        </tbody>
      </HTMLTable>
    </>
  );
}

export function VerbInfo({ entry }: { entry: FullEntry }) {
  const [forms] = formsFromEntry(entry, Part.Verb);

  return (
    <>
      <VerbTable forms={forms.cur} />
      <details>
        <summary>Old forms for this verb</summary>
        <VerbTable forms={forms.old} />
      </details>
    </>
  );
}
