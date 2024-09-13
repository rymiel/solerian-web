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
  class: string | null;
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


export function DictionaryProvider({ children }: PropsWithChildren) {
  const [entries, setEntries] = useState<FullEntry[] | null>(null);

  const refresh = async () => {
    try {
      setEntries(
        (await apiFetch<RawEntry[]>("/new"))
          .map((i) => {
            const part = partOfExtra(i.extra);
            let cls = null;
            if (part !== null) {
              cls = determineType(i.sol, part) ?? "?";
            }
            const script = scriptMultiUnicode(i.sol);
            const ipa = soundChange(i.sol, markStress(i));
            return { ...i, class: cls, part, script, ipa };
          })
          .sort(entrySort)
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

export const entrySort = (a: RawEntry, b: RawEntry): number => {
  if (a.tag === undefined && b.tag !== undefined) return -1;
  if (a.tag !== undefined && b.tag === undefined) return 1;
  let f = compare(a.extra, b.extra);
  if (f !== 0) return f;
  for (let i = 0; i < a.meanings.length && i < b.meanings.length; i++) {
    let f = compare(a.meanings[i].eng, b.meanings[i].eng);
    if (f !== 0) return f;
  }
  return a.meanings.length - b.meanings.length;
};
