import { Code, Dialog, DialogBody, HTMLTable, Tag } from "@blueprintjs/core";
import { Abbr, zip } from "conlang-web-components";
import { useState } from "react";

import { NounTable } from "components/nounComponents";
import { DisplayWord, usePopulateDualInfo } from "lang/display";
import { Part } from "lang/extra";
import { FORM_NAMES, formsFromDirect, formsFromEntry, InflectableEntry } from "lang/inflection";
import { toastErrorHandler } from "App";

function VerbTableEntry({ word }: { word: DisplayWord }) {
  return <td>
    <span className="dual">
      <i>{word.sol}</i>
      <span lang="x-sol">{word.script}</span>
    </span>
    <p>{word.ipa}</p>
  </td>;
}

function GerundTableEntry({ word }: { word: DisplayWord }) {
  const [isOpen, setOpen] = useState(false);
  let forms;
  try {
    forms = formsFromDirect(word.sol, true, Part.Noun);
  } catch (err) {
    toastErrorHandler(err);

    return <td>
      <Tag large intent="danger">
        Gerund entry for <Code>{word.sol}</Code> failed to render
      </Tag>
    </td>;
  }

  return <td>
    <span className="dual">
      <a onClick={() => setOpen(true)}>
        <i>{word.sol}</i>
      </a>
      <span lang="x-sol">{word.script}</span>
    </span>
    <p>{word.ipa}</p>
    <Dialog
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      title={
        <>
          Noun forms of gerund <i>{word.sol}</i>
        </>
      }
    >
      <DialogBody>
        <NounTable forms={forms.cur} stress={true} old={false} />
      </DialogBody>
    </Dialog>
  </td>;
}

export function VerbTable({ forms, old }: { forms: readonly string[]; old: boolean }) {
  const populate = usePopulateDualInfo();
  const infos = forms.map((i) => populate(i));
  const map = zip(FORM_NAMES[Part.Verb], infos);

  return <>
    <HTMLTable compact bordered className="inflection">
      <tbody>
        <tr>
          <td>{old ? "1st infinitive" : "infinitive"}</td>
          <VerbTableEntry word={map["inf"]} />
          <td>imperative</td>
          <VerbTableEntry word={map["imp"]} />
        </tr>
        <tr>
          <td>{old ? "2nd infinitive" : "gerund"}</td>
          {/* NOTE: old form didn't have a gerund */}
          {old ? <VerbTableEntry word={map["ger"]} /> : <GerundTableEntry word={map["ger"]} />}
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
          <td className="hl">
            <Abbr>SG</Abbr>
          </td>
          <td className="rb">
            <Abbr>1</Abbr>
          </td>
          <VerbTableEntry word={map["1sg_prs"]} />
          <VerbTableEntry word={map["1sg_pst"]} />
        </tr>
        <tr>
          <th></th>
          <td className="rb">
            <Abbr>2</Abbr>
          </td>
          <VerbTableEntry word={map["2sg_prs"]} />
          <VerbTableEntry word={map["2sg_pst"]} />
        </tr>
        <tr>
          <th></th>
          <td className="rb">
            <Abbr>3</Abbr>
          </td>
          <VerbTableEntry word={map["3sg_prs"]} />
          <VerbTableEntry word={map["3sg_pst"]} />
        </tr>
        <tr>
          <td className="hl">
            <Abbr>PL</Abbr>
          </td>
          <td className="rb">
            <Abbr>1</Abbr>
          </td>
          <VerbTableEntry word={map["1pl_prs"]} />
          <VerbTableEntry word={map["1pl_pst"]} />
        </tr>
        <tr>
          <th></th>
          <td className="rb">
            <Abbr>2</Abbr>
          </td>
          <VerbTableEntry word={map["2pl_prs"]} />
          <VerbTableEntry word={map["2pl_pst"]} />
        </tr>
        <tr>
          <th></th>
          <td className="rb">
            <Abbr>3</Abbr>
          </td>
          <VerbTableEntry word={map["3pl_prs"]} />
          <VerbTableEntry word={map["3pl_pst"]} />
        </tr>
      </tbody>
    </HTMLTable>
  </>;
}

export function VerbInfo({ entry }: { entry: InflectableEntry }) {
  const [forms] = formsFromEntry(entry, Part.Verb);

  return <>
    <VerbTable forms={forms.cur} old={false} />
    <details>
      <summary>Old forms for this verb</summary>
      <VerbTable forms={forms.old} old={true} />
    </details>
  </>;
}
