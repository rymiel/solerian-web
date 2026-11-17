import { ControlGroup, InputGroup, NumericInput } from "@blueprintjs/core";
import { useState } from "react";

import { b10Split, b10ToB12, b12toBijective, constructNumber } from "lang/numbers";

function Content() {
  const [num, setNum] = useState(0);

  const b10 = b10Split(num.toString());
  const b12 = b10 !== null ? b10ToB12(b10) : null;
  const biject = b12 !== null ? b12toBijective(b12) : null;
  const words = biject !== null ? constructNumber(biject) : null;

  return <>
    <ControlGroup vertical className="fit-width">
      <NumericInput value={num} onValueChange={setNum} />
      <InputGroup value={b12?.join("")} disabled />
      <InputGroup value={biject === 0 ? "0" : biject?.join("")} disabled />
      <p>{words}</p>
    </ControlGroup>
  </>;
}

export default function NumbersPage() {
  return <div className="page-content">
    <Content />
  </div>;
}
