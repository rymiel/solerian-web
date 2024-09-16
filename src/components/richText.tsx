import reactStringReplace from "react-string-replace";
import { Dictionary } from "../dictionary";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { uri } from "..";

const LINK_WRAPPER = /(\[[^\]]+\])/g;
const SIMPLE_LINK = /\[([A-Za-z0-9_-]+)\]/;
const COMPLEX_LINK = /\[([A-Za-z0-9_-]+)\(([^)]+)\)\]/;

export function RichText({ text }: { text: string }) {
  const { entries } = useContext(Dictionary);
  const highlighted = reactStringReplace(text, LINK_WRAPPER, (m) => {
    let id;
    let label = null;
    let c = COMPLEX_LINK.exec(m);
    let s = SIMPLE_LINK.exec(m);
    if (c !== null) {
      id = c[1];
      label = c[2];
    } else if (s != null) {
      id = s[1];
    } else {
      return m;
    }

    const entry = entries?.find((i) => i.hash === id);
    if (entry === undefined) {
      return <a className="missing">{m}</a>;
    }

    return (
      <Link to={uri`/w/${entry.sol}`}>
        <i>{label ?? entry.sol}</i>
      </Link>
    );
  });

  return <p>{...highlighted}</p>;
}
