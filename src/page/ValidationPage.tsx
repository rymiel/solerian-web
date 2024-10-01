import { Button, NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { useContext, useState } from "react";
import { App, toastErrorHandler } from "../App";
import { User } from "../providers/user";
import { InflEntry, useInflEntries } from "../lang/inflEntries";
import { Dictionary, FullEntry } from "../providers/dictionary";
import { applyDestress, applyNormalize } from "../lang/inflection";
import { Link } from "react-router-dom";
import { ipaWithoutSoundChange } from "../lang/soundChange";
import { apiFetch } from "../api";

type Fail = [entry: FullEntry | InflEntry, reason: string];
type Lookup = [word: string, ipa: string];

async function validateLocal(list: FullEntry[] | InflEntry[]): Promise<Fail[]> {
  const fail: Fail[] = [];
  list.forEach((e) => {
    if (e.sol.includes("aa") || e.sol.includes("rr")) {
      fail.push([e, "invalid cluster"]);
    }
  });
  return fail;
}

async function validateRemote(list: FullEntry[] | InflEntry[]): Promise<Fail[]> {
  const fail: Fail[] = [];
  const lookup: Lookup[] = list.map((i) => [i.sol, ipaWithoutSoundChange(i.sol)]);
  try {
    const failIdx = await apiFetch<number[]>("/validate", "POST", JSON.stringify(lookup));
    failIdx.forEach((f) => {
      const e = list[f];
      if (e.sol.includes("-")) {
        return; // Skip all affixes for now
      }
      fail.push([e, "invalid word"]);
    });
  } catch (e) {
    toastErrorHandler(e);
  }
  return fail;
}

async function validate(raw: FullEntry[], infl: InflEntry[]): Promise<Fail[]> {
  const fail: Fail[] = [];

  raw.forEach((entry) => {
    if (entry.extra.includes("NAME")) {
      return; // Skip onomatonyms for now
    }
    if (entry.sol.includes("-")) {
      return; // Skip affixes for now
    }
    const norm = applyNormalize(entry.sol);
    if (entry.extra === "conj." || entry.extra === "postpos.") {
      // TODO(rymiel): special normalization for these words which are allowed to lack stress?
      if (norm.replaceAll("à", "a") === entry.sol) {
        return; // Allow conjunctions and postpositions to have no full vowels
      }
      if (applyDestress(norm) === entry.sol) {
        return; // Allow conjunctions and postpositions to not mark stress on the first syllable
      }
    }
    if (norm === entry.sol) {
      return;
    }

    fail.push([entry, "not normalized"]);
  });

  fail.push(...(await validateLocal(raw)));
  fail.push(...(await validateLocal(infl)));
  fail.push(...(await validateRemote(raw)));
  fail.push(...(await validateRemote(infl)));

  return fail;
}

export default function ValidatePage() {
  const { user } = useContext(User);
  const { entries } = useContext(Dictionary);
  const infl = useInflEntries()?.filter((i) => i.old === false);
  const [fail, setFail] = useState<Fail[] | null>(null);
  const [isLoading, setLoading] = useState(false);

  let header;
  let footer;

  if (!user) {
    footer = <NonIdealState icon="error" title="You cannot access this page" />;
  } else if (entries && infl) {
    header = (
      <Button
        intent="success"
        text={`Run validation (${entries.length + infl.length} entries)`}
        fill
        disabled={isLoading}
        loading={isLoading}
        onClick={() => {
          setFail(null);
          setLoading(true);
          validate(entries, infl).then((f) => {
            setFail(f);
            setLoading(false);
          });
        }}
      />
    );
    if (fail !== null && fail.length === 0) {
      footer = <NonIdealState icon="tick-circle" title="All words passed validation" />;
    } else if (fail !== null) {
      footer = (
        <ul>
          {fail.map((f) => {
            const [e, reason] = f;
            const key = "hash" in e ? e.hash : `"${e.original.hash}"-${e.form}`;
            return (
              <li>
                <Link to={`/reverse/${e.sol}`} key={key}>
                  {"hash" in e ? `"${e.sol}"` : `"${e.sol}" (${e.form} of ${e.original.sol})`}
                </Link>
                : {reason}
              </li>
            );
          })}
        </ul>
      );
    }
  } else {
    footer = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  }

  return App(
    <div className="inter">
      {header}
      {footer}
    </div>,
    "Validate"
  );
}
