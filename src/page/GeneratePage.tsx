import {
  Button,
  ControlGroup,
  Divider,
  NonIdealState,
  NumericInput,
  Spinner,
  SpinnerSize,
  Tag,
} from "@blueprintjs/core";
import { useContext, useEffect, useState } from "react";

import { GenerationInstance } from "lang/generation";
import { SoundChangeInstance } from "lang/soundChange";
import { LangConfig } from "providers/langConfig";
import { User } from "providers/user";
import { App } from "App";

import { validateCombined } from "./ValidationPage";

function Content({ soundChange, generation }: { soundChange: SoundChangeInstance; generation: GenerationInstance }) {
  const [current, setCurrent] = useState("");
  const [isValid, setValid] = useState<boolean | undefined>(undefined);
  const [sylls, setSylls] = useState(1);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (current === "") {
      setValid(undefined);
      const word = generation.generateWord(sylls);
      setCurrent(word);
      setHistory((h) => [word, ...h]);
    }
  }, [current, generation, sylls]);

  useEffect(() => {
    if (current !== "") {
      validateCombined([{ sol: current }], soundChange).then((fail) => setValid(fail.length === 0));
    }
  }, [current, soundChange]);

  const generate = () => setCurrent("");
  const changeSylls = (s: number) => {
    setSylls(s);
    generate();
  };

  return <div>
    <ControlGroup vertical className="fit-width">
      <NumericInput onValueChange={changeSylls} value={sylls} min={1} />
      <Button intent="primary" text="Generate" onClick={generate} />
    </ControlGroup>
    <Divider />
    <p>{current !== "" ? current : "..."}</p>
    <p>{current !== "" ? soundChange.soundChange(current, false) : "..."}</p>
    <p>
      {isValid === undefined ? (
        <Tag intent="warning">Checking validity...</Tag>
      ) : isValid ? (
        <Tag intent="success">Valid</Tag>
      ) : (
        <Tag intent="danger">Invalid</Tag>
      )}
    </p>
    <Divider />
    <ul>
      {history.map((i, j) => <li key={j} onClick={() => setCurrent(i)}>
        {i}
      </li>)}
    </ul>
  </div>;
}

export default function GeneratePage() {
  const { user } = useContext(User);
  const { soundChange, generation } = useContext(LangConfig);

  let content;

  if (!user) {
    content = <NonIdealState icon="error" title="You cannot access this page" />;
  } else if (soundChange === null || generation === null) {
    content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  } else {
    content = <div className="inter">
      <Content soundChange={soundChange} generation={generation} />
    </div>;
  }

  return App(content, "Generate");
}
