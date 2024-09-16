import { Button, HTMLTable, Icon, NonIdealState, Spinner, SpinnerSize, Tag } from "@blueprintjs/core";
import { App } from "../App";
import { useContext } from "react";
import { useNavigate } from "react-router";
import { Dictionary } from "../dictionary";
import { User } from "../user";
import { SectionTitle } from "./EditWordPage";
import { uri } from "../index";

export default function HomePage() {
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
              <tr key={e.hash} onClick={() => navigate(uri`/w/${e.sol}`)}>
                <td>{i + 1}</td>
                <td>
                  {e.tag && <Tag intent="danger">{e.tag}</Tag>}{" "}
                  {e.meanings.map((m, mi) => (mi === 0 ? "" : "; ") + m.eng)}
                  {e.sections.some((s) => s.title === SectionTitle.USAGE) && (
                    <Icon icon="info-sign" title="has usage notes" />
                  )}
                  {e.sections.some((s) => s.title === SectionTitle.ETYMOLOGY) && (
                    <Icon icon="book" title="has etymology" />
                  )}
                  {e.sections.some((s) => s.title === SectionTitle.INSTEAD) && (
                    <Icon icon="flow-end" title="has another word that should be used instead" intent="danger" />
                  )}
                </td>
                <td className="dual">
                  <i>{e.sol}</i>
                  <span className="sol">{e.script}</span>
                </td>
                <td>
                  {e.extra}
                  {e.class && `-${e.class}`}
                </td>
                <td>{e.ipa}</td>
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
