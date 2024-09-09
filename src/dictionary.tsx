import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { apiFetch, RawEntry } from "./api";
import { determineType, markStress, Part, partOfExtra } from "./lang/extra";
import { toastErrorHandler } from "./App";
import { scriptMultiUnicode } from "./lang/script";
import { soundChange } from "./lang/soundChange";

export interface FullEntry extends RawEntry {
  part: Part | null;
  script: string;
  ipa: string;
  tag: string | null;
}

interface DictionaryData {
  entries: FullEntry[] | null;
  refresh: () => void;
}

export const Dictionary = createContext<DictionaryData>({
  entries: null,
  refresh: () => {
    throw new Error("No dictionary context provided");
  },
});

function splitTag(eng: string): [tag: string | null, eng: string] {
  const hasTag = eng.startsWith("{");
  if (!hasTag) {
    return [null, eng];
  }

  const close = eng.indexOf("}");
  const tag = eng.slice(1, close);
  const rest = eng.slice(close + 1);

  return [tag, rest];
}

export function DictionaryProvider({ children }: PropsWithChildren) {
  const [entries, setEntries] = useState<FullEntry[] | null>(null);

  const refresh = async () => {
    try {
      setEntries(
        (await apiFetch<RawEntry[]>("/raw"))
          .map((i) => {
            let extra = i.extra;
            const part = partOfExtra(i.extra);
            if (part !== null) {
              const cls = determineType(i.sol, part) ?? "?";
              extra = `${i.extra}-${cls}`;
            }
            const [tag, eng] = splitTag(i.eng);
            const script = scriptMultiUnicode(i.sol);
            const ipa = soundChange(i.sol, markStress(i));
            return { ...i, extra, part, tag, eng, script, ipa };
          })
          .sort(fullEntrySort)
      );
    } catch (error) {
      toastErrorHandler(error);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return <Dictionary.Provider value={{ entries, refresh }}>{children}</Dictionary.Provider>;
}

const compare = (a: string, b: string): number => (((a as any) > b) as any) - (((a as any) < b) as any);

export const rawEntrySort = (a: RawEntry, b: RawEntry): number => {
  let f = compare(a.extra, b.extra);
  if (f !== 0) return f;
  return compare(a.eng, b.eng);
};

export const fullEntrySort = (a: FullEntry, b: FullEntry): number => {
  if (a.tag === null && b.tag !== null) return -1;
  let f = compare(a.extra.split("-")[0], b.extra.split("-")[0]);
  if (f !== 0) return f;
  return compare(a.eng, b.eng);
};
