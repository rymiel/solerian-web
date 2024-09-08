import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { apiFetch, RawEntry } from "./api";
import { defaultEntrySort, determineType, Part, partOfExtra } from "./lang/extra";
import { toastErrorHandler } from "./App";
import { scriptMultiUnicode } from "./lang/script";
import { soundChange } from "./lang/soundChange";

export interface FullEntry extends RawEntry {
  part: Part | null;
  script: string;
  ipa: string;
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
        (await apiFetch<RawEntry[]>("/raw")).sort(defaultEntrySort).map((i) => {
          let extra = i.extra;
          const part = partOfExtra(i.extra);
          if (part !== null) {
            const cls = determineType(i.sol, part) ?? "?";
            extra = `${i.extra}-${cls}`;
          }
          return { ...i, extra, part, script: scriptMultiUnicode(i.sol), ipa: soundChange(i) };
        })
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
