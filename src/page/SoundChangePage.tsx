import { Code, HTMLTable, NonIdealState, Pre, Spinner, SpinnerSize, Tag } from "@blueprintjs/core";
import React, { useContext } from "react";
import { App } from "../App";
import { User } from "../user";
import { Dictionary, FullEntry } from "../dictionary";
import { Change, CONFIG, singleWordSoundChangeSteps } from "../lang/soundChange";
import { markStress } from "../lang/extra";
import reactStringReplace from "react-string-replace";

function intersperse(arr: React.ReactNode[], w: React.ReactNode): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  arr.forEach((i, j) => {
    if (j > 0) {
      out.push(w);
    }
    out.push(i);
  });
  return out;
}

function tags(s: string | null): React.ReactNode {
  if (s === null) return null;
  if (s === "")
    return (
      <Tag intent="danger" minimal>
        ∅
      </Tag>
    );
  return reactStringReplace(s, /(\{\w\})/, (m, i) => (
    <Tag key={i} intent="primary" minimal>
      {m.slice(1, -1)}
    </Tag>
  ));
}

function SoundChange({ change }: { change: Change }) {
  let [from, to, left, right] = change.map(tags);
  if (left === null && right === null) {
    return (
      <>
        <Code>{from}</Code> → <Code>{to}</Code>
      </>
    );
  } else {
    return (
      <>
        <Code>{from}</Code> → <Code>{to}</Code> / {left && <Code>{left}</Code>} _ {right && <Code>{right}</Code>}
      </>
    );
  }
}

function Content({ entries }: { entries: FullEntry[] }) {
  return (
    <div className="margin-auto flex-row">
      <HTMLTable className="margin-auto" compact striped>
        <tbody>
          {CONFIG.changes.map((c, i) => (
            <tr key={i}>
              <td>
                <SoundChange change={c} />
              </td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
      <HTMLTable className="margin-auto" compact striped>
        <tbody>
          {entries.map((e) => {
            const steps = singleWordSoundChangeSteps(e.sol, markStress(e));
            return (
              <tr key={e.hash}>
                <td>{e.sol}</td>
                <td style={{ display: "flex", justifyContent: "space-between" }}>
                  {steps.length > 1 ? (
                    intersperse(
                      steps.map((v, i) => <span key={i}>{v}</span>),
                      " → "
                    )
                  ) : (
                    <i style={{ margin: "auto" }}>no changes</i>
                  )}
                </td>
                <td>{e.ipa}</td>
              </tr>
            );
          })}
        </tbody>
      </HTMLTable>
    </div>
  );
}

export default function SoundChangePage() {
  const { user } = useContext(User);
  const { entries } = useContext(Dictionary);

  let content;

  if (!user) {
    content = <NonIdealState icon="error" title="You cannot access this page" />;
  } else if (entries === null) {
    content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  } else {
    content = (
      <div className="inter">
        <Content entries={entries} />
      </div>
    );
  }

  return App(content, "Numbers");
}
