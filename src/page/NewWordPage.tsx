import {
  Button,
  Checkbox,
  Classes,
  ControlGroup,
  FormGroup,
  HTMLSelect,
  InputGroup,
  NonIdealState,
  Tag,
} from "@blueprintjs/core";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { NounInfo } from "components/nounComponents";
import { PronounInfo } from "components/pronounComponents";
import { VerbInfo } from "components/verbComponents";
import { determineType, Part, partOfExtra, PARTS_OF_SPEECH, separateRoot } from "lang/extra";
import { FORM_NAMES, InflectableEntry } from "lang/inflection";
import { uri } from "lang/util";
import { Dictionary } from "providers/dictionary";
import { User } from "providers/user";
import { apiFetch } from "api";
import { App } from "App";

function Editor() {
  const dict = useContext(Dictionary);
  const navigate = useNavigate();
  const [sol, setSol] = useState("");
  const [extra, setExtra] = useState("");
  const [eng, setEng] = useState("");
  const [showEx, setShowEx] = useState(false);
  const [exForms, setExForms] = useState<string[]>([]);
  const part = partOfExtra(extra);

  const entry: InflectableEntry = {
    part,
    extra,
    sol,
    ex: exForms.length === 0 ? undefined : exForms.join(","),
  };
  const valid = (part === null ? false : separateRoot(sol, part) !== null) || exForms.length > 0;

  useEffect(() => {
    if (showEx) {
      setExForms(part === null ? [] : Array(FORM_NAMES[part].length * 2).fill(""));
    } else {
      setExForms([]);
    }
  }, [part, showEx]);

  const submit = () => {
    const ex = exForms.length === 0 ? undefined : exForms.join(",");
    apiFetch<string>("/entry", "POST", { sol, extra, eng, ex }).then((id) => {
      dict.refresh();
      navigate(uri`/edit/${id}`);
    });
  };

  return (
    <div className="inter">
      <p>Creating new entry.</p>
      <ControlGroup vertical className="fit-width">
        <InputGroup onValueChange={setSol} placeholder="Solerian" />
        <HTMLSelect onChange={(e) => setExtra(e.currentTarget.value)} defaultValue={""} fill>
          <option value="">Extra</option>
          {Object.entries(PARTS_OF_SPEECH).map(([k, v]) => {
            const p = partOfExtra(k);
            const cls = p !== null ? determineType(sol, p) : null;
            return (
              <option key={k} value={k}>
                {v.replace("%", cls ?? "?")}
              </option>
            );
          })}
        </HTMLSelect>
        <InputGroup onValueChange={setEng} placeholder="Translation" />
        <Button fill intent="success" text="Submit" onClick={submit} />
        <Checkbox onChange={(e) => setShowEx(e.currentTarget.checked)} label="Exceptional" />
      </ControlGroup>
      {showEx && part === null && (
        <p className={Classes.TEXT_MUTED}>
          <i>This "Extra" value can't be exceptional.</i>
        </p>
      )}
      {showEx && part !== null && (
        <div className="flex-row">
          <div>
            {FORM_NAMES[part].map((i, j) => (
              <FormGroup key={i} label={i} inline className="compact">
                <InputGroup
                  placeholder={i}
                  onValueChange={(v) => setExForms((e) => e.map((f, fi) => (fi === j ? v : f)))}
                />
              </FormGroup>
            ))}
          </div>
          <div>
            {FORM_NAMES[part].map((i, j) => (
              <FormGroup key={i} label={`old ${i}`} inline className="compact">
                <InputGroup
                  placeholder={`old ${i}`}
                  onValueChange={(v) =>
                    setExForms((e) => e.map((f, fi) => (fi === j + FORM_NAMES[part].length ? v : f)))
                  }
                />
              </FormGroup>
            ))}
          </div>
        </div>
      )}
      {valid && part === Part.Noun && <NounInfo entry={entry} />}
      {valid && part === Part.Verb && <VerbInfo entry={entry} />}
      {valid && part === Part.Pronoun && <PronounInfo entry={entry} />}
      {!valid && part !== null && (
        <Tag large intent="danger">
          Invalid form
        </Tag>
      )}
    </div>
  );
}

export default function NewWordPage() {
  const { user } = useContext(User);

  let content;

  if (!user) {
    content = <NonIdealState icon="error" title="You cannot access this page" />;
  } else {
    content = (
      <div className="inter">
        <Editor />
      </div>
    );
  }

  return App(content, "New");
}
