import { HTMLTable, NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { App, toastErrorHandler } from "../App";
import { useEffect, useState } from "react";
import { apiFetch, RawEntry } from "../api";
import { partOfExtra, determineClass, defaultEntrySort } from "../lang/extra";
import { scriptMultiUnicode } from "../lang/script";

export default function HomePage() {
  const [entries, setEntries] = useState<RawEntry[] | null>(null);
  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  useEffect(() => {
    (async () => {
      try {
        setEntries(
          (await apiFetch<RawEntry[]>("/raw")).sort(defaultEntrySort).map((i) => {
            const part = partOfExtra(i.extra);
            if (part !== null) {
              const cls = determineClass(i.sol, part) ?? "?";
              return { ...i, extra: `${i.extra}-${cls}` };
            }
            return i;
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
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.hash}>
                <td>{i + 1}</td>
                <td>{e.eng}</td>
                <td className="dual">
                  <i>{e.sol}</i>
                  <span className="sol">{scriptMultiUnicode(e.sol)}</span>
                </td>
                <td>{e.extra}</td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </div>
    );
  }

  return App(content, "Home");
}
