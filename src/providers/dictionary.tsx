import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";

import { determineType, markStress, Part, partOfExtra } from "lang/extra";
import { scriptMultiUnicode } from "lang/script";
import { uri } from "lang/util";
import { LangConfig } from "providers/langConfig";
import { ApiDictionary, apiFetch, ApiMeaning, ApiSection, ApiWord } from "api";
import { toastErrorHandler } from "App";

export interface SortableEntry extends Omit<ApiWord, "meanings" | "sections"> {
  meanings: FullMeaning[];
}
export interface FullEntry extends SortableEntry {
  part: Part | null;
  script: string;
  ipa: string;
  class: string | null;
  link: string;

  meanings: FullMeaning[];
  sections: FullSection[];
}

export interface FullMeaning extends Omit<ApiMeaning, "sections"> {
  sections: FullSection[];
}

export interface FullSection extends ApiSection {}

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
  const { soundChange } = useContext(LangConfig);

  const refresh = useCallback(async () => {
    if (soundChange === null) return;
    try {
      const d = await apiFetch<ApiDictionary>("/new");
      const mMeanings = d.meanings.map((i) => ({
        ...i,
        sections: i.sections.map((s) => d.sections.find((j) => j.hash === s)!),
      }));
      const mWords = d.words
        .map((i) => {
          const part = partOfExtra(i.extra);
          let cls = null;
          if (part !== null) {
            cls = i.ex !== undefined ? "X" : (determineType(i.sol, part) ?? "?");
          }
          const script = scriptMultiUnicode(i.sol);
          const ipa = soundChange.soundChange(i.sol, markStress(i));
          const sections = i.sections.map((s) => d.sections.find((j) => j.hash === s)!);
          const meanings = i.meanings.map((s) => mMeanings.find((j) => j.hash === s)!);
          return { ...i, class: cls, part, script, ipa, sections, meanings };
        })
        .sort(entrySort);
      const sWords = mWords.map((i) => {
        const matching = mWords.filter((j) => j.sol === i.sol);
        if (matching.length === 1) {
          return { ...i, link: uri`/w/${i.sol}` };
        }
        const index = matching.indexOf(i);
        console.log(i, matching, index);
        return { ...i, link: uri`/w/${i.sol}/${index + 1}` };
      });
      setEntries(sWords);
    } catch (error) {
      toastErrorHandler(error);
    }
  }, [soundChange]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <Dictionary.Provider value={{ entries, refresh }}>{children}</Dictionary.Provider>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const compare = (a: string, b: string): number => (((a as any) > b) as any) - (((a as any) < b) as any);

export const entrySort = (a: SortableEntry, b: SortableEntry): number => {
  if (a.tag === undefined && b.tag !== undefined) return -1;
  if (a.tag !== undefined && b.tag === undefined) return 1;
  let f = compare(a.extra, b.extra);
  if (f !== 0) return f;
  for (let i = 0; i < a.meanings.length && i < b.meanings.length; i++) {
    f = compare(a.meanings[i]?.eng ?? "", b.meanings[i]?.eng ?? "");
    if (f !== 0) return f;
  }
  return a.meanings.length - b.meanings.length;
};
