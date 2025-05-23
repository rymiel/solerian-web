import { ApiDictionary, ApiMeaning, ApiSection, ApiWord, uri } from "conlang-web-components";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from "react";

import { AnyPattern, determinePattern, markStress, Part, partOfExtra } from "lang/extra";
import { scriptMultiUnicode } from "lang/script";
import { LangConfig } from "providers/langConfig";
import { API } from "api";
import { toastErrorHandler } from "App";

export interface SortableEntry extends Omit<ApiWord, "meanings" | "sections"> {
  meanings: FullMeaning[];
}
export interface FullEntry extends SortableEntry {
  part: Part | null;
  script: string;
  ipa: string;
  class: AnyPattern | null;
  link: string;
  index: number;

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
  const etag = useRef(localStorage.getItem("etag") ?? "undefined");
  const { soundChange } = useContext(LangConfig);

  const refresh = useCallback(async () => {
    if (soundChange === null) return;
    try {
      const d = await API.lang<ApiDictionary>("/data");
      const mMeanings = d.meanings.map((i) => ({
        ...i,
        sections: i.sections.map((s) => d.sections.find((j) => j.hash === s)!),
      }));
      const mWords = d.words
        .map((word) => {
          const part = partOfExtra(word.extra);
          let cls: AnyPattern | null = null;
          if (part !== null) {
            cls = word.ex !== undefined ? "X" : (determinePattern(word.sol, part) ?? "?");
          }
          const script = scriptMultiUnicode(word.sol);
          const ipa = soundChange.soundChange(word.sol, markStress(word));
          const sections = word.sections.map((s) => d.sections.find((j) => j.hash === s)!);
          const meanings = word.meanings.map((s) => mMeanings.find((j) => j.hash === s)!);
          return { ...word, class: cls, part, script, ipa, sections, meanings };
        })
        .sort(entrySort);
      const sWords = mWords.map((word, idx) => {
        const matching = mWords.filter((j) => j.sol === word.sol);
        const link = matching.length === 1 ? uri`/w/${word.sol}` : uri`/w/${word.sol}/${matching.indexOf(word) + 1}`;
        return { ...word, link, index: idx + 1 };
      });
      setEntries(sWords);

      try {
        const newEtag = d.etag ?? "undefined";
        if (newEtag != etag.current) {
          console.log(`Broadcasting new dictionary version: ${etag.current} -> ${newEtag}`);
          etag.current = newEtag;
          localStorage.setItem("etag", newEtag);
        }
      } catch (err) {
        if (err instanceof DOMException) {
          toastErrorHandler(new Error(`Failed to sync: ${err.name}: ${err.message}`));
        } else {
          throw err;
        }
      }
    } catch (error) {
      toastErrorHandler(error);
    }
  }, [soundChange]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handle = (e: StorageEvent) => {
      if (e.key === "etag" && e.newValue !== etag.current) {
        console.log(`Synced new dictionary version: ${etag.current} -> ${e.newValue}`);
        refresh();
      }
    };
    addEventListener("storage", handle);
    return () => removeEventListener("storage", handle);
  }, [refresh]);

  // TODO: remove me later
  useEffect(() => {
    localStorage.removeItem("entries");
  }, []);

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
