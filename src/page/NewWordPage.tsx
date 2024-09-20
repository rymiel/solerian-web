import { InputGroup, Button, NonIdealState } from "@blueprintjs/core";
import { useContext, useState } from "react";
import { apiFetch } from "../api";
import { Dictionary } from "../dictionary";
import { useNavigate } from "react-router-dom";
import { uri } from "..";
import { User } from "../user";
import { App } from "../App";

function Editor() {
  const dict = useContext(Dictionary);
  const navigate = useNavigate();
  const [sol, setSol] = useState("");
  const [extra, setExtra] = useState("");
  const [eng, setEng] = useState("");

  const submit = () => {
    apiFetch<string>("/entry", "POST", { sol, extra, eng }).then((id) => {
      dict.refresh();
      navigate(uri`/edit/${id}`);
    });
  };

  return (
    <div className="inter">
      <p>Creating new entry.</p>
      <InputGroup onValueChange={setSol} defaultValue={sol} placeholder="Solerian" />
      <InputGroup onValueChange={setExtra} defaultValue={extra} placeholder="Extra" />
      <InputGroup onValueChange={setEng} defaultValue={eng} placeholder="Translation" />
      <Button fill intent="success" text="Submit" onClick={submit} />
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

  return App(content, "Edit");
}
