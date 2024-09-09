import { HTMLTable } from "@blueprintjs/core";
import { Part, separateRoot } from "../lang/extra";
import { FORM_NAMES, FormNames, applyFromSeparatedRoot } from "../lang/inflection";
import { FullEntry } from "../dictionary";
import { DisplayWord, populateDualInfo } from "../lang/display";

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
  const infos = forms.map((i) => populateDualInfo({ sol: i, extra: "V" })); // TODO (mark stress)
  const map = Object.fromEntries(FORM_NAMES[Part.Verb].map((k, i) => [k, infos[i]])) as Record<
    FormNames<Part.Verb>,
    DisplayWord
  >;

  return (
    <>
      <HTMLTable compact bordered className="inflection">
        <tbody>
          <tr>
            <td>1st inf</td>
            <VerbTableEntry word={map["1_inf"]} />
            <td>2sg imp</td>
            <VerbTableEntry word={map["2sg_imp"]} />
          </tr>
          <tr>
            <td>2nd inf</td>
            <VerbTableEntry word={map["2_inf"]} />
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </HTMLTable>
      <HTMLTable compact bordered className="inflection">
        <thead>
          <tr>
            <th colSpan={2} className="rb db"></th>
            <th className="hl db">present</th>
            <th className="hl db">past</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th rowSpan={3} className="hl">
              sg
            </th>
            <td className="rb">1</td>
            <VerbTableEntry word={map["1sg_prs"]} />
            <VerbTableEntry word={map["1sg_pst"]} />
          </tr>
          <tr>
            <td className="rb">2</td>
            <VerbTableEntry word={map["2sg_prs"]} />
            <VerbTableEntry word={map["2sg_pst"]} />
          </tr>
          <tr>
            <td className="rb">3</td>
            <VerbTableEntry word={map["3sg_prs"]} />
            <VerbTableEntry word={map["3sg_pst"]} />
          </tr>
          <tr>
            <th className="hl">pl</th>
            <td className="rb">1</td>
            <VerbTableEntry word={map["1pl_prs"]} />
            <VerbTableEntry word={map["1pl_pst"]} />
          </tr>
          <tr>
            <th></th>
            <td className="rb">2</td>
            <VerbTableEntry word={map["2pl_prs"]} />
            <VerbTableEntry word={map["2pl_pst"]} />
          </tr>
          <tr>
            <th></th>
            <td className="rb">3</td>
            <VerbTableEntry word={map["3pl_prs"]} />
            <VerbTableEntry word={map["3pl_pst"]} />
          </tr>
        </tbody>
      </HTMLTable>
    </>
  );
}

export function VerbInfo({ entry }: { entry: FullEntry }) {
  if (entry.part !== Part.Verb) {
    throw new Error("Passed entry is not a verb");
  }
  const s = separateRoot(entry.sol, Part.Verb);
  if (s === null) {
    throw new Error("Verb failed to separate root");
  }

  const forms = applyFromSeparatedRoot(s, true);

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
