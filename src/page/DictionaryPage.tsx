import { Button, HTMLTable, Icon, NonIdealState, Spinner, SpinnerSize, Tag } from "@blueprintjs/core";
import { App } from "../App";
import { useContext } from "react";
import { useNavigate } from "react-router";
import { Dictionary } from "../dictionary";
import { User } from "../user";
import { SectionTitle } from "./EditWordPage";
import { uri } from "../index";

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
                      {e.sections.some((s) => s.title === SectionTitle.USAGE) && (
                        <Icon icon="info-sign" title="has usage notes" />
                      )}
                      {e.sections.some((s) => s.title === SectionTitle.ETYMOLOGY) && (
                        <Icon icon="book" title="has etymology" />
                      )}
                      {e.sections.some((s) => s.title === SectionTitle.INSTEAD) && (
                        <Icon icon="flow-end" title="has another word that should be used instead" intent="danger" />
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
                    <span>
                      {e.extra}
                      {e.class && `-${e.class}`}
                    </span>
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
