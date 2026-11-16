import { ApiWord, DerivedFields, LangConfigData } from "conlang-web-components";

import { AnyPattern, determinePattern, markStress, Part, partOfExtra } from "lang/extra";

declare module "conlang-web-components" {
  interface LangEntryFields {
    part: Part | null;
    class: AnyPattern | null;
    script: string;
  }
}

export function deriveFields(lang: LangConfigData, word: ApiWord): DerivedFields {
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
