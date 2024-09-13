import { HTMLTable, NonIdealState, Spinner, SpinnerSize, Tag } from "@blueprintjs/core";
import { App } from "../App";
import { useContext } from "react";
import { useNavigate } from "react-router";
import { Dictionary } from "../dictionary";

export default function HomePage() {
  const { entries } = useContext(Dictionary);
  const navigate = useNavigate();

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
              <tr key={e.hash} onClick={() => navigate(`/w/${e.sol}`)}>
                <td>{i + 1}</td>
                <td>
                  {e.tag && <Tag intent="danger">{e.tag}</Tag>}{" "}
                  {e.meanings.map((m, mi) => (mi === 0 ? "" : "; ") + m.eng)}
                </td>
                <td className="dual">
                  <i>{e.sol}</i>
                  <span className="sol">{e.script}</span>
                </td>
                <td>{e.extra}{e.class && `-${e.class}`}</td>
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
