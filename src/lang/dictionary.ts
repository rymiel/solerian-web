import { ApiData, ApiWord, entrySort, prefixSplit, uri } from "conlang-web-components";

import { AnyPattern, determinePattern, markStress, Part, partOfExtra } from "lang/extra";
import { FullEntry, OptionalEntryFields } from "providers/dictionary";
import { LangConfigData } from "providers/langConfig";

type ApiDictionary = Pick<ApiData, "words" | "meanings" | "sections">;

export interface LangEntryFields extends OptionalEntryFields {
  part: Part | null;
  class: AnyPattern | null;
  script: string;
}

function deriveFields(lang: LangConfigData, word: ApiWord) {
  const part = partOfExtra(word.extra);
  let cls: AnyPattern | null = null;
  if (part !== null) {
    cls = word.ex !== undefined ? "X" : (determinePattern(word.sol, part) ?? "?");
  }
  const script = lang.script(word.sol);
  const ipa = lang.soundChange.soundChange(word.sol, { markStress: markStress(word) });
  const disp = word.sol;
  return { part, class: cls, script, ipa, disp };
}

export function transformDictionary(lang: LangConfigData, d: ApiDictionary): FullEntry[] {
  const mMeanings = d.meanings.map((meaning) => {
    const [prefix, eng] = prefixSplit(meaning.eng);
    const sections = meaning.sections.map((s) => d.sections.find((j) => j.hash === s)!);
    return { ...meaning, eng, prefix, sections };
  });
  const mWords = d.words
    .map((word) => {
      const sections = word.sections.map((s) => d.sections.find((j) => j.hash === s)!);
      const meanings = word.meanings.map((s) => mMeanings.find((j) => j.hash === s)!);
      return { ...word, ...deriveFields(lang, word), sections, meanings };
    })
    .sort(entrySort);
  return mWords.map((word, idx) => {
    const matching = mWords.filter((j) => j.sol === word.sol);
    const link = matching.length === 1 ? uri`/w/${word.sol}` : uri`/w/${word.sol}/${matching.indexOf(word) + 1}`;
    return { ...word, link, index: idx + 1 };
  });
}
