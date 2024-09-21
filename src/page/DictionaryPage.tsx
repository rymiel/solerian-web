import { Button, HTMLTable, Icon, NonIdealState, Spinner, SpinnerSize, Tag } from "@blueprintjs/core";
import { App } from "../App";
import { useContext } from "react";
import { useNavigate } from "react-router";
import { Dictionary } from "../dictionary";
import { User } from "../user";
import { SectionTitle, SIMPLE_SECTIONS } from "./EditWordPage";
import { uri } from "../index";
import { PARTS_OF_SPEECH } from "../lang/extra";

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

  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  if (entries) {
    content = (
      <div className="inter">
        <HTMLTable className="margin-auto dictionary" compact striped interactive>
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
                        ) : undefined
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
            ))}
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
