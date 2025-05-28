import { ApiData, uri } from "conlang-web-components";

import { AnyPattern, determinePattern, markStress, partOfExtra } from "lang/extra";
import { scriptMultiUnicode } from "lang/script";
import { FullEntry, SortableEntry } from "providers/dictionary";
import { LangConfigData } from "providers/langConfig";

type ApiDictionary = Pick<ApiData, "words" | "meanings" | "sections">;

export function transformDictionary(lang: LangConfigData, d: ApiDictionary): FullEntry[] {
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
      const ipa = lang.soundChange.soundChange(word.sol, markStress(word));
      const sections = word.sections.map((s) => d.sections.find((j) => j.hash === s)!);
      const meanings = word.meanings.map((s) => mMeanings.find((j) => j.hash === s)!);
      return { ...word, class: cls, part, script, ipa, sections, meanings };
    })
    .sort(entrySort);
  return mWords.map((word, idx) => {
    const matching = mWords.filter((j) => j.sol === word.sol);
    const link = matching.length === 1 ? uri`/w/${word.sol}` : uri`/w/${word.sol}/${matching.indexOf(word) + 1}`;
    return { ...word, link, index: idx + 1 };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const compare = (a: string, b: string): number => (((a as any) > b) as any) - (((a as any) < b) as any);

const entrySort = (a: SortableEntry, b: SortableEntry): number => {
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
