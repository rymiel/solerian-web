import { HTMLTable, NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { App, toastErrorHandler } from "../App";
import { useEffect, useState } from "react";
import { apiFetch, RawEntry } from "../api";
import { partOfExtra, determineType, defaultEntrySort, Part, separateRoot } from "../lang/extra";
import { scriptMultiUnicode } from "../lang/script";
import { soundChange } from "../lang/soundChange";
import { applyFromSeparatedRoot } from "../lang/inflection";

interface FullEntry extends RawEntry {
  script: string;
  ipa: string;
}

export default function HomePage() {
  const [entries, setEntries] = useState<FullEntry[] | null>(null);
  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  useEffect(() => {
    (async () => {
      try {
        setEntries(
          (await apiFetch<RawEntry[]>("/raw")).sort(defaultEntrySort).map((i) => {
            let extra = i.extra;
            const part = partOfExtra(i.extra);
            if (part !== null) {
              const cls = determineType(i.sol, part) ?? "?";
              extra = `${i.extra}-${cls}`;
            }
            return { ...i, extra, script: scriptMultiUnicode(i.sol), ipa: soundChange(i) };
          })
        );
      } catch (error) {
        toastErrorHandler(error);
      }
    })();
  }, []);

  if (entries) {
    content = (
      <div className="inter">
        <HTMLTable className="margin-auto dictionary" compact striped>
          <thead>
            <tr>
              <th>#</th>
              <th>English</th>
              <th>Solerian</th>
              <th>Extra</th>
              <th>Pronunciation</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.hash}>
                <td>{i + 1}</td>
                <td>{e.eng}</td>
                <td className="dual">
                  <i>{e.sol}</i>
                  <span className="sol">{e.script}</span>
                </td>
                <td>{e.extra}</td>
                <td>{e.ipa}</td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </div>
    );
  }

  return App(content, "Home");
}
