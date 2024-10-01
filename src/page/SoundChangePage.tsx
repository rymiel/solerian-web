import {
  Button,
  CheckboxCard,
  Code,
  FormGroup,
  HTMLTable,
  NonIdealState,
  Spinner,
  SpinnerSize,
  Tag,
  TextArea,
} from "@blueprintjs/core";
import React, { useContext, useState } from "react";
import reactStringReplace from "react-string-replace";
import { App, AppToaster } from "../App";
import { markStress } from "../lang/extra";
import { InflEntry, useInflEntries } from "../lang/inflEntries";
import { Change, CONFIG, singleWordSoundChangeSteps, soundChange, SoundChangeInstance } from "../lang/soundChange";
import { Dictionary, FullEntry } from "../providers/dictionary";
import { User } from "../providers/user";

function intersperse(arr: React.ReactNode[], w: React.ReactNode): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  arr.forEach((i, j) => {
    if (j > 0) {
      out.push(w);
    }
    out.push(i);
  });
  return out;
}

function tags(s: string | null): React.ReactNode {
  if (s === null) return null;
  if (s === "")
    return (
      <Tag intent="danger" minimal>
        ∅
      </Tag>
    );
  return reactStringReplace(s, /(\{\w\})/, (m, i) => (
    <Tag key={i} intent="primary" minimal>
      {m.slice(1, -1)}
    </Tag>
  ));
}

function SoundChange({ change }: { change: Change }) {
  const [from, to, left, right] = change.map(tags);
  if (left === null && right === null) {
    return (
      <>
        <Code>{from}</Code> → <Code>{to}</Code>
      </>
    );
  } else {
    return (
      <>
        <Code>{from}</Code> → <Code>{to}</Code> / {left && <Code>{left}</Code>} _ {right && <Code>{right}</Code>}
      </>
    );
  }
}

function soundChangeToString(change: Change): string {
  let [from, to, left, right] = change;
  from = from === "" ? "∅" : from;
  to = to === "" ? "∅" : to;
  if (left === null && right === null) {
    return `${from} → ${to}`;
  } else {
    left = left === null ? "" : ` ${left}`;
    right = right === null ? "" : ` ${right}`;
    return `${from} → ${to} /${left} _${right}`;
  }
}

function soundChangeFromString(s: string): Change {
  const [action, context] = s.split("/").map((i) => i.trim()) as [string, string?];
  const [from, to] = action
    .split("→")
    .map((i) => i.trim())
    .map((i) => (i === "∅" ? "" : i));
  let left = null;
  let right = null;
  if (context !== undefined) {
    [left, right] = context
      .split("_")
      .map((i) => i.trim())
      .map((i) => (i === "" ? null : i));
  }
  return [from, to, left, right];
}

function StepList({ steps }: { steps: string[] }) {
  return steps.length > 1 ? (
    intersperse(
      steps.map((v, i) => <span key={i}>{v}</span>),
      " → ",
    )
  ) : (
    <i className="center">no changes</i>
  );
}

function Content({ rawEntries, inflEntries }: { rawEntries: FullEntry[]; inflEntries: InflEntry[] }) {
  const [rules, setRules] = useState(CONFIG.changes.map(soundChangeToString).join("\n"));
  const [changes, setChanges] = useState(CONFIG.changes);
  const [localInstance, setLocalInstance] = useState<SoundChangeInstance | null>(null);
  const [ignoreNoChanges, setIgnoreNoChanges] = useState(false);
  const [useInfl, setUseInfl] = useState(false);

  const entries = useInfl ? inflEntries : rawEntries;

  const onChange = (text: string) => {
    setRules(text);
    setChanges(text.trim().split("\n").map(soundChangeFromString));
  };

  const makeInstance = () => {
    setLocalInstance(new SoundChangeInstance({ ...CONFIG, changes: changes }));
  };

  const clearInstance = () => {
    setLocalInstance(null);
    setRules(CONFIG.changes.map(soundChangeToString).join("\n"));
    setChanges(CONFIG.changes);
  };

  const copyRules = () => {
    navigator.clipboard
      .writeText(JSON.stringify(changes))
      .then(() => AppToaster.then((toaster) => toaster.show({ intent: "success", message: "Copied to clipboard" })));
  };

  const key = (e: FullEntry | InflEntry) => ("hash" in e ? e.hash : `"${e.original.hash}"-${e.form}`);

  return (
    <div className="flex-row">
      <div>
        <div className="flex-row">
          <div>
            {changes.map((c, i) => (
              <span key={i}>
                <SoundChange change={c} />
                <br />
              </span>
            ))}
          </div>
          <TextArea style={{ minWidth: "300px" }} onChange={(e) => onChange(e.currentTarget.value)} value={rules} />
        </div>
        <Button text="Test changes" intent="success" fill onClick={makeInstance} />
        <Button text="Forget changes" intent="danger" fill onClick={clearInstance} />
        <Button text="Copy rules" intent="primary" fill onClick={copyRules} />
      </div>
      <div className="margin-auto">
        <FormGroup>
          <CheckboxCard compact onChange={(e) => setIgnoreNoChanges(e.currentTarget.checked)}>
            Ignore <i>no changes</i>
          </CheckboxCard>
          <CheckboxCard compact onChange={(e) => setUseInfl(e.currentTarget.checked)}>
            Use inflected entries
          </CheckboxCard>
        </FormGroup>
        <HTMLTable compact striped>
          <thead>
            <tr>
              <th>Word</th>
              <th>Changes</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {localInstance === null
              ? entries.map((e) => {
                  const steps = singleWordSoundChangeSteps(e.sol, markStress(e));
                  if (ignoreNoChanges && steps.length <= 1) return undefined;
                  return (
                    <tr key={key(e)}>
                      <td>{e.sol}</td>
                      <td className="space-between">
                        <StepList steps={steps} />
                      </td>
                      <td>{soundChange(e.sol, markStress(e))}</td>
                    </tr>
                  );
                })
              : entries.map((e) => {
                  const oldSteps = singleWordSoundChangeSteps(e.sol, markStress(e));
                  const newSteps = localInstance.singleWordSoundChangeSteps(e.sol, markStress(e));
                  if (oldSteps.toString() === newSteps.toString()) return undefined;
                  return (
                    <tr key={key(e)}>
                      <td>{e.sol}</td>
                      <td>
                        <p className="space-between">
                          <StepList steps={oldSteps} />
                        </p>
                        <p className="space-between">
                          <StepList steps={newSteps} />
                        </p>
                      </td>
                      <td>
                        <p>{soundChange(e.sol, markStress(e))}</p>
                        <p>{localInstance.soundChange(e.sol, markStress(e))}</p>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </HTMLTable>
      </div>
    </div>
  );
}

export default function SoundChangePage() {
  const { user } = useContext(User);
  const { entries } = useContext(Dictionary);
  const infl = useInflEntries()?.filter((i) => i.old === false);

  let content;

  if (!user) {
    content = <NonIdealState icon="error" title="You cannot access this page" />;
  } else if (entries === null || infl === undefined) {
    content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  } else {
    content = (
      <div className="inter">
        <Content rawEntries={entries} inflEntries={infl} />
      </div>
    );
  }

  return App(content, "Sound changes");
}
