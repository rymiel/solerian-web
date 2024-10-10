import { Button, HTMLTable, Icon, InputGroup, NonIdealState, Spinner, SpinnerSize, Tag } from "@blueprintjs/core";
import { useContext, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router";

import { entryHasMatch } from "components/wordSelect";
import { PARTS_OF_SPEECH } from "lang/extra";
import { uri } from "lang/util";
import { SectionTitle, SIMPLE_SECTIONS } from "page/EditWordPage";
import { Dictionary } from "providers/dictionary";
import { User } from "providers/user";
import { App } from "App";

function ExtraCell({ extra, cls }: { extra: string; cls: string | null }) {
  const abbr = PARTS_OF_SPEECH[extra] as string | undefined;

  if (abbr) {
    return (
      <abbr title={abbr.replace("%", cls ?? "")}>
        {extra}
        {cls && `-${cls}`}
      </abbr>
    );
  } else {
    return (
      <span>
        {extra}
        {cls && `-${cls}`}
      </span>
    );
  }
}

export default function DictionaryPage() {
  const { entries } = useContext(Dictionary);
  const navigate = useNavigate();
  const { user } = useContext(User);
  const [search, setSearch] = useState("");

  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  const clickPreserveScroll = (e: React.MouseEvent<HTMLTableRowElement>) => {
    const target = e.currentTarget.dataset.name;
    const top = document.getElementById("main")?.scrollTop;
    history.replaceState({ ...(history.state ?? {}), dictionaryScroll: top }, "");
    document.location.hash = `/w/${target}`;
    e.preventDefault();
  };
  useLayoutEffect(() => {
    const main = document.getElementById("main");
    const scroll = (history.state ?? {}).dictionaryScroll;
    if (main && entries && scroll) {
      main.scrollTop = scroll;
    }
  }, [entries]);

  if (entries) {
    content = (
      <div className="inter">
        <HTMLTable className="margin-auto dictionary" compact striped interactive>
          <thead>
            <tr>
              <td colSpan={5}>
                <InputGroup type="search" placeholder="Search" onValueChange={setSearch} value={search} />
              </td>
            </tr>
            <tr>
              <th>#</th>
              <th>English</th>
              <th>Solerian</th>
              <th>Extra</th>
              <th>Pronunciation</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) =>
              entryHasMatch(search, e) ? (
                <tr key={e.hash} onClick={clickPreserveScroll} data-name={e.sol}>
                  <td>
                    <a href={uri`#/w/${e.sol}`} className="link-fill">
                      <span>{i + 1}</span>
                    </a>
                  </td>
                  <td>
                    <a href={uri`#/w/${e.sol}`} className="link-fill">
                      <span>
                        {e.tag && <Tag intent="danger">{e.tag}</Tag>}{" "}
                        {e.meanings.map((m, mi) => (mi === 0 ? "" : "; ") + m.eng)}
                        {e.meanings.some((m) => m.sections.some((s) => s.title === SectionTitle.TRANSLATION)) && (
                          <Icon icon="label" title="has a translation" />
                        )}
                        {SIMPLE_SECTIONS.map(([title, name, iconProps]) =>
                          e.sections.some((s) => s.title === title) ? (
                            <Icon {...iconProps} key={title} title={`has ${name.toLowerCase()}`} />
                          ) : undefined,
                        )}
                      </span>
                    </a>
                  </td>
                  <td>
                    <a href={uri`#/w/${e.sol}`} className="link-fill dual">
                      <i>{e.sol}</i>
                      <span className="sol">{e.script}</span>
                    </a>
                  </td>
                  <td>
                    <a href={uri`#/w/${e.sol}`} className="link-fill">
                      <ExtraCell extra={e.extra} cls={e.class} />
                    </a>
                  </td>
                  <td>
                    <a href={uri`#/w/${e.sol}`} className="link-fill">
                      <span>{e.ipa}</span>
                    </a>
                  </td>
                </tr>
              ) : undefined,
            )}
          </tbody>

          {user && (
            <tfoot>
              <tr>
                <td colSpan={5}>
                  <Button intent="success" text="Add new entry" icon="plus" fill onClick={() => navigate("/new")} />
                </td>
              </tr>
            </tfoot>
          )}
        </HTMLTable>
      </div>
    );
  }

  return App(content, "Home");
}
