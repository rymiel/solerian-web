import { ApiData, entrySort, uri } from "conlang-web-components";

import { AnyPattern, determinePattern, markStress, partOfExtra } from "lang/extra";
import { scriptMultiUnicode } from "lang/script";
import { FullEntry } from "providers/dictionary";
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
