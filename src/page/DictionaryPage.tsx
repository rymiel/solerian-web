import { Button, HTMLTable, Icon, InputGroup, NonIdealState, Spinner, SpinnerSize, Tag } from "@blueprintjs/core";
import { useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

import { entryHasMatch } from "components/wordSelect";
import { PARTS_OF_SPEECH } from "lang/extra";
import { SectionTitle, SIMPLE_SECTIONS } from "page/EditWordPage";
import { Dictionary, FullMeaning } from "providers/dictionary";
import { useTitle } from "providers/title";
import { User } from "providers/user";

function ExtraCell({ extra, cls }: { extra: string; cls: string | null }) {
  const abbr = PARTS_OF_SPEECH[extra] as string | undefined;

  if (abbr) {
    return <abbr title={abbr.replace("%", cls ?? "")}>
      {extra}
      {cls && `-${cls}`}
    </abbr>;
  } else {
    return <span>
      {extra}
      {cls && `-${cls}`}
    </span>;
  }
}

function mergeDefinitions(meanings: FullMeaning[]) {
  let toBe = false;
  return meanings.map((m, mi) => {
    let eng = m.eng;
    if (eng.startsWith("(")) {
      const split = m.eng.split(")", 2);
      eng = (split[1] ?? split[0]).trim();
    }
    if (eng.startsWith("to be ")) {
      if (toBe) {
        eng = eng.slice(6);
      } else {
        toBe = true;
      }
    }
    return (mi === 0 ? "" : "; ") + eng;
  });
}

export default function DictionaryPage() {
  useTitle("Home");
  const { entries } = useContext(Dictionary);
  const navigate = useNavigate();
  const { user } = useContext(User);
  const [search, setSearch] = useState("");

  const handleSearchContainer = useCallback((ref: HTMLDivElement | null) => {
    if (ref === null) return;
    ref.style.top = document.querySelector("header")?.getBoundingClientRect().height + "px";
  }, []);

  const handleAddButton = useCallback((ref: HTMLDivElement | null) => {
    if (ref === null) return;
    ref.style.bottom = document.querySelector("footer")?.getBoundingClientRect().height + "px";
  }, []);

  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  if (entries) {
    content = <div className="inter middle">
      <div className="around-dictionary" ref={handleSearchContainer}>
        <InputGroup type="search" placeholder="Search" onValueChange={setSearch} value={search} large />
      </div>

      <HTMLTable className="dictionary" compact striped interactive>
        <thead>
          <tr>
            <th>#</th>
            <th>English</th>
            <th>Solerian</th>
            <th>Extra</th>
            <th className="pronunciation">Pronunciation</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) =>
            entryHasMatch(search, e) ? (
              <tr key={e.hash}>
                <td>
                  <Link to={e.link} className="link-fill">
                    <span>{i + 1}</span>
                  </Link>
                </td>
                <td>
                  <Link to={e.link} className="link-fill">
                    <span>
                      {e.tag && <Tag intent="danger">{e.tag}</Tag>} {mergeDefinitions(e.meanings)}
                      {e.meanings.some((m) => m.sections.some((s) => s.title === SectionTitle.TRANSLATION)) && <Icon
                        icon="label"
                        title="has a translation"
                      />}
                      {SIMPLE_SECTIONS.map(([title, name, iconProps]) =>
                        e.sections.some((s) => s.title === title) ? (
                          <Icon {...iconProps} key={title} title={`has ${name.toLowerCase()}`} />
                        ) : undefined,
                      )}
                    </span>
                  </Link>
                </td>
                <td>
                  <Link to={e.link} className="link-fill dual">
                    <i>{e.sol}</i>
                    <span className="sol">{e.script}</span>
                  </Link>
                </td>
                <td>
                  <Link to={e.link} className="link-fill">
                    <ExtraCell extra={e.extra} cls={e.class} />
                  </Link>
                </td>
                <td className="pronunciation">
                  <Link to={e.link} className="link-fill">
                    <span>{e.ipa}</span>
                  </Link>
                </td>
              </tr>
            ) : undefined,
          )}
        </tbody>
      </HTMLTable>

      {user && <div className="around-dictionary" ref={handleAddButton}>
        <Button intent="success" text="Add new entry" icon="plus" fill onClick={() => navigate("/new")} />
      </div>}
    </div>;
  }

  return content;
}
