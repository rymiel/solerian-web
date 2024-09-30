import { HTMLTable, NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { useContext } from "react";
import { App } from "../App";
import { User } from "../user";
import { Dictionary, FullEntry } from "../dictionary";
import { singleWordSoundChangeSteps } from "../lang/soundChange";
import { markStress } from "../lang/extra";

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

function Content({ entries }: { entries: FullEntry[] }) {
  return (
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
