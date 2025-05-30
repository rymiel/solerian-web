import { Button, NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { useTitle } from "conlang-web-components";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";

import { applyDestress, applyNormalize } from "lang/inflection";
import { InflEntry, useInflEntries } from "lang/inflEntries";
import { SoundChangeInstance } from "lang/soundChange";
import { Dictionary, FullEntry } from "providers/dictionary";
import { LangConfig } from "providers/langConfig";
import { API } from "api";
import { toastErrorHandler } from "App";

interface MinimalWord {
  sol: string;
}
type Fail<T extends MinimalWord = FullEntry | InflEntry> = [entry: T, reason: string];
type Lookup = [word: string, ipa: string];

async function validateLocal<T extends MinimalWord>(list: T[]): Promise<Fail<T>[]> {
  const fail: Fail<T>[] = [];
  list.forEach((e) => {
    if (e.sol.includes("aa") || e.sol.includes("rr")) {
      fail.push([e, "invalid cluster"]);
    }
  });
  return fail;
}

async function validateRemote<T extends MinimalWord>(list: T[], soundChange: SoundChangeInstance): Promise<Fail<T>[]> {
  const fail: Fail<T>[] = [];
  const lookup: Lookup[] = list.map((i) => [i.sol, soundChange.ipaWithoutSoundChange(i.sol)]);
  try {
    const failIdx = await API.lang<number[]>("/validate", "POST", JSON.stringify(lookup));
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

export async function validateCombined<T extends MinimalWord>(
  list: T[],
  soundChange: SoundChangeInstance,
): Promise<Fail<T>[]> {
  return (await Promise.all([validateLocal(list), validateRemote(list, soundChange)])).flat();
}

async function validate(raw: FullEntry[], infl: InflEntry[], soundChange: SoundChangeInstance): Promise<Fail[]> {
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
  fail.push(...(await validateRemote([...raw, ...infl], soundChange)));

  return fail;
}

export default function ValidatePage() {
  const { entries } = useContext(Dictionary);
  const lang = useContext(LangConfig);
  const infl = useInflEntries()?.filter((i) => i.old === false);
  const [fail, setFail] = useState<Fail[] | null>(null);
  const [isLoading, setLoading] = useState(false);
  useTitle("Validate");

  let header;
  let footer;

  if (entries && infl && lang) {
    header = <Button
      intent="success"
      text={`Run validation (${entries.length + infl.length} entries)`}
      fill
      disabled={isLoading}
      loading={isLoading}
      onClick={() => {
        setFail(null);
        setLoading(true);
        validate(entries, infl, lang.soundChange).then((f) => {
          setFail(f);
          setLoading(false);
        });
      }}
    />;
    if (fail !== null && fail.length === 0) {
      footer = <NonIdealState icon="tick-circle" title="All words passed validation" />;
    } else if (fail !== null) {
      footer = <ul>
        {fail.map((f) => {
          const [e, reason] = f;
          const key = "hash" in e ? e.hash : `"${e.original.hash}"-${e.form}`;
          return <li key={key}>
            <Link to={`/reverse/${e.sol}`}>
              {"hash" in e ? `"${e.sol}"` : `"${e.sol}" (${e.form} of ${e.original.sol})`}
            </Link>
            : {reason}
          </li>;
        })}
      </ul>;
    }
  } else {
    footer = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  }

  return <div className="inter">
    {header}
    {footer}
  </div>;
}
